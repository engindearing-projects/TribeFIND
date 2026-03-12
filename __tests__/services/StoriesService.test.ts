import { fetchStoryGroups, createStory, recordStoryView, deleteStory } from '../../services/StoriesService';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}));

const now = new Date();
const futureExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

const mockStoryRow = {
  id: 'story-1',
  user_id: 'user-1',
  media_url: 'https://example.com/photo.jpg',
  media_type: 'image',
  caption: 'Test',
  created_at: now.toISOString(),
  expires_at: futureExpiry,
  story_views: [{ user_id: 'user-2', viewed_at: now.toISOString() }],
  users: { username: 'alice', display_name: 'Alice', avatar: 'https://example.com/alice.png' },
};

describe('StoriesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchStoryGroups', () => {
    it('returns grouped stories on success', async () => {
      const orderMock = jest.fn().mockResolvedValue({ data: [mockStoryRow], error: null });
      const gteMock = jest.fn().mockReturnValue({ order: orderMock });
      const gtMock = jest.fn().mockReturnValue({ gte: gteMock });
      const selectMock = jest.fn().mockReturnValue({ gt: gtMock });
      (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

      const groups = await fetchStoryGroups('user-2');

      expect(supabase.from).toHaveBeenCalledWith('stories');
      expect(groups).toHaveLength(1);
      expect(groups[0].user_id).toBe('user-1');
      expect(groups[0].display_name).toBe('Alice');
      expect(groups[0].stories).toHaveLength(1);
      expect(groups[0].has_unviewed).toBe(false); // user-2 already viewed
    });

    it('returns empty array on error', async () => {
      const orderMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } });
      const gteMock = jest.fn().mockReturnValue({ order: orderMock });
      const gtMock = jest.fn().mockReturnValue({ gte: gteMock });
      const selectMock = jest.fn().mockReturnValue({ gt: gtMock });
      (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

      const groups = await fetchStoryGroups('user-1');
      expect(groups).toEqual([]);
    });

    it('marks unviewed stories correctly', async () => {
      const orderMock = jest.fn().mockResolvedValue({ data: [mockStoryRow], error: null });
      const gteMock = jest.fn().mockReturnValue({ order: orderMock });
      const gtMock = jest.fn().mockReturnValue({ gte: gteMock });
      const selectMock = jest.fn().mockReturnValue({ gt: gtMock });
      (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

      const groups = await fetchStoryGroups('user-3'); // user-3 hasn't viewed
      expect(groups[0].has_unviewed).toBe(true);
    });
  });

  describe('createStory', () => {
    it('creates a story and returns it', async () => {
      const singleMock = jest.fn().mockResolvedValue({
        data: {
          id: 'new-story',
          user_id: 'user-1',
          media_url: 'https://example.com/photo.jpg',
          media_type: 'image',
          caption: 'Hello',
          created_at: now.toISOString(),
          expires_at: futureExpiry,
        },
        error: null,
      });
      const selectMock = jest.fn().mockReturnValue({ single: singleMock });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });
      (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

      const story = await createStory('user-1', 'https://example.com/photo.jpg', 'image', 'Hello');

      expect(supabase.from).toHaveBeenCalledWith('stories');
      expect(story).not.toBeNull();
      expect(story!.id).toBe('new-story');
      expect(story!.views).toEqual([]);
    });

    it('returns null on error', async () => {
      const singleMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } });
      const selectMock = jest.fn().mockReturnValue({ single: singleMock });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });
      (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

      const story = await createStory('user-1', 'https://example.com/photo.jpg', 'image');
      expect(story).toBeNull();
    });
  });

  describe('recordStoryView', () => {
    it('upserts a story view record', async () => {
      const upsertMock = jest.fn().mockResolvedValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue({ upsert: upsertMock });

      await recordStoryView('story-1', 'user-2');

      expect(supabase.from).toHaveBeenCalledWith('story_views');
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({ story_id: 'story-1', user_id: 'user-2' }),
        { onConflict: 'story_id,user_id' }
      );
    });

    it('handles errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const upsertMock = jest.fn().mockResolvedValue({ error: { message: 'fail' } });
      (supabase.from as jest.Mock).mockReturnValue({ upsert: upsertMock });

      await recordStoryView('story-1', 'user-2');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('deleteStory', () => {
    it('deletes a story and returns true', async () => {
      const eqMock = jest.fn().mockResolvedValue({ error: null });
      const deleteMock = jest.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as jest.Mock).mockReturnValue({ delete: deleteMock });

      const result = await deleteStory('story-1');
      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('stories');
    });

    it('returns false on error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const eqMock = jest.fn().mockResolvedValue({ error: { message: 'fail' } });
      const deleteMock = jest.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as jest.Mock).mockReturnValue({ delete: deleteMock });

      const result = await deleteStory('story-1');
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });
});
