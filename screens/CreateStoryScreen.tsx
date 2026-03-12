import React, { useState } from 'react'
import {
  View, Text, TextInput, Image, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useAppSelector, useAppDispatch } from '../store'
import { addStory } from '../store/storiesSlice'
import { uploadStoryMedia, createStory } from '../services/StoriesService'

export default function CreateStoryScreen({ navigation }: any) {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.auth.user)
  const [mediaUri, setMediaUri] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [caption, setCaption] = useState('')
  const [posting, setPosting] = useState(false)

  const pickMedia = async (source: 'camera' | 'library') => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 0.8,
    }

    let result: ImagePicker.ImagePickerResult

    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync()
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Camera access is required to take a story photo.')
        return
      }
      result = await ImagePicker.launchCameraAsync(options)
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options)
    }

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      setMediaUri(asset.uri)
      setMediaType(asset.type === 'video' ? 'video' : 'image')
    }
  }

  const handlePost = async () => {
    if (!mediaUri || !user) return

    setPosting(true)
    try {
      const publicUrl = await uploadStoryMedia(user.id, mediaUri, mediaType)
      if (!publicUrl) {
        Alert.alert('Upload failed', 'Could not upload your story. Please try again.')
        setPosting(false)
        return
      }

      const story = await createStory(user.id, publicUrl, mediaType, caption || undefined)
      if (story) {
        dispatch(addStory(story))
        navigation.goBack()
      } else {
        Alert.alert('Error', 'Could not create your story. Please try again.')
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  return (
    <LinearGradient colors={['#1e1b4b', '#312e81', '#6366f1']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} testID="create-story-screen">
        <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} testID="close-create-story">
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>New Story</Text>
            <View style={{ width: 28 }} />
          </View>

          {mediaUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: mediaUri }} style={styles.preview} resizeMode="cover" />
              <TouchableOpacity
                style={styles.removeMedia}
                onPress={() => setMediaUri(null)}
                testID="remove-media-button"
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.pickContainer}>
              <TouchableOpacity style={styles.pickButton} onPress={() => pickMedia('camera')} testID="camera-pick-button">
                <Ionicons name="camera-outline" size={40} color="#a855f7" />
                <Text style={styles.pickLabel}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickButton} onPress={() => pickMedia('library')} testID="library-pick-button">
                <Ionicons name="images-outline" size={40} color="#a855f7" />
                <Text style={styles.pickLabel}>Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          {mediaUri && (
            <>
              <TextInput
                style={styles.captionInput}
                placeholder="Add a caption..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={caption}
                onChangeText={setCaption}
                maxLength={200}
                multiline
                testID="story-caption-input"
              />
              <TouchableOpacity
                style={[styles.postButton, posting && styles.postButtonDisabled]}
                onPress={handlePost}
                disabled={posting}
                testID="post-story-button"
              >
                {posting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.postButtonText}>Share Story</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  previewContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  preview: {
    flex: 1,
    borderRadius: 16,
  },
  removeMedia: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  pickContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  pickButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  pickLabel: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  captionInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    maxHeight: 100,
  },
  postButton: {
    backgroundColor: '#a855f7',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
