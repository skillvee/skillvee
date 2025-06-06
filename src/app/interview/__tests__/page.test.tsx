import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useUser } from '@clerk/nextjs';
import InterviewPage from '../page';
import { api } from '~/trpc/react';

// Mock dependencies
jest.mock('@clerk/nextjs');
jest.mock('~/trpc/react');
jest.mock('~/components/ui/interview-recorder', () => ({
  InterviewRecorder: ({ onRecordingComplete, interviewId }: any) => (
    <div data-testid="interview-recorder">
      <div>Interview ID: {interviewId}</div>
      <button 
        onClick={() => onRecordingComplete?.('test-recording-id')}
        data-testid="complete-recording"
      >
        Complete Recording
      </button>
    </div>
  ),
}));

// Mock next/navigation
const mockRedirect = jest.fn();
jest.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

describe('InterviewPage', () => {
  const mockUser = {
    id: 'test-user-id',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'INTERVIEWER',
  };

  const mockJobDescription = {
    id: 'test-job-description-id',
    title: 'Software Engineer',
    company: 'Test Company',
    description: 'Test description',
    requirements: ['React', 'TypeScript'],
    focusAreas: ['Frontend'],
    isTemplate: false,
    userId: 'test-user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockInterview = {
    id: 'test-interview-id',
    userId: 'test-user-id',
    jobDescriptionId: 'test-job-description-id',
    status: 'SCHEDULED' as const,
    scheduledAt: new Date(),
    startedAt: null,
    completedAt: null,
    duration: null,
    geminiSessionId: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockApiCalls = {
    user: {
      getCurrentUser: {
        useQuery: jest.fn(),
      },
    },
    jobDescription: {
      list: {
        useQuery: jest.fn(),
      },
      create: {
        useMutation: jest.fn(),
      },
    },
    interview: {
      create: {
        useMutation: jest.fn(),
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Clerk user
    mockUseUser.mockReturnValue({
      user: { id: 'clerk-user-id' },
      isLoaded: true,
      isSignedIn: true,
    } as any);

    // Mock tRPC API
    (api as any) = mockApiCalls;
    
    // Setup default mock responses
    mockApiCalls.user.getCurrentUser.useQuery.mockReturnValue({
      data: mockUser,
      isLoading: false,
    });

    mockApiCalls.jobDescription.list.useQuery.mockReturnValue({
      data: {
        items: [mockJobDescription],
        hasNextPage: false,
        nextCursor: null,
        totalCount: 1,
      },
      isLoading: false,
    });

    mockApiCalls.interview.create.useMutation.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue(mockInterview),
      isPending: false,
    });

    mockApiCalls.jobDescription.create.useMutation.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue(mockJobDescription),
      isPending: false,
    });
  });

  it('should render setup page initially', () => {
    render(<InterviewPage />);

    expect(screen.getByText('Interview Platform')).toBeInTheDocument();
    expect(screen.getByText('Welcome, John. Ready to start your mock interview?')).toBeInTheDocument();
    expect(screen.getByText('Start New Interview')).toBeInTheDocument();
    expect(screen.getByText('Start Interview')).toBeInTheDocument();
  });

  it('should redirect to sign-in when user is not authenticated', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    } as any);

    render(<InterviewPage />);

    expect(mockRedirect).toHaveBeenCalledWith('/sign-in');
  });

  it('should show loading state while data is loading', () => {
    mockApiCalls.user.getCurrentUser.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<InterviewPage />);

    // Should show loading skeleton
    expect(screen.getByRole('main')).toHaveClass('animate-pulse');
  });

  it('should show error state when user data fails to load', () => {
    mockApiCalls.user.getCurrentUser.useQuery.mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(<InterviewPage />);

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(screen.getByText('Unable to load user data. Please try signing out and signing back in.')).toBeInTheDocument();
  });

  it('should start interview with existing job description', async () => {
    const mockCreateInterview = jest.fn().mockResolvedValue(mockInterview);
    mockApiCalls.interview.create.useMutation.mockReturnValue({
      mutateAsync: mockCreateInterview,
      isPending: false,
    });

    render(<InterviewPage />);

    const startButton = screen.getByRole('button', { name: /start interview/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockCreateInterview).toHaveBeenCalledWith({
        jobDescriptionId: 'test-job-description-id',
        scheduledAt: expect.any(Date),
      });
    });
  });

  it('should create demo job description when none exist', async () => {
    const mockCreateJobDescription = jest.fn().mockResolvedValue(mockJobDescription);
    const mockCreateInterview = jest.fn().mockResolvedValue(mockInterview);

    // Mock no existing job descriptions
    mockApiCalls.jobDescription.list.useQuery.mockReturnValue({
      data: { items: [], hasNextPage: false, nextCursor: null, totalCount: 0 },
      isLoading: false,
    });

    mockApiCalls.jobDescription.create.useMutation.mockReturnValue({
      mutateAsync: mockCreateJobDescription,
      isPending: false,
    });

    mockApiCalls.interview.create.useMutation.mockReturnValue({
      mutateAsync: mockCreateInterview,
      isPending: false,
    });

    render(<InterviewPage />);

    const startButton = screen.getByRole('button', { name: /start interview/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockCreateJobDescription).toHaveBeenCalledWith({
        title: 'Data Scientist',
        company: 'Demo Company',
        description: 'Join our team as a Data Scientist to analyze complex datasets and build machine learning models.',
        requirements: [
          'Bachelor\'s degree in Computer Science, Statistics, or related field',
          '3+ years of experience in data science or machine learning',
          'Proficiency in Python and SQL',
          'Experience with pandas, scikit-learn, and other ML libraries',
          'Strong analytical and problem-solving skills'
        ],
        focusAreas: ['Python', 'Machine Learning', 'Statistics', 'SQL'],
        isTemplate: false,
      });
    });

    await waitFor(() => {
      expect(mockCreateInterview).toHaveBeenCalledWith({
        jobDescriptionId: 'test-job-description-id',
        scheduledAt: expect.any(Date),
      });
    });
  });

  it('should show active interview session after starting', async () => {
    const mockCreateInterview = jest.fn().mockResolvedValue(mockInterview);
    mockApiCalls.interview.create.useMutation.mockReturnValue({
      mutateAsync: mockCreateInterview,
      isPending: false,
    });

    render(<InterviewPage />);

    const startButton = screen.getByRole('button', { name: /start interview/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Active Interview Session')).toBeInTheDocument();
      expect(screen.getByText('Record your interview responses. The session will be analyzed for feedback.')).toBeInTheDocument();
      expect(screen.getByTestId('interview-recorder')).toBeInTheDocument();
    });
  });

  it('should show interview tips during active session', async () => {
    const mockCreateInterview = jest.fn().mockResolvedValue(mockInterview);
    mockApiCalls.interview.create.useMutation.mockReturnValue({
      mutateAsync: mockCreateInterview,
      isPending: false,
    });

    render(<InterviewPage />);

    // Start interview
    const startButton = screen.getByRole('button', { name: /start interview/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Interview Tips')).toBeInTheDocument();
      expect(screen.getByText('Think Aloud')).toBeInTheDocument();
      expect(screen.getByText('Take Your Time')).toBeInTheDocument();
      expect(screen.getByText('Ask Questions')).toBeInTheDocument();
    });
  });

  it('should handle recording completion', async () => {
    const mockCreateInterview = jest.fn().mockResolvedValue(mockInterview);
    mockApiCalls.interview.create.useMutation.mockReturnValue({
      mutateAsync: mockCreateInterview,
      isPending: false,
    });

    render(<InterviewPage />);

    // Start interview
    const startButton = screen.getByRole('button', { name: /start interview/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('interview-recorder')).toBeInTheDocument();
    });

    // Simulate recording completion
    const completeButton = screen.getByTestId('complete-recording');
    fireEvent.click(completeButton);

    // Should trigger console.log with recording ID
    // In a real test, you might want to mock console.log and verify it was called
  });

  it('should allow ending interview session', async () => {
    const mockCreateInterview = jest.fn().mockResolvedValue(mockInterview);
    mockApiCalls.interview.create.useMutation.mockReturnValue({
      mutateAsync: mockCreateInterview,
      isPending: false,
    });

    render(<InterviewPage />);

    // Start interview
    const startButton = screen.getByRole('button', { name: /start interview/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('End Interview Session')).toBeInTheDocument();
    });

    // End interview
    const endButton = screen.getByRole('button', { name: /end interview session/i });
    fireEvent.click(endButton);

    await waitFor(() => {
      expect(screen.getByText('Interview Completed!')).toBeInTheDocument();
    });
  });

  it('should show completion page after interview ends', async () => {
    const mockCreateInterview = jest.fn().mockResolvedValue(mockInterview);
    mockApiCalls.interview.create.useMutation.mockReturnValue({
      mutateAsync: mockCreateInterview,
      isPending: false,
    });

    render(<InterviewPage />);

    // Start and end interview
    const startButton = screen.getByRole('button', { name: /start interview/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      const endButton = screen.getByRole('button', { name: /end interview session/i });
      fireEvent.click(endButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Interview Completed!')).toBeInTheDocument();
      expect(screen.getByText('Your recording has been uploaded and will be processed for feedback.')).toBeInTheDocument();
      expect(screen.getByText('What\'s Next?')).toBeInTheDocument();
      expect(screen.getByText('AI Analysis')).toBeInTheDocument();
      expect(screen.getByText('Detailed Feedback')).toBeInTheDocument();
      expect(screen.getByText('Improvement Plan')).toBeInTheDocument();
    });
  });

  it('should allow starting another interview from completion page', async () => {
    const mockCreateInterview = jest.fn().mockResolvedValue(mockInterview);
    mockApiCalls.interview.create.useMutation.mockReturnValue({
      mutateAsync: mockCreateInterview,
      isPending: false,
    });

    render(<InterviewPage />);

    // Start and end interview
    const startButton = screen.getByRole('button', { name: /start interview/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      const endButton = screen.getByRole('button', { name: /end interview session/i });
      fireEvent.click(endButton);
    });

    await waitFor(() => {
      const anotherInterviewButton = screen.getByRole('button', { name: /start another interview/i });
      fireEvent.click(anotherInterviewButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Interview Platform')).toBeInTheDocument();
      expect(screen.getByText('Start New Interview')).toBeInTheDocument();
    });
  });

  it('should show loading state during interview creation', () => {
    mockApiCalls.interview.create.useMutation.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: true,
    });

    render(<InterviewPage />);

    const startButton = screen.getByRole('button', { name: /creating.../i });
    expect(startButton).toBeDisabled();
    expect(screen.getByText('Creating...')).toBeInTheDocument();
  });

  it('should show loading state during demo job description creation', () => {
    // Mock no existing job descriptions
    mockApiCalls.jobDescription.list.useQuery.mockReturnValue({
      data: { items: [], hasNextPage: false, nextCursor: null, totalCount: 0 },
      isLoading: false,
    });

    mockApiCalls.jobDescription.create.useMutation.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: true,
    });

    render(<InterviewPage />);

    const startButton = screen.getByRole('button', { name: /creating.../i });
    expect(startButton).toBeDisabled();
  });

  it('should display user role in setup page', () => {
    render(<InterviewPage />);

    expect(screen.getByText('Your Role')).toBeInTheDocument();
    expect(screen.getByText('INTERVIEWER')).toBeInTheDocument();
  });

  it('should show recording requirements information', () => {
    render(<InterviewPage />);

    expect(screen.getByText('Recording Requirements')).toBeInTheDocument();
    expect(screen.getByText('Screen Capture')).toBeInTheDocument();
    expect(screen.getByText('Audio Recording')).toBeInTheDocument();
    expect(screen.getByText('Secure Upload')).toBeInTheDocument();
  });
});