const mockSupabase = {
  from: jest.fn(() => ({
    update: jest.fn(() => mockSupabase),
    eq: jest.fn(() => mockSupabase),
    select: jest.fn(() => Promise.resolve({ data: [{ id: 'mock-user-id', username: 'mockuser', location: 'POINT(0 0)' }], error: null })),
  })),
  // Add other methods if needed, e.g., auth, storage
};

export const createClient = jest.fn(() => mockSupabase);

export const supabase = mockSupabase;
