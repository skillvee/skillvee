// Mock for Gemini AI client used in tests
import type { QuestionAssessment, FinalAssessment } from "~/server/ai/prompts/assessment/types";

export const mockGenerateContent = jest.fn();
export const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent,
}));

export const mockUploadFile = jest.fn();
export const mockGetFile = jest.fn();
export const mockDeleteFile = jest.fn();

export const geminiClient = {
  getGenerativeModel: mockGetGenerativeModel,
};

export const GEMINI_MODELS = {
  PRO: "gemini-2.5-pro",
  FLASH: "gemini-2.5-flash",
};

export const withRetry = jest.fn((fn) => fn());

// Helper to reset all mocks
export const resetGeminiMocks = () => {
  mockGenerateContent.mockReset();
  mockGetGenerativeModel.mockReset();
  mockUploadFile.mockReset();
  mockGetFile.mockReset();
  mockDeleteFile.mockReset();
  withRetry.mockReset();

  // Re-setup default implementations
  mockGetGenerativeModel.mockReturnValue({
    generateContent: mockGenerateContent,
  });
  withRetry.mockImplementation((fn) => fn());
};
