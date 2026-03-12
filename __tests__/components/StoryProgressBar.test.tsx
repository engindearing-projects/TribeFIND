import React from 'react';
import { render } from '@testing-library/react-native';
import StoryProgressBar from '../../components/StoryProgressBar';

describe('StoryProgressBar', () => {
  const defaultProps = {
    count: 3,
    activeIndex: 0,
    duration: 5000,
    paused: false,
    onComplete: jest.fn(),
  };

  it('renders the correct number of segments', () => {
    const { getByTestId } = render(<StoryProgressBar {...defaultProps} />);
    const container = getByTestId('story-progress-bar');
    // 3 segments, each with a wrapper containing bg + possible fill
    expect(container.children).toHaveLength(3);
  });

  it('renders with testID', () => {
    const { getByTestId } = render(<StoryProgressBar {...defaultProps} />);
    expect(getByTestId('story-progress-bar')).toBeTruthy();
  });

  it('renders single segment for one story', () => {
    const { getByTestId } = render(
      <StoryProgressBar {...defaultProps} count={1} />
    );
    const container = getByTestId('story-progress-bar');
    expect(container.children).toHaveLength(1);
  });

  it('does not crash when paused', () => {
    const { getByTestId } = render(
      <StoryProgressBar {...defaultProps} paused={true} />
    );
    expect(getByTestId('story-progress-bar')).toBeTruthy();
  });

  it('does not crash with activeIndex in the middle', () => {
    const { getByTestId } = render(
      <StoryProgressBar {...defaultProps} activeIndex={1} />
    );
    expect(getByTestId('story-progress-bar')).toBeTruthy();
  });
});
