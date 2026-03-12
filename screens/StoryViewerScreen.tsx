import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, StatusBar,
  TouchableWithoutFeedback, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppSelector, useAppDispatch } from '../store'
import { markStoryViewed, setViewingStoryIndex, setViewingGroup } from '../store/storiesSlice'
import { recordStoryView } from '../services/StoriesService'
import StoryProgressBar from '../components/StoryProgressBar'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const STORY_DURATION = 5000

export default function StoryViewerScreen({ navigation }: any) {
  const dispatch = useAppDispatch()
  const { storyGroups, viewingGroupIndex, viewingStoryIndex } = useAppSelector(state => state.stories)
  const currentUser = useAppSelector(state => state.auth.user)
  const [paused, setPaused] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const group = viewingGroupIndex !== null ? storyGroups[viewingGroupIndex] : null
  const story = group?.stories[viewingStoryIndex]

  useEffect(() => {
    if (!story || !currentUser) return

    recordStoryView(story.id, currentUser.id)
    dispatch(markStoryViewed({ storyId: story.id, userId: currentUser.id }))
  }, [story?.id])

  const goNext = useCallback(() => {
    if (!group) return

    if (viewingStoryIndex < group.stories.length - 1) {
      dispatch(setViewingStoryIndex(viewingStoryIndex + 1))
    } else if (viewingGroupIndex !== null && viewingGroupIndex < storyGroups.length - 1) {
      dispatch(setViewingGroup(viewingGroupIndex + 1))
    } else {
      close()
    }
  }, [viewingStoryIndex, viewingGroupIndex, group, storyGroups.length])

  const goPrev = useCallback(() => {
    if (viewingStoryIndex > 0) {
      dispatch(setViewingStoryIndex(viewingStoryIndex - 1))
    } else if (viewingGroupIndex !== null && viewingGroupIndex > 0) {
      const prevGroup = storyGroups[viewingGroupIndex - 1]
      dispatch(setViewingGroup(viewingGroupIndex - 1))
      dispatch(setViewingStoryIndex(prevGroup.stories.length - 1))
    }
  }, [viewingStoryIndex, viewingGroupIndex, storyGroups])

  const close = useCallback(() => {
    dispatch(setViewingGroup(null))
    navigation.goBack()
  }, [])

  const handleTap = useCallback((evt: any) => {
    const x = evt.nativeEvent.locationX
    if (x < SCREEN_WIDTH / 3) {
      goPrev()
    } else {
      goNext()
    }
  }, [goPrev, goNext])

  if (!group || !story) {
    return null
  }

  const timeAgo = getTimeAgo(story.created_at)

  return (
    <View style={styles.container} testID="story-viewer-screen">
      <StatusBar hidden />

      <TouchableWithoutFeedback
        onPress={handleTap}
        onLongPress={() => setPaused(true)}
        onPressOut={() => setPaused(false)}
      >
        <View style={styles.mediaContainer}>
          {imageLoading && (
            <ActivityIndicator size="large" color="#a855f7" style={styles.loader} />
          )}
          <Image
            source={{ uri: story.media_url }}
            style={styles.media}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
          />
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.overlay}>
        <StoryProgressBar
          count={group.stories.length}
          activeIndex={viewingStoryIndex}
          duration={STORY_DURATION}
          paused={paused || imageLoading}
          onComplete={goNext}
        />

        <View style={styles.header}>
          <View style={styles.userInfo}>
            {group.avatar ? (
              <Image source={{ uri: group.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>{group.display_name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <Text style={styles.displayName}>{group.display_name}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
          <TouchableOpacity onPress={close} testID="close-story-button">
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {story.caption ? (
          <View style={styles.captionContainer}>
            <Text style={styles.caption}>{story.caption}</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  return `${hours}h`
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mediaContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loader: {
    position: 'absolute',
    zIndex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(168,85,247,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  displayName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  timeAgo: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginLeft: 8,
  },
  captionContainer: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  caption: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
})
