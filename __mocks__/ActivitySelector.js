import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Mock ActivitySelector component
const ActivitySelector = ({ onSelectionChange, showCategories, allowMultiSelect, maxSelections, selectedCategory }) => {
  // Simulate some activities for testing
  const mockActivities = [
    { id: '1', name: 'Running', category: 'Sports' },
    { id: '2', name: 'Coding', category: 'Technology' },
    { id: '3', name: 'Painting', category: 'Creative' },
  ];

  const handleActivityPress = (activityId) => {
    // In a real test, you might want to call onSelectionChange manually
    // or simulate specific selections.
    if (onSelectionChange) {
      onSelectionChange([activityId]); // Simulate single selection for simplicity
    }
  };

  return (
    <View testID="mock-activity-selector">
      <Text>Mock Activity Selector</Text>
      {mockActivities.map(activity => (
        <TouchableOpacity key={activity.id} onPress={() => handleActivityPress(activity.id)}>
          <Text>{activity.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ActivitySelector;
