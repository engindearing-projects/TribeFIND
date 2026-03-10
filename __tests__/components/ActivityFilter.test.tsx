import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import ActivityFilter from '../../components/ActivityFilter';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Mock supabase with proper chainable methods for ActivityFilter queries
jest.mock('../../lib/supabase', () => {
  const chainable = () => {
    const obj: any = {
      select: jest.fn(() => obj),
      eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      neq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
      order: jest.fn(() => obj),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    };
    return obj;
  };
  return {
    supabase: {
      from: jest.fn(() => chainable()),
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      },
    },
  };
});

describe('ActivityFilter', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    const { getByText } = renderWithProviders(
      <ActivityFilter onFilterChange={mockOnFilterChange} />
    );

    expect(getByText('Loading filters...')).toBeTruthy();
  });

  it('renders the All filter chip after loading', async () => {
    const { getByText } = renderWithProviders(
      <ActivityFilter onFilterChange={mockOnFilterChange} />
    );

    await waitFor(() => {
      expect(getByText('All')).toBeTruthy();
    });
  });

  it('calls onFilterChange when All chip is pressed', async () => {
    const { getByText } = renderWithProviders(
      <ActivityFilter
        onFilterChange={mockOnFilterChange}
        selectedActivities={['some-id']}
      />
    );

    await waitFor(() => {
      expect(getByText('All')).toBeTruthy();
    });

    fireEvent.press(getByText('All'));

    expect(mockOnFilterChange).toHaveBeenCalledWith([]);
  });

  it('renders with selectedActivities prop', async () => {
    const { getByText } = renderWithProviders(
      <ActivityFilter
        onFilterChange={mockOnFilterChange}
        selectedActivities={[]}
      />
    );

    await waitFor(() => {
      expect(getByText('All')).toBeTruthy();
    });
  });

  it('shows filter count when filters are active', async () => {
    const { getByText } = renderWithProviders(
      <ActivityFilter
        onFilterChange={mockOnFilterChange}
        selectedActivities={['activity-1', 'activity-2']}
      />
    );

    await waitFor(() => {
      expect(getByText('2 filters active')).toBeTruthy();
    });
  });

  it('shows singular filter text for one filter', async () => {
    const { getByText } = renderWithProviders(
      <ActivityFilter
        onFilterChange={mockOnFilterChange}
        selectedActivities={['activity-1']}
      />
    );

    await waitFor(() => {
      expect(getByText('1 filter active')).toBeTruthy();
    });
  });

  it('shows clear button when filters are active', async () => {
    const { getByText } = renderWithProviders(
      <ActivityFilter
        onFilterChange={mockOnFilterChange}
        selectedActivities={['activity-1']}
      />
    );

    await waitFor(() => {
      expect(getByText('Clear')).toBeTruthy();
    });
  });

  it('clears filters when Clear button is pressed', async () => {
    const { getByText } = renderWithProviders(
      <ActivityFilter
        onFilterChange={mockOnFilterChange}
        selectedActivities={['activity-1']}
      />
    );

    await waitFor(() => {
      expect(getByText('Clear')).toBeTruthy();
    });

    fireEvent.press(getByText('Clear'));

    expect(mockOnFilterChange).toHaveBeenCalledWith([]);
  });
});
