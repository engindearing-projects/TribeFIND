import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StoryGroup } from '../types/stories'

interface StoryCardProps {
  group: StoryGroup
  isMyStory?: boolean
  onPress: () => void
  onAddPress?: () => void
}

export default function StoryCard({ group, isMyStory, onPress, onAddPress }: StoryCardProps) {
  const hasAvatar = group.avatar && group.avatar.length > 0

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={isMyStory && group.stories.length === 0 ? onAddPress : onPress}
      testID={isMyStory ? 'my-story-card' : `story-card-${group.user_id}`}
    >
      <View style={[styles.avatarRing, group.has_unviewed && styles.unviewedRing]}>
        {hasAvatar ? (
          <Image source={{ uri: group.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {group.display_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {isMyStory && (
          <TouchableOpacity style={styles.addBadge} onPress={onAddPress} testID="add-story-button">
            <Ionicons name="add" size={14} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.username} numberOfLines={1}>
        {isMyStory ? 'My Story' : group.display_name}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 12,
    width: 72,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  unviewedRing: {
    borderColor: '#a855f7',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(168,85,247,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  addBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e1b4b',
  },
  username: {
    fontSize: 11,
    color: '#fff',
    textAlign: 'center',
  },
})
