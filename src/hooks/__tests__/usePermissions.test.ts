// Mock DOM environment for Media API testing
import { renderHook, act } from '@testing-library/react';
import { usePermissions } from '../usePermissions';

// Mock navigator.mediaDevices
const mockMediaDevices = {
  getUserMedia: jest.fn(),
  getDisplayMedia: jest.fn(),
};

Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: mockMediaDevices,
});

// Mock MediaStream
const mockMediaStream = {
  getTracks: jest.fn(() => [
    { stop: jest.fn() },
    { stop: jest.fn() },
  ]),
};

describe('usePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with prompt permissions', () => {
    const { result } = renderHook(() => usePermissions());

    expect(result.current.permissions.camera).toBe('prompt');
    expect(result.current.permissions.microphone).toBe('prompt');
    expect(result.current.permissions.screen).toBe('prompt');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should request camera permission successfully', async () => {
    mockMediaDevices.getUserMedia.mockResolvedValueOnce(mockMediaStream);

    const { result } = renderHook(() => usePermissions());

    let permissionGranted: boolean;
    await act(async () => {
      permissionGranted = await result.current.requestCameraPermission();
    });

    expect(permissionGranted!).toBe(true);
    expect(result.current.permissions.camera).toBe('granted');
    expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({
      video: true,
      audio: false,
    });
  });

  it('should request microphone permission successfully', async () => {
    mockMediaDevices.getUserMedia.mockResolvedValueOnce(mockMediaStream);

    const { result } = renderHook(() => usePermissions());

    let permissionGranted: boolean;
    await act(async () => {
      permissionGranted = await result.current.requestMicrophonePermission();
    });

    expect(permissionGranted!).toBe(true);
    expect(result.current.permissions.microphone).toBe('granted');
    expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: true,
      video: false,
    });
  });

  it('should request screen permission successfully', async () => {
    mockMediaDevices.getDisplayMedia.mockResolvedValueOnce(mockMediaStream);

    const { result } = renderHook(() => usePermissions());

    let permissionGranted: boolean;
    await act(async () => {
      permissionGranted = await result.current.requestScreenPermission();
    });

    expect(permissionGranted!).toBe(true);
    expect(result.current.permissions.screen).toBe('granted');
    expect(mockMediaDevices.getDisplayMedia).toHaveBeenCalledWith({
      video: true,
      audio: false,
    });
  });

  it('should handle camera permission denial', async () => {
    const permissionError = Object.assign(new Error('Permission denied'), { 
      name: 'NotAllowedError' 
    });
    mockMediaDevices.getUserMedia.mockRejectedValueOnce(permissionError);

    const { result } = renderHook(() => usePermissions());

    let permissionGranted: boolean;
    await act(async () => {
      permissionGranted = await result.current.requestCameraPermission();
    });

    expect(permissionGranted!).toBe(false);
    expect(result.current.permissions.camera).toBe('denied');
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.type).toBe('permission_denied');
  });

  it('should handle microphone permission denial', async () => {
    const permissionError = Object.assign(new Error('Permission denied'), { 
      name: 'NotAllowedError' 
    });
    mockMediaDevices.getUserMedia.mockRejectedValueOnce(permissionError);

    const { result } = renderHook(() => usePermissions());

    let permissionGranted: boolean;
    await act(async () => {
      permissionGranted = await result.current.requestMicrophonePermission();
    });

    expect(permissionGranted!).toBe(false);
    expect(result.current.permissions.microphone).toBe('denied');
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.type).toBe('permission_denied');
  });

  it('should handle screen capture denial', async () => {
    const permissionError = Object.assign(new Error('Permission denied'), { 
      name: 'NotAllowedError' 
    });
    mockMediaDevices.getDisplayMedia.mockRejectedValueOnce(permissionError);

    const { result } = renderHook(() => usePermissions());

    let permissionGranted: boolean;
    await act(async () => {
      permissionGranted = await result.current.requestScreenPermission();
    });

    expect(permissionGranted!).toBe(false);
    expect(result.current.permissions.screen).toBe('denied');
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.type).toBe('permission_denied');
  });

  it('should handle device not found errors', async () => {
    const deviceError = Object.assign(new Error('Device not found'), { 
      name: 'NotFoundError' 
    });
    mockMediaDevices.getUserMedia.mockRejectedValueOnce(deviceError);

    const { result } = renderHook(() => usePermissions());

    let permissionGranted: boolean;
    await act(async () => {
      permissionGranted = await result.current.requestCameraPermission();
    });

    expect(permissionGranted!).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.type).toBe('not_supported');
  });

  it('should request all permissions', async () => {
    mockMediaDevices.getUserMedia.mockResolvedValueOnce(mockMediaStream);
    mockMediaDevices.getDisplayMedia.mockResolvedValueOnce(mockMediaStream);

    const { result } = renderHook(() => usePermissions());

    let results: any;
    await act(async () => {
      results = await result.current.requestAllPermissions();
    });

    expect(results.microphone).toBe('granted');
    expect(results.screen).toBe('granted');
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => usePermissions());

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  it('should handle unsupported browser', async () => {
    // Temporarily remove mediaDevices to simulate unsupported browser
    const originalMediaDevices = global.navigator.mediaDevices;
    delete (global.navigator as any).mediaDevices;

    const { result } = renderHook(() => usePermissions());

    let permissionGranted: boolean;
    await act(async () => {
      permissionGranted = await result.current.requestCameraPermission();
    });

    expect(permissionGranted!).toBe(false);
    expect(result.current.error?.type).toBe('not_supported');

    // Restore mediaDevices
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: originalMediaDevices,
    });
  });
});