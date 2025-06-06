import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InterviewRecorder } from '../interview-recorder';
import { useMediaCapture } from '~/hooks/useMediaCapture';
import { usePermissions } from '~/hooks/usePermissions';
import { useMediaUpload } from '~/hooks/useMediaUpload';

// Mock the hooks
jest.mock('~/hooks/useMediaCapture');
jest.mock('~/hooks/usePermissions');
jest.mock('~/hooks/useMediaUpload');
jest.mock('~/lib/media-compatibility');

const mockUseMediaCapture = useMediaCapture as jest.MockedFunction<typeof useMediaCapture>;
const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;
const mockUseMediaUpload = useMediaUpload as jest.MockedFunction<typeof useMediaUpload>;

// Mock media compatibility
jest.mock('~/lib/media-compatibility', () => ({
  validateRecordingSupport: () => ({
    isSupported: true,
    missingFeatures: [],
    warnings: [],
  }),
  getBrowserCapabilities: () => ({
    hasMediaRecorder: true,
    hasGetDisplayMedia: true,
    hasGetUserMedia: true,
    supportedVideoMimeTypes: ['video/webm'],
    supportedAudioMimeTypes: ['audio/webm'],
    isChromium: true,
    isFirefox: false,
    isSafari: false,
    isEdge: false,
  }),
}));

describe('InterviewRecorder', () => {
  const mockProps = {
    interviewId: 'test-interview-id',
    onRecordingComplete: jest.fn(),
    onRecordingStart: jest.fn(),
    onRecordingStop: jest.fn(),
  };

  const mockMediaCapture = {
    state: 'idle' as const,
    isRecording: false,
    isPaused: false,
    stats: { duration: 0, size: 0, chunks: 0 },
    error: null,
    recordedChunks: [],
    recordedBlob: null,
    previewUrl: null,
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    pauseRecording: jest.fn(),
    resumeRecording: jest.fn(),
    clearRecording: jest.fn(),
    getSupportedMimeTypes: jest.fn(() => ['video/webm']),
    getOptimalMimeType: jest.fn(() => 'video/webm'),
    downloadRecording: jest.fn(),
    clearError: jest.fn(),
  };

  const mockPermissions = {
    permissions: {
      camera: 'prompt' as const,
      microphone: 'prompt' as const,
      screen: 'prompt' as const,
    },
    isLoading: false,
    error: null,
    requestCameraPermission: jest.fn(),
    requestMicrophonePermission: jest.fn(),
    requestScreenPermission: jest.fn(),
    requestAllPermissions: jest.fn(),
    checkPermissions: jest.fn(),
    clearError: jest.fn(),
  };

  const mockUpload = {
    uploadState: {
      status: 'idle' as const,
      progress: { loaded: 0, total: 0, percentage: 0 },
      error: null,
      recordingId: null,
    },
    uploadRecording: jest.fn(),
    cancelUpload: jest.fn(),
    clearUpload: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMediaCapture.mockReturnValue(mockMediaCapture);
    mockUsePermissions.mockReturnValue(mockPermissions);
    mockUseMediaUpload.mockReturnValue(mockUpload);
  });

  it('should render interview recorder with initial state', () => {
    render(<InterviewRecorder {...mockProps} />);

    expect(screen.getByText('Interview Recording')).toBeInTheDocument();
    expect(screen.getByText('Start Recording')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start recording/i })).toBeEnabled();
  });

  it('should start recording when button is clicked', async () => {
    mockPermissions.requestScreenPermission.mockResolvedValue(true);
    mockPermissions.requestMicrophonePermission.mockResolvedValue(true);
    mockMediaCapture.startRecording.mockResolvedValue(true);

    render(<InterviewRecorder {...mockProps} />);

    const startButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockPermissions.requestScreenPermission).toHaveBeenCalled();
      expect(mockPermissions.requestMicrophonePermission).toHaveBeenCalled();
      expect(mockMediaCapture.startRecording).toHaveBeenCalledWith({
        type: 'screen_and_audio',
        maxDuration: 1800000, // 30 minutes in milliseconds
        timeslice: 1000,
      });
    });
  });

  it('should show recording controls when recording is active', () => {
    mockUseMediaCapture.mockReturnValue({
      ...mockMediaCapture,
      state: 'recording',
      isRecording: true,
      stats: { duration: 5000, size: 1024000, chunks: 5 },
    });

    render(<InterviewRecorder {...mockProps} />);

    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('Stop Recording')).toBeInTheDocument();
    expect(screen.getByText('00:05')).toBeInTheDocument(); // Duration display
    expect(screen.getByText('1.0 KB')).toBeInTheDocument(); // Size display
  });

  it('should show resume and stop controls when paused', () => {
    mockUseMediaCapture.mockReturnValue({
      ...mockMediaCapture,
      state: 'paused',
      isPaused: true,
      stats: { duration: 5000, size: 1024000, chunks: 5 },
    });

    render(<InterviewRecorder {...mockProps} />);

    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.getByText('Stop Recording')).toBeInTheDocument();
  });

  it('should handle permission errors gracefully', async () => {
    mockPermissions.requestScreenPermission.mockResolvedValue(false);
    mockUsePermissions.mockReturnValue({
      ...mockPermissions,
      error: {
        type: 'permission_denied',
        message: 'Screen capture was denied',
        permission: 'screen',
      },
    });

    render(<InterviewRecorder {...mockProps} />);

    expect(screen.getByText('Screen capture was denied')).toBeInTheDocument();
  });

  it('should show upload progress when uploading', () => {
    mockUseMediaCapture.mockReturnValue({
      ...mockMediaCapture,
      state: 'stopped',
      recordedBlob: new Blob(['test'], { type: 'video/webm' }),
    });

    mockUseMediaUpload.mockReturnValue({
      ...mockUpload,
      uploadState: {
        status: 'uploading',
        progress: { loaded: 512000, total: 1024000, percentage: 50 },
        error: null,
        recordingId: null,
      },
    });

    render(<InterviewRecorder {...mockProps} />);

    expect(screen.getByText('Uploading...')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('512.0 KB / 1.0 MB')).toBeInTheDocument();
  });

  it('should show upload complete status', () => {
    mockUseMediaCapture.mockReturnValue({
      ...mockMediaCapture,
      state: 'stopped',
      recordedBlob: new Blob(['test'], { type: 'video/webm' }),
    });

    mockUseMediaUpload.mockReturnValue({
      ...mockUpload,
      uploadState: {
        status: 'completed',
        progress: { loaded: 1024000, total: 1024000, percentage: 100 },
        error: null,
        recordingId: 'test-recording-id',
      },
    });

    render(<InterviewRecorder {...mockProps} />);

    expect(screen.getByText('Upload Complete')).toBeInTheDocument();
  });

  it('should allow manual upload when auto-upload is disabled', () => {
    mockUseMediaCapture.mockReturnValue({
      ...mockMediaCapture,
      state: 'stopped',
      recordedBlob: new Blob(['test'], { type: 'video/webm' }),
    });

    render(<InterviewRecorder {...mockProps} autoUpload={false} />);

    expect(screen.getByText('Upload Recording')).toBeInTheDocument();
    expect(screen.getByText('New Recording')).toBeInTheDocument();
  });

  it('should show preview for completed recording', () => {
    const mockBlob = new Blob(['test'], { type: 'video/webm' });
    const mockUrl = 'blob:test-url';

    mockUseMediaCapture.mockReturnValue({
      ...mockMediaCapture,
      state: 'stopped',
      recordedBlob: mockBlob,
      previewUrl: mockUrl,
    });

    render(<InterviewRecorder {...mockProps} />);

    const video = screen.getByRole('application'); // video element
    expect(video).toHaveAttribute('src', mockUrl);
    expect(screen.getByText('Download Recording')).toBeInTheDocument();
  });

  it('should show audio player for audio-only recording', () => {
    const mockBlob = new Blob(['test'], { type: 'audio/webm' });
    const mockUrl = 'blob:test-url';

    mockUseMediaCapture.mockReturnValue({
      ...mockMediaCapture,
      state: 'stopped',
      recordedBlob: mockBlob,
      previewUrl: mockUrl,
    });

    render(<InterviewRecorder {...mockProps} defaultRecordingType="audio" />);

    // Should show audio controls for audio recording type
    expect(screen.getByText('Audio Only')).toBeInTheDocument();
  });

  it('should handle recording settings', () => {
    render(<InterviewRecorder {...mockProps} />);

    // Click settings button
    const settingsButton = screen.getByRole('button', { name: '' }); // Settings icon button
    fireEvent.click(settingsButton);

    expect(screen.getByText('Recording Type')).toBeInTheDocument();
    expect(screen.getByText('Screen Only')).toBeInTheDocument();
    expect(screen.getByText('Audio Only')).toBeInTheDocument();
    expect(screen.getByText('Screen + Audio')).toBeInTheDocument();
  });

  it('should change recording type', () => {
    render(<InterviewRecorder {...mockProps} />);

    // Open settings
    const settingsButton = screen.getByRole('button', { name: '' });
    fireEvent.click(settingsButton);

    // Click on Audio Only
    const audioButton = screen.getByText('Audio Only');
    fireEvent.click(audioButton);

    // Should update the recording type (visual feedback)
    expect(audioButton.closest('button')).toHaveClass('bg-primary'); // Should be selected
  });

  it('should call onRecordingComplete when upload finishes', () => {
    const mockOnRecordingComplete = jest.fn();

    // Simulate recording completion and upload
    mockUseMediaCapture.mockReturnValue({
      ...mockMediaCapture,
      state: 'stopped',
      recordedBlob: new Blob(['test'], { type: 'video/webm' }),
    });

    mockUseMediaUpload.mockReturnValue({
      ...mockUpload,
      uploadState: {
        status: 'completed',
        progress: { loaded: 1024000, total: 1024000, percentage: 100 },
        error: null,
        recordingId: 'test-recording-id',
      },
    });

    render(<InterviewRecorder {...mockProps} onRecordingComplete={mockOnRecordingComplete} />);

    // The effect should trigger onRecordingComplete
    expect(mockOnRecordingComplete).toHaveBeenCalledWith('test-recording-id');
  });

  it('should show browser capabilities in settings', () => {
    render(<InterviewRecorder {...mockProps} />);

    // Open settings
    const settingsButton = screen.getByRole('button', { name: '' });
    fireEvent.click(settingsButton);

    expect(screen.getByText('Browser: Chrome')).toBeInTheDocument();
    expect(screen.getByText(/Supported formats/)).toBeInTheDocument();
  });

  it('should handle unsupported browser', () => {
    // Mock unsupported browser
    jest.doMock('~/lib/media-compatibility', () => ({
      validateRecordingSupport: () => ({
        isSupported: false,
        missingFeatures: ['MediaRecorder API'],
        warnings: [],
      }),
      getBrowserCapabilities: () => ({
        hasMediaRecorder: false,
        hasGetDisplayMedia: false,
        hasGetUserMedia: false,
        supportedVideoMimeTypes: [],
        supportedAudioMimeTypes: [],
        isChromium: false,
        isFirefox: false,
        isSafari: false,
        isEdge: false,
      }),
    }));

    render(<InterviewRecorder {...mockProps} />);

    expect(screen.getByText('Recording Not Supported')).toBeInTheDocument();
    expect(screen.getByText('MediaRecorder API')).toBeInTheDocument();
  });
});