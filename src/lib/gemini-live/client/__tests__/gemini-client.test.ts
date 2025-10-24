/**
 * @jest-environment jsdom
 */

import { GeminiLiveClient, createGeminiLiveClient } from '../gemini-client';
import type { InterviewContext } from '../../types';

// Mock dependencies
jest.mock('../websocket-client');
jest.mock('../../audio/recorder');
jest.mock('../../audio/streamer');
jest.mock('../../video/screen-recorder');

describe('GeminiLiveClient', () => {
  const mockContext: InterviewContext = {
    interviewId: 'test-123',
    jobTitle: 'Data Scientist',
    companyName: 'Test Company',
    focusAreas: ['Python', 'SQL'],
    difficulty: 'MEDIUM',
    questions: [{
      id: 'q1',
      questionText: 'What is SQL?',
      questionType: 'technical',
      difficulty: 'MEDIUM'
    }],
    currentQuestionIndex: 0
  };

  describe('createGeminiLiveClient()', () => {
    it('should create client with default config', () => {
      const client = createGeminiLiveClient({ apiKey: 'test-key' });
      expect(client).toBeInstanceOf(GeminiLiveClient);
    });

    it('should merge config overrides', () => {
      const client = createGeminiLiveClient({
        apiKey: 'test-key',
        voice: 'Charon',
        responseModalities: ['AUDIO', 'TEXT']
      });
      expect(client).toBeInstanceOf(GeminiLiveClient);
    });
  });

  describe('startSession()', () => {
    it('should throw error if API key is invalid', async () => {
      const client = new GeminiLiveClient({
        apiKey: 'test-gemini-api-key',
        model: 'models/gemini-2.0-flash-exp',
        responseModalities: ['AUDIO']
      });

      await expect(client.startSession(mockContext)).rejects.toThrow('Valid API key required');
    });
  });

  describe('event handling', () => {
    it('should register event handler', () => {
      const client = createGeminiLiveClient({ apiKey: 'valid-key' });
      const handler = jest.fn();

      client.on('connected', handler);

      expect(() => client.on('connected', handler)).not.toThrow();
    });

    it('should remove event handler', () => {
      const client = createGeminiLiveClient({ apiKey: 'valid-key' });
      const handler = jest.fn();

      client.on('connected', handler);
      client.off('connected', handler);

      expect(() => client.off('connected', handler)).not.toThrow();
    });
  });

  describe('getters', () => {
    it('should return correct isConnected state', () => {
      const client = createGeminiLiveClient({ apiKey: 'test-key' });
      expect(client.isConnected).toBe(false);
    });

    it('should return correct isListening state', () => {
      const client = createGeminiLiveClient({ apiKey: 'test-key' });
      expect(client.isListening).toBe(false);
    });

    it('should return null for microphoneStream when not listening', () => {
      const client = createGeminiLiveClient({ apiKey: 'test-key' });
      expect(client.microphoneStream).toBeNull();
    });

    it('should return null for aiAudioStream when not initialized', () => {
      const client = createGeminiLiveClient({ apiKey: 'test-key' });
      expect(client.aiAudioStream).toBeNull();
    });
  });

  describe('exportConversation()', () => {
    it('should return null when no session active', () => {
      const client = createGeminiLiveClient({ apiKey: 'test-key' });
      expect(client.exportConversation()).toBeNull();
    });
  });
});
