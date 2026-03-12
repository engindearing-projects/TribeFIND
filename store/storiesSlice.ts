import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Story, StoryGroup } from '../types/stories'

interface StoriesState {
  storyGroups: StoryGroup[]
  myStories: Story[]
  loading: boolean
  viewingGroupIndex: number | null
  viewingStoryIndex: number
}

const initialState: StoriesState = {
  storyGroups: [],
  myStories: [],
  loading: false,
  viewingGroupIndex: null,
  viewingStoryIndex: 0,
}

const storiesSlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    setStoryGroups: (state, action: PayloadAction<StoryGroup[]>) => {
      state.storyGroups = action.payload
      state.loading = false
    },
    setMyStories: (state, action: PayloadAction<Story[]>) => {
      state.myStories = action.payload
    },
    addStory: (state, action: PayloadAction<Story>) => {
      state.myStories.unshift(action.payload)
    },
    removeExpiredStories: (state) => {
      const now = new Date().toISOString()
      state.myStories = state.myStories.filter(s => s.expires_at > now)
      state.storyGroups = state.storyGroups
        .map(group => ({
          ...group,
          stories: group.stories.filter(s => s.expires_at > now),
        }))
        .filter(group => group.stories.length > 0)
    },
    markStoryViewed: (state, action: PayloadAction<{ storyId: string; userId: string }>) => {
      const { storyId, userId } = action.payload
      for (const group of state.storyGroups) {
        const story = group.stories.find(s => s.id === storyId)
        if (story && !story.views.some(v => v.user_id === userId)) {
          story.views.push({ user_id: userId, viewed_at: new Date().toISOString() })
        }
        group.has_unviewed = group.stories.some(
          s => !s.views.some(v => v.user_id === userId)
        )
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setViewingGroup: (state, action: PayloadAction<number | null>) => {
      state.viewingGroupIndex = action.payload
      state.viewingStoryIndex = 0
    },
    setViewingStoryIndex: (state, action: PayloadAction<number>) => {
      state.viewingStoryIndex = action.payload
    },
    deleteStory: (state, action: PayloadAction<string>) => {
      state.myStories = state.myStories.filter(s => s.id !== action.payload)
    },
  },
})

export const {
  setStoryGroups,
  setMyStories,
  addStory,
  removeExpiredStories,
  markStoryViewed,
  setLoading,
  setViewingGroup,
  setViewingStoryIndex,
  deleteStory,
} = storiesSlice.actions

export default storiesSlice.reducer
