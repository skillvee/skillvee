// Mock for Prisma database client used in tests

export const mockFindUnique = jest.fn();
export const mockFindMany = jest.fn();
export const mockFindFirst = jest.fn();
export const mockCreate = jest.fn();
export const mockUpdate = jest.fn();
export const mockDelete = jest.fn();
export const mockCount = jest.fn();

export const db = {
  interviewQuestionRecording: {
    findUnique: mockFindUnique,
    findMany: mockFindMany,
    findFirst: mockFindFirst,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
    count: mockCount,
  },
  interview: {
    findUnique: mockFindUnique,
    findMany: mockFindMany,
    findFirst: mockFindFirst,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  },
  interviewAssessment: {
    findUnique: mockFindUnique,
    findMany: mockFindMany,
    findFirst: mockFindFirst,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  },
  skill: {
    findUnique: mockFindUnique,
    findMany: mockFindMany,
    findFirst: mockFindFirst,
  },
  user: {
    findUnique: mockFindUnique,
    findMany: mockFindMany,
  },
};

// Helper to reset all mocks
export const resetPrismaMocks = () => {
  mockFindUnique.mockReset();
  mockFindMany.mockReset();
  mockFindFirst.mockReset();
  mockCreate.mockReset();
  mockUpdate.mockReset();
  mockDelete.mockReset();
  mockCount.mockReset();
};
