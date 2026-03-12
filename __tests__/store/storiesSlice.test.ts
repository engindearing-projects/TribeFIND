import storiesReducer, {
  setStoryGroups,
  setMyStories,
  addStory,
  removeExpiredStories,
  markStoryViewed,
  setLoading,
  setViewingGroup,
  setViewingStoryIndex,
  deleteStory,
} from '../../store/storiesSlice';

const now = new Date();
const futureExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
const pastExpiry = new Date(now.getTime() - 1000).toISOString();

const mockStory = {
  id: 'story-1',
  user_id: 'user-1',
  media_url: 'https://example.com/photo.jpg',
  media_type: 'image' as const,
  caption: 'Hello world',
  created_at: now.toISOString(),
  expires_at: futureExpiry,
  views: [],
};

const mockStory2 = {
  id: 'story-2',
  user_id: 'user-1',
  media_url: 'https://example.com/photo2.jpg',
  media_type: 'image' as const,
  created_at: now.toISOString(),
  expires_at: futureExpiry,
  views: [{ user_id: 'user-2', viewed_at: now.toISOString() }],
};

const mockStoryGroup = {
  user_id: 'user-1',
  username: 'alice',
  display_name: 'Alice',
  avatar: 'https://example.com/alice.png',
  stories: [mockStory, mockStory2],
  has_unviewed: true,
  latest_at: now.toISOString(),
};

const mockStoryGroup2 = {
  user_id: 'user-2',
  username: 'bob',
  display_name: 'Bob',
  avatar: 'https://example.com/bob.png',
  stories: [{
    ...mockStory,
    id: 'story-3',
    user_id: 'user-2',
  }],
  has_unviewed: false,
  latest_at: now.toISOString(),
};

describe('storiesSlice', () => {
  const initialState = {
    storyGroups: [],
    myStories: [],
    loading: false,
    viewingGroupIndex: null,
    viewingStoryIndex: 0,
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = storiesReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should start with no viewing group', () => {
      const state = storiesReducer(undefined, { type: 'unknown' });
      expect(state.viewingGroupIndex).toBeNull();
    });
  });

  describe('setStoryGroups', () => {
    it('should set story groups', () => {
      const state = storiesReducer(initialState, setStoryGroups([mockStoryGroup, mockStoryGroup2]));
      expect(state.storyGroups).toHaveLength(2);
      expect(state.storyGroups[0].user_id).toBe('user-1');
    });

    it('should set loading to false', () => {
      const loadingState = { ...initialState, loading: true };
      const state = storiesReducer(loadingState, setStoryGroups([]));
      expect(state.loading).toBe(false);
    });
  });

  describe('setMyStories', () => {
    it('should set my stories', () => {
      const state = storiesReducer(initialState, setMyStories([mockStory, mockStory2]));
      expect(state.myStories).toHaveLength(2);
    });
  });

  describe('addStory', () => {
    it('should prepend a new story to myStories', () => {
      const stateWithStories = { ...initialState, myStories: [mockStory2] };
      const state = storiesReducer(stateWithStories, addStory(mockStory));
      expect(state.myStories).toHaveLength(2);
      expect(state.myStories[0].id).toBe('story-1');
    });
  });

  describe('removeExpiredStories', () => {
    it('should remove expired stories from myStories', () => {
      const expiredStory = { ...mockStory, id: 'expired', expires_at: pastExpiry };
      const stateWithExpired = { ...initialState, myStories: [mockStory, expiredStory] };
      const state = storiesReducer(stateWithExpired, removeExpiredStories());
      expect(state.myStories).toHaveLength(1);
      expect(state.myStories[0].id).toBe('story-1');
    });

    it('should remove expired stories from groups', () => {
      const expiredStory = { ...mockStory, id: 'expired', expires_at: pastExpiry };
      const groupWithExpired = {
        ...mockStoryGroup,
        stories: [mockStory, expiredStory],
      };
      const stateWithExpired = { ...initialState, storyGroups: [groupWithExpired] };
      const state = storiesReducer(stateWithExpired, removeExpiredStories());
      expect(state.storyGroups[0].stories).toHaveLength(1);
    });

    it('should remove groups with no stories left', () => {
      const allExpiredGroup = {
        ...mockStoryGroup2,
        stories: [{ ...mockStory, id: 'expired', user_id: 'user-2', expires_at: pastExpiry }],
      };
      const stateWithExpired = { ...initialState, storyGroups: [mockStoryGroup, allExpiredGroup] };
      const state = storiesReducer(stateWithExpired, removeExpiredStories());
      expect(state.storyGroups).toHaveLength(1);
      expect(state.storyGroups[0].user_id).toBe('user-1');
    });
  });

  describe('markStoryViewed', () => {
    it('should add a view to the story', () => {
      const stateWithGroups = { ...initialState, storyGroups: [mockStoryGroup] };
      const state = storiesReducer(stateWithGroups, markStoryViewed({ storyId: 'story-1', userId: 'user-3' }));
      const story = state.storyGroups[0].stories.find(s => s.id === 'story-1');
      expect(story?.views).toHaveLength(1);
      expect(story?.views[0].user_id).toBe('user-3');
    });

    it('should not add duplicate views', () => {
      const stateWithGroups = { ...initialState, storyGroups: [mockStoryGroup] };
      const state = storiesReducer(stateWithGroups, markStoryViewed({ storyId: 'story-2', userId: 'user-2' }));
      const story = state.storyGroups[0].stories.find(s => s.id === 'story-2');
      expect(story?.views).toHaveLength(1);
    });

    it('should update has_unviewed flag', () => {
      const groupAllViewed = {
        ...mockStoryGroup,
        stories: [mockStory], // only story-1 with no views
        has_unviewed: true,
      };
      const stateWithGroups = { ...initialState, storyGroups: [groupAllViewed] };
      const state = storiesReducer(stateWithGroups, markStoryViewed({ storyId: 'story-1', userId: 'user-3' }));
      expect(state.storyGroups[0].has_unviewed).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      const state = storiesReducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);
    });

    it('should set loading to false', () => {
      const state = storiesReducer({ ...initialState, loading: true }, setLoading(false));
      expect(state.loading).toBe(false);
    });
  });

  describe('setViewingGroup', () => {
    it('should set viewing group index', () => {
      const state = storiesReducer(initialState, setViewingGroup(1));
      expect(state.viewingGroupIndex).toBe(1);
      expect(state.viewingStoryIndex).toBe(0);
    });

    it('should reset story index when changing group', () => {
      const stateViewing = { ...initialState, viewingGroupIndex: 0, viewingStoryIndex: 3 };
      const state = storiesReducer(stateViewing, setViewingGroup(1));
      expect(state.viewingStoryIndex).toBe(0);
    });

    it('should set to null to close viewer', () => {
      const stateViewing = { ...initialState, viewingGroupIndex: 0 };
      const state = storiesReducer(stateViewing, setViewingGroup(null));
      expect(state.viewingGroupIndex).toBeNull();
    });
  });

  describe('setViewingStoryIndex', () => {
    it('should set the viewing story index', () => {
      const state = storiesReducer(initialState, setViewingStoryIndex(2));
      expect(state.viewingStoryIndex).toBe(2);
    });
  });

  describe('deleteStory', () => {
    it('should remove a story from myStories', () => {
      const stateWithStories = { ...initialState, myStories: [mockStory, mockStory2] };
      const state = storiesReducer(stateWithStories, deleteStory('story-1'));
      expect(state.myStories).toHaveLength(1);
      expect(state.myStories[0].id).toBe('story-2');
    });

    it('should handle deleting non-existent story gracefully', () => {
      const stateWithStories = { ...initialState, myStories: [mockStory] };
      const state = storiesReducer(stateWithStories, deleteStory('non-existent'));
      expect(state.myStories).toHaveLength(1);
    });
  });
});
