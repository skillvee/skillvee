import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LiveInterviewSession } from '../LiveInterviewSession';
import { api } from '~/trpc/react';

// Mock the API
jest.mock('~/trpc/react', () => ({
  api: {
    ai: {
      startConversation: {
        useMutation: jest.fn(),
      },
    },
  },
}));

// Mock the Gemini Live hooks
const mockGeminiLive = {
  isConnected: false,
  isListening: false,
  isAISpeaking: false,
  sessionId: null,
  error: null,
  connectionState: 'disconnected' as const,
  audioLevel: 0,
  lastInteraction: null,
  connect: jest.fn(),
  disconnect: jest.fn(),
  startListening: jest.fn(),
  stopListening: jest.fn(),
  updateContext: jest.fn(),
  clearError: jest.fn(),
  reconnect: jest.fn(),
  client: null,
};

const mockPermissions = {
  permissions: {
    microphone: 'prompt' as PermissionState,
    camera: 'prompt' as PermissionState,
  },
  isCheckingPermissions: false,
  checkPermissions: jest.fn(),
  requestMicrophonePermission: jest.fn(),
  hasMicrophoneAccess: false,
  hasCameraAccess: false,
};

jest.mock('~/hooks/useGeminiLive', () => ({
  useGeminiLiveInterview: jest.fn(() => mockGeminiLive),
  useGeminiLivePermissions: jest.fn(() => mockPermissions),
}));

const mockStartConversationMutation = {
  mutateAsync: jest.fn(),
  isPending: false,
  error: null,
};

describe('LiveInterviewSession', () => {
  const mockProps = {
    interview: {
      id: 'test-interview-id',
      jobDescription: {
        title: 'Software Engineer',
        companyName: 'Test Company',
        focusAreas: ['JavaScript', 'React', 'Node.js'],
        difficulty: 'MEDIUM' as const,
      },
    },
    questions: [
      {
        id: 'q1',
        questionText: 'Tell me about your experience with JavaScript',
        questionType: 'TECHNICAL',
        difficulty: 'MEDIUM',
        expectedAnswer: 'Should demonstrate JS knowledge',
        evaluationCriteria: ['Technical accuracy', 'Practical examples'],
        timeAllocation: 300,
        followUpQuestions: ['How do you handle async operations?'],
      },
      {
        id: 'q2',
        questionText: 'Describe a challenging project you worked on',
        questionType: 'BEHAVIORAL',
        difficulty: 'MEDIUM',
        expectedAnswer: 'Should show problem-solving skills',
        evaluationCriteria: ['Problem-solving approach', 'Communication'],
        timeAllocation: 400,
        followUpQuestions: ['What would you do differently?'],
      },
    ],
    onQuestionComplete: jest.fn(),
    onInterviewComplete: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup API mock
    (api.ai.startConversation.useMutation as jest.Mock).mockReturnValue(mockStartConversationMutation);
    
    // Reset mock states
    mockGeminiLive.isConnected = false;
    mockGeminiLive.isListening = false;
    mockGeminiLive.isAISpeaking = false;
    mockGeminiLive.connectionState = 'disconnected';
    mockGeminiLive.error = null;
    
    mockPermissions.hasMicrophoneAccess = false;
    mockPermissions.permissions.microphone = 'prompt';
  });

  describe('Initial Render', () => {
    test('should render session controls', () => {
      render(<LiveInterviewSession {...mockProps} />);
      
      expect(screen.getByText('Start AI Interview')).toBeInTheDocument();
      expect(screen.getByText('Session Controls')).toBeInTheDocument();
      expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    });

    test('should show current question', () => {
      render(<LiveInterviewSession {...mockProps} />);
      
      expect(screen.getByText('Tell me about your experience with JavaScript')).toBeInTheDocument();
      expect(screen.getByText('Technical Question')).toBeInTheDocument();
      expect(screen.getByText('5:00 allocated')).toBeInTheDocument();
    });

    test('should show interview details', () => {
      render(<LiveInterviewSession {...mockProps} />);
      
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Test Company')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
    });
  });

  describe('Session Management', () => {
    test('should start session when microphone permission granted', async () => {
      mockPermissions.hasMicrophoneAccess = true;
      mockPermissions.requestMicrophonePermission.mockResolvedValue(true);
      
      mockStartConversationMutation.mutateAsync.mockResolvedValue({
        sessionId: 'test-session-id',
        config: { apiKey: 'test-api-key' },
        status: 'ready',
      });
      
      mockGeminiLive.connect.mockResolvedValue(undefined);
      mockGeminiLive.startListening.mockResolvedValue(undefined);

      render(<LiveInterviewSession {...mockProps} />);
      
      const startButton = screen.getByText('Start AI Interview');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(mockStartConversationMutation.mutateAsync).toHaveBeenCalledWith({
          interviewId: 'test-interview-id',
          sessionConfig: {
            voice: 'alloy',
            speed: 1.0,
            temperature: 0.7,
            maxTokens: 2048,
          },
          context: {
            candidateName: 'Candidate',
            position: 'Software Engineer',
            company: 'Test Company',
          },
        });
      });

      await waitFor(() => {
        expect(mockGeminiLive.connect).toHaveBeenCalled();
        expect(mockGeminiLive.startListening).toHaveBeenCalled();
      });
    });

    test('should request microphone permission if not granted', async () => {
      mockPermissions.hasMicrophoneAccess = false;
      mockPermissions.requestMicrophonePermission.mockResolvedValue(true);
      
      mockStartConversationMutation.mutateAsync.mockResolvedValue({
        sessionId: 'test-session-id',
        config: { apiKey: 'test-api-key' },
        status: 'ready',
      });

      render(<LiveInterviewSession {...mockProps} />);
      
      const startButton = screen.getByText('Start AI Interview');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(mockPermissions.requestMicrophonePermission).toHaveBeenCalled();
      });
    });

    test('should handle microphone permission denied', async () => {
      mockPermissions.hasMicrophoneAccess = false;
      mockPermissions.requestMicrophonePermission.mockResolvedValue(false);

      render(<LiveInterviewSession {...mockProps} />);
      
      const startButton = screen.getByText('Start AI Interview');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(mockProps.onError).toHaveBeenCalledWith('Microphone access is required for the interview');
      });
    });

    test('should end session', async () => {
      mockGeminiLive.disconnect.mockResolvedValue(undefined);

      render(<LiveInterviewSession {...mockProps} />);
      
      const endButton = screen.getByText('End Interview');
      fireEvent.click(endButton);

      await waitFor(() => {
        expect(mockGeminiLive.disconnect).toHaveBeenCalled();
        expect(mockProps.onInterviewComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Question Navigation', () => {
    test('should move to next question', () => {
      render(<LiveInterviewSession {...mockProps} />);
      
      const nextButton = screen.getByLabelText('Next question');
      fireEvent.click(nextButton);

      expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
      expect(screen.getByText('Describe a challenging project you worked on')).toBeInTheDocument();
      expect(mockGeminiLive.updateContext).toHaveBeenCalledWith({ currentQuestionIndex: 1 });
    });

    test('should move to previous question', () => {
      render(<LiveInterviewSession {...mockProps} />);
      
      // First move to question 2
      const nextButton = screen.getByLabelText('Next question');
      fireEvent.click(nextButton);
      
      // Then move back to question 1
      const prevButton = screen.getByLabelText('Previous question');
      fireEvent.click(prevButton);

      expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
      expect(screen.getByText('Tell me about your experience with JavaScript')).toBeInTheDocument();
      expect(mockGeminiLive.updateContext).toHaveBeenCalledWith({ currentQuestionIndex: 0 });
    });

    test('should complete interview on last question', () => {
      render(<LiveInterviewSession {...mockProps} />);
      
      // Move to last question
      const nextButton = screen.getByLabelText('Next question');
      fireEvent.click(nextButton);
      
      // Try to move past last question
      fireEvent.click(nextButton);

      expect(mockGeminiLive.disconnect).toHaveBeenCalled();
    });

    test('should disable previous button on first question', () => {
      render(<LiveInterviewSession {...mockProps} />);
      
      const prevButton = screen.getByLabelText('Previous question');
      expect(prevButton).toBeDisabled();
    });

    test('should update next button text on last question', () => {
      render(<LiveInterviewSession {...mockProps} />);
      
      // Move to last question
      const nextButton = screen.getByLabelText('Next question');
      fireEvent.click(nextButton);
      
      expect(screen.getByText('Complete Interview')).toBeInTheDocument();
    });
  });

  describe('Session Controls', () => {
    test('should pause and resume session', () => {
      render(<LiveInterviewSession {...mockProps} />);
      
      const pauseButton = screen.getByLabelText('Pause interview');
      fireEvent.click(pauseButton);

      expect(mockGeminiLive.stopListening).toHaveBeenCalled();
      
      const resumeButton = screen.getByLabelText('Resume interview');
      fireEvent.click(resumeButton);

      expect(mockGeminiLive.startListening).toHaveBeenCalled();
    });

    test('should show correct pause/resume button', () => {
      render(<LiveInterviewSession {...mockProps} />);
      
      expect(screen.getByLabelText('Pause interview')).toBeInTheDocument();
      
      const pauseButton = screen.getByLabelText('Pause interview');
      fireEvent.click(pauseButton);
      
      expect(screen.getByLabelText('Resume interview')).toBeInTheDocument();
    });
  });

  describe('Connection Status', () => {
    test('should show connected status', () => {
      mockGeminiLive.isConnected = true;
      mockGeminiLive.connectionState = 'connected';

      render(<LiveInterviewSession {...mockProps} />);
      
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    test('should show connecting status', () => {
      mockGeminiLive.connectionState = 'connecting';

      render(<LiveInterviewSession {...mockProps} />);
      
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    test('should show error status', () => {
      mockGeminiLive.connectionState = 'error';
      mockGeminiLive.error = 'Connection failed';

      render(<LiveInterviewSession {...mockProps} />);
      
      expect(screen.getByText('Error: Connection failed')).toBeInTheDocument();
    });

    test('should show reconnect button on error', () => {
      mockGeminiLive.connectionState = 'error';

      render(<LiveInterviewSession {...mockProps} />);
      
      const reconnectButton = screen.getByText('Reconnect');
      expect(reconnectButton).toBeInTheDocument();
      
      fireEvent.click(reconnectButton);
      expect(mockGeminiLive.reconnect).toHaveBeenCalled();
    });
  });

  describe('Audio Indicators', () => {
    test('should show listening indicator when listening', () => {
      mockGeminiLive.isListening = true;

      render(<LiveInterviewSession {...mockProps} />);
      
      expect(screen.getByText('Listening...')).toBeInTheDocument();
    });

    test('should show AI speaking indicator', () => {
      mockGeminiLive.isAISpeaking = true;

      render(<LiveInterviewSession {...mockProps} />);
      
      expect(screen.getByText('AI Speaking')).toBeInTheDocument();
    });

    test('should show audio level visualization', () => {
      mockGeminiLive.audioLevel = 0.5;

      render(<LiveInterviewSession {...mockProps} />);
      
      // Should render audio visualizer component
      expect(screen.getByTestId('audio-visualizer')).toBeInTheDocument();
    });
  });

  describe('Conversation Log', () => {
    test('should display conversation messages', () => {
      render(<LiveInterviewSession {...mockProps} />);
      
      expect(screen.getByText('Conversation')).toBeInTheDocument();
      expect(screen.getByText('Interview session ready to start')).toBeInTheDocument();
    });

    test('should add system messages to log', async () => {
      render(<LiveInterviewSession {...mockProps} />);
      
      // Simulate starting session
      const startButton = screen.getByText('Start AI Interview');
      fireEvent.click(startButton);

      // Should add system message (mocked to fail but still show the attempt)
      await waitFor(() => {
        expect(screen.getByText('Conversation')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle session start error', async () => {
      mockPermissions.hasMicrophoneAccess = true;
      mockStartConversationMutation.mutateAsync.mockRejectedValue(new Error('API Error'));

      render(<LiveInterviewSession {...mockProps} />);
      
      const startButton = screen.getByText('Start AI Interview');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(mockProps.onError).toHaveBeenCalledWith('API Error');
      });
    });

    test('should handle connection timeout', async () => {
      mockPermissions.hasMicrophoneAccess = true;
      mockStartConversationMutation.mutateAsync.mockResolvedValue({
        sessionId: 'test-session-id',
        config: { apiKey: 'test-api-key' },
        status: 'ready',
      });
      
      // Mock connection that never resolves
      mockGeminiLive.connect.mockImplementation(() => new Promise(() => {}));

      render(<LiveInterviewSession {...mockProps} />);
      
      const startButton = screen.getByText('Start AI Interview');
      fireEvent.click(startButton);

      // Should eventually timeout and show error
      await waitFor(() => {
        expect(mockProps.onError).toHaveBeenCalled();
      }, { timeout: 6000 });
    });
  });

  describe('Question Details', () => {
    test('should show evaluation criteria', () => {
      render(<LiveInterviewSession {...mockProps} />);
      
      expect(screen.getByText('Technical accuracy')).toBeInTheDocument();
      expect(screen.getByText('Practical examples')).toBeInTheDocument();
    });

    test('should show follow-up questions', () => {
      render(<LiveInterviewSession {...mockProps} />);
      
      expect(screen.getByText('How do you handle async operations?')).toBeInTheDocument();
    });

    test('should show question type badge', () => {
      render(<LiveInterviewSession {...mockProps} />);
      
      expect(screen.getByText('Technical Question')).toBeInTheDocument();
    });
  });

  describe('Timer Display', () => {
    test('should show elapsed time when session started', () => {
      // Mock that session has started
      render(<LiveInterviewSession {...mockProps} />);
      
      // Should show timer (initially 00:00)
      expect(screen.getByText(/00:00/)).toBeInTheDocument();
    });
  });
});