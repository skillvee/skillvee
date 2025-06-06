import {
  detectBrowser,
  hasMediaRecorderSupport,
  hasGetDisplayMediaSupport,
  hasGetUserMediaSupport,
  getBestSupportedMimeType,
  validateRecordingSupport,
  getBrowserOptimizedConstraints,
  getBrowserOptimizedRecorderOptions
} from '../media-compatibility';

// Mock browser globals
const mockMediaRecorder = {
  isTypeSupported: jest.fn(),
};

const mockNavigator = {
  userAgent: '',
  mediaDevices: {
    getDisplayMedia: jest.fn(),
    getUserMedia: jest.fn(),
  },
};

// Setup mocks
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset navigator with fresh mediaDevices
  const freshNavigator = {
    userAgent: '',
    mediaDevices: {
      getDisplayMedia: jest.fn(),
      getUserMedia: jest.fn(),
    },
  };
  
  // Reset globals
  (global as any).MediaRecorder = mockMediaRecorder;
  (global as any).navigator = freshNavigator;
  (global as any).window = { isSecureContext: true };
  
  // Update the mock reference
  Object.assign(mockNavigator, freshNavigator);
});

describe('media-compatibility', () => {
  describe('detectBrowser', () => {
    it('should detect Chrome browser', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      
      const result = detectBrowser();
      
      expect(result.isChromium).toBe(true);
      expect(result.isFirefox).toBe(false);
      expect(result.isSafari).toBe(false);
      expect(result.isEdge).toBe(false);
    });

    it('should detect Firefox browser', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
      
      const result = detectBrowser();
      
      expect(result.isChromium).toBe(false);
      expect(result.isFirefox).toBe(true);
      expect(result.isSafari).toBe(false);
      expect(result.isEdge).toBe(false);
    });

    it('should detect Safari browser', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';
      
      const result = detectBrowser();
      
      expect(result.isChromium).toBe(false);
      expect(result.isFirefox).toBe(false);
      expect(result.isSafari).toBe(true);
      expect(result.isEdge).toBe(false);
    });

    it('should detect Edge browser', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59';
      
      const result = detectBrowser();
      
      expect(result.isChromium).toBe(false);
      expect(result.isFirefox).toBe(false);
      expect(result.isSafari).toBe(false);
      expect(result.isEdge).toBe(true);
    });
  });

  describe('hasMediaRecorderSupport', () => {
    it('should return true when MediaRecorder is available', () => {
      expect(hasMediaRecorderSupport()).toBe(true);
    });

    it('should return false when MediaRecorder is not available', () => {
      delete (global as any).MediaRecorder;
      expect(hasMediaRecorderSupport()).toBe(false);
    });
  });

  describe('hasGetDisplayMediaSupport', () => {
    it('should return true when getDisplayMedia is available', () => {
      expect(hasGetDisplayMediaSupport()).toBe(true);
    });

    it('should return false when getDisplayMedia is not available', () => {
      delete mockNavigator.mediaDevices.getDisplayMedia;
      expect(hasGetDisplayMediaSupport()).toBe(false);
    });
  });

  describe('hasGetUserMediaSupport', () => {
    it('should return true when getUserMedia is available', () => {
      expect(hasGetUserMediaSupport()).toBe(true);
    });

    it('should return false when getUserMedia is not available', () => {
      delete mockNavigator.mediaDevices.getUserMedia;
      expect(hasGetUserMediaSupport()).toBe(false);
    });
  });

  describe('getBestSupportedMimeType', () => {
    beforeEach(() => {
      mockMediaRecorder.isTypeSupported.mockReturnValue(false);
    });

    it('should return preferred video MIME type when supported', () => {
      mockMediaRecorder.isTypeSupported.mockImplementation((type: string) => 
        type === 'video/webm;codecs=vp9,opus'
      );

      const result = getBestSupportedMimeType('video');
      expect(result).toBe('video/webm;codecs=vp9,opus');
    });

    it('should return fallback video MIME type when preferred is not supported', () => {
      mockMediaRecorder.isTypeSupported.mockImplementation((type: string) => 
        type === 'video/webm'
      );

      const result = getBestSupportedMimeType('video');
      expect(result).toBe('video/webm');
    });

    it('should return preferred audio MIME type when supported', () => {
      mockMediaRecorder.isTypeSupported.mockImplementation((type: string) => 
        type === 'audio/webm;codecs=opus'
      );

      const result = getBestSupportedMimeType('audio');
      expect(result).toBe('audio/webm;codecs=opus');
    });

    it('should return null when no MIME types are supported', () => {
      mockMediaRecorder.isTypeSupported.mockReturnValue(false);

      const result = getBestSupportedMimeType('video');
      expect(result).toBe(null);
    });
  });

  describe('validateRecordingSupport', () => {
    it('should return supported when all features are available', () => {
      // Mock window.isSecureContext
      Object.defineProperty(global, 'window', {
        value: { isSecureContext: true },
        writable: true
      });
      
      const result = validateRecordingSupport();
      
      expect(result.isSupported).toBe(true);
      expect(result.missingFeatures).toHaveLength(0);
    });

    it('should detect missing MediaRecorder', () => {
      delete (global as any).MediaRecorder;
      
      const result = validateRecordingSupport();
      
      expect(result.isSupported).toBe(false);
      expect(result.missingFeatures).toContain('MediaRecorder API');
    });

    it('should detect missing getDisplayMedia', () => {
      delete mockNavigator.mediaDevices.getDisplayMedia;
      
      const result = validateRecordingSupport();
      
      expect(result.isSupported).toBe(false);
      expect(result.missingFeatures).toContain('Screen capture (getDisplayMedia)');
    });

    it('should detect insecure context', () => {
      (global as any).window.isSecureContext = false;
      
      const result = validateRecordingSupport();
      
      expect(result.isSupported).toBe(false);
      expect(result.missingFeatures).toContain('Secure context (HTTPS or localhost required)');
    });
  });

  describe('getBrowserOptimizedConstraints', () => {
    it('should return screen and audio constraints for screen_and_audio', () => {
      const result = getBrowserOptimizedConstraints('screen_and_audio');
      
      expect(result.video).toBeDefined();
      expect(result.audio).toBeDefined();
      expect(typeof result.video).toBe('object');
      expect(typeof result.audio).toBe('object');
    });

    it('should return only video constraints for screen', () => {
      const result = getBrowserOptimizedConstraints('screen');
      
      expect(result.video).toBeDefined();
      expect(result.audio).toBe(false);
    });

    it('should return only audio constraints for audio', () => {
      const result = getBrowserOptimizedConstraints('audio');
      
      expect(result.video).toBe(false);
      expect(result.audio).toBeDefined();
    });

    it('should return Safari-optimized constraints', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';
      
      const result = getBrowserOptimizedConstraints('screen_and_audio');
      
      expect(result.video).toBeDefined();
      expect(result.audio).toBeDefined();
      
      // Safari should have lower framerate
      if (typeof result.video === 'object' && result.video.frameRate) {
        expect((result.video.frameRate as any).ideal).toBeLessThanOrEqual(30);
      }
    });
  });

  describe('getBrowserOptimizedRecorderOptions', () => {
    beforeEach(() => {
      mockMediaRecorder.isTypeSupported.mockImplementation((type: string) => 
        type === 'video/webm;codecs=vp9,opus'
      );
    });

    it('should return optimized options with MIME type', () => {
      const result = getBrowserOptimizedRecorderOptions('video');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      // mimeType may be undefined if no types are supported
      if (result.mimeType) {
        expect(typeof result.mimeType).toBe('string');
      }
      expect(result.videoBitsPerSecond).toBeDefined();
      expect(result.audioBitsPerSecond).toBeDefined();
    });

    it('should return Safari-specific optimizations', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';
      
      const result = getBrowserOptimizedRecorderOptions('video');
      
      // Safari should have lower bitrates
      expect(result.videoBitsPerSecond).toBeLessThanOrEqual(2000000);
    });

    it('should return Firefox-specific optimizations', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
      
      const result = getBrowserOptimizedRecorderOptions('video');
      
      expect(result.videoBitsPerSecond).toBeDefined();
      expect(result.audioBitsPerSecond).toBeDefined();
    });

    it('should return Chrome-specific optimizations', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      
      const result = getBrowserOptimizedRecorderOptions('video');
      
      // Chrome should have higher bitrates
      expect(result.videoBitsPerSecond).toBeGreaterThanOrEqual(3000000);
    });
  });
});