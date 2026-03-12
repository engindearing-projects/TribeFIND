import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ImageFilters from '../../components/ImageFilters';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => React.createElement(Text, props, name),
  };
});

// Mock expo-image-manipulator
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockResolvedValue({ uri: 'file://filtered-image.jpg' }),
  SaveFormat: { JPEG: 'jpeg', PNG: 'png' },
  FlipType: { Horizontal: 'horizontal', Vertical: 'vertical' },
}));

// Mock expo-media-library
jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  saveToLibraryAsync: jest.fn().mockResolvedValue(true),
}));

// Mock PhotoFilters service
jest.mock('../../services/PhotoFilters', () => ({
  PHOTO_FILTERS: [
    {
      id: 'original',
      name: 'Original',
      icon: 'camera-outline',
      description: 'No filter applied',
      transform: jest.fn().mockResolvedValue('file://original.jpg'),
    },
    {
      id: 'vintage',
      name: 'Vintage',
      icon: 'time-outline',
      description: 'Warm sepia tones with soft edges',
      transform: jest.fn().mockResolvedValue('file://vintage.jpg'),
    },
    {
      id: 'blackwhite',
      name: 'B&W',
      icon: 'contrast-outline',
      description: 'Classic black and white with high contrast',
      transform: jest.fn().mockResolvedValue('file://bw.jpg'),
    },
  ],
}));

const defaultProps = {
  imageUri: 'file://test-image.jpg',
  onFilterApplied: jest.fn(),
  onClose: jest.fn(),
  onSave: jest.fn(),
};

describe('ImageFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the filter UI', () => {
    const { getByText } = renderWithProviders(<ImageFilters {...defaultProps} />);

    expect(getByText('Filters')).toBeTruthy();
    expect(getByText('Original')).toBeTruthy();
    expect(getByText('Vintage')).toBeTruthy();
    expect(getByText('B&W')).toBeTruthy();
    expect(getByText('Tap a filter to apply it to your photo')).toBeTruthy();
  });

  it('shows description for the selected filter', () => {
    const { getByText } = renderWithProviders(<ImageFilters {...defaultProps} />);

    expect(getByText('No filter applied')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByText } = renderWithProviders(<ImageFilters {...defaultProps} />);

    fireEvent.press(getByText('close'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onSave when save button is pressed', () => {
    const { getByText } = renderWithProviders(<ImageFilters {...defaultProps} />);

    fireEvent.press(getByText('checkmark'));
    expect(defaultProps.onSave).toHaveBeenCalledWith('file://test-image.jpg');
  });

  it('applies a filter when tapped', async () => {
    const { getByText } = renderWithProviders(<ImageFilters {...defaultProps} />);

    fireEvent.press(getByText('Vintage'));

    await waitFor(() => {
      expect(defaultProps.onFilterApplied).toHaveBeenCalledWith('file://vintage.jpg');
    });
  });

  it('shows processing overlay while applying filter', async () => {
    const { PHOTO_FILTERS } = require('../../services/PhotoFilters');
    let resolveTransform: (value: string) => void;
    PHOTO_FILTERS[1].transform.mockReturnValueOnce(
      new Promise((resolve: any) => { resolveTransform = resolve; })
    );

    const { getByText } = renderWithProviders(<ImageFilters {...defaultProps} />);

    fireEvent.press(getByText('Vintage'));

    await waitFor(() => {
      expect(getByText('Applying filter...')).toBeTruthy();
    });

    resolveTransform!('file://vintage.jpg');

    await waitFor(() => {
      expect(defaultProps.onFilterApplied).toHaveBeenCalled();
    });
  });

  it('shows error alert when filter fails', async () => {
    const { PHOTO_FILTERS } = require('../../services/PhotoFilters');
    PHOTO_FILTERS[2].transform.mockRejectedValueOnce(new Error('Processing failed'));
    jest.spyOn(Alert, 'alert');

    const { getByText } = renderWithProviders(<ImageFilters {...defaultProps} />);

    fireEvent.press(getByText('B&W'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to apply filter');
    });
  });

  it('does not re-apply the already selected filter', () => {
    const { PHOTO_FILTERS } = require('../../services/PhotoFilters');
    const { getByText } = renderWithProviders(<ImageFilters {...defaultProps} />);

    // 'original' is selected by default, pressing it again should not call transform
    fireEvent.press(getByText('Original'));
    expect(PHOTO_FILTERS[0].transform).not.toHaveBeenCalled();
  });

  it('caches filter previews and reuses them', async () => {
    const { PHOTO_FILTERS } = require('../../services/PhotoFilters');
    const { getByText } = renderWithProviders(<ImageFilters {...defaultProps} />);

    // Apply vintage filter first time
    fireEvent.press(getByText('Vintage'));
    await waitFor(() => {
      expect(PHOTO_FILTERS[1].transform).toHaveBeenCalledTimes(1);
    });

    // Wait for processing to finish before pressing next filter
    await waitFor(() => {
      expect(getByText('B&W').parent?.parent?.props.disabled).toBeFalsy();
    });

    // Switch to B&W
    fireEvent.press(getByText('B&W'));
    await waitFor(() => {
      expect(PHOTO_FILTERS[2].transform).toHaveBeenCalledTimes(1);
    });

    // Switch back to Vintage - should use cached version
    fireEvent.press(getByText('Vintage'));
    await waitFor(() => {
      // transform should still only have been called once for vintage
      expect(PHOTO_FILTERS[1].transform).toHaveBeenCalledTimes(1);
    });
  });
});
