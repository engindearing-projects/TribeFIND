import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'

interface StoryProgressBarProps {
  count: number
  activeIndex: number
  duration: number
  paused: boolean
  onComplete: () => void
}

export default function StoryProgressBar({ count, activeIndex, duration, paused, onComplete }: StoryProgressBarProps) {
  const progress = useRef(new Animated.Value(0)).current
  const animationRef = useRef<Animated.CompositeAnimation | null>(null)

  useEffect(() => {
    progress.setValue(0)

    if (paused) return

    animationRef.current = Animated.timing(progress, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    })

    animationRef.current.start(({ finished }) => {
      if (finished) onComplete()
    })

    return () => {
      animationRef.current?.stop()
    }
  }, [activeIndex, paused])

  return (
    <View style={styles.container} testID="story-progress-bar">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.segmentWrapper}>
          <View style={styles.segmentBg} />
          {i < activeIndex ? (
            <View style={[styles.segmentFill, { width: '100%' }]} />
          ) : i === activeIndex ? (
            <Animated.View
              style={[
                styles.segmentFill,
                {
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          ) : null}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 4,
  },
  segmentWrapper: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  segmentBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
  },
  segmentFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 1.5,
  },
})
