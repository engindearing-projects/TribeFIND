import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// Mock the Navigation component
jest.mock('../navigation', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(Text, null, 'Navigation'),
  };
});

// Mock AuthService
jest.mock('../services/AuthService', () => {
  const React = require('react');
  return {
    AuthProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

describe('App', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the Navigation component', () => {
    const { getByText } = render(<App />);
    expect(getByText('Navigation')).toBeTruthy();
  });
});
