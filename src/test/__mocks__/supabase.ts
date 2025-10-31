// Mock for Supabase client used in tests

export const mockDownload = jest.fn();
export const mockUpload = jest.fn();
export const mockFrom = jest.fn(() => ({
  download: mockDownload,
  upload: mockUpload,
}));

export const mockCreateClient = jest.fn(() => ({
  storage: {
    from: mockFrom,
  },
}));

export const createClient = mockCreateClient;

// Helper to reset all mocks
export const resetSupabaseMocks = () => {
  mockDownload.mockReset();
  mockUpload.mockReset();
  mockFrom.mockReset();
  mockCreateClient.mockReset();

  // Re-setup default implementations
  mockFrom.mockReturnValue({
    download: mockDownload,
    upload: mockUpload,
  });

  mockCreateClient.mockReturnValue({
    storage: {
      from: mockFrom,
    },
  });
};
