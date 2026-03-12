import { supabase } from '../lib/supabase'
import { Story, StoryGroup } from '../types/stories'

const STORY_DURATION_HOURS = 24

export async function fetchStoryGroups(currentUserId: string): Promise<StoryGroup[]> {
  const cutoff = new Date(Date.now() - STORY_DURATION_HOURS * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('stories')
    .select(`
      id, user_id, media_url, media_type, caption, created_at, expires_at,
      story_views ( user_id, viewed_at ),
      users!stories_user_id_fkey ( username, display_name, avatar )
    `)
    .gt('expires_at', new Date().toISOString())
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch stories:', error.message)
    return []
  }

  const grouped: Record<string, StoryGroup> = {}

  for (const row of data || []) {
    const user = (row as any).users
    const views = ((row as any).story_views || []) as { user_id: string; viewed_at: string }[]

    if (!grouped[row.user_id]) {
      grouped[row.user_id] = {
        user_id: row.user_id,
        username: user?.username || '',
        display_name: user?.display_name || '',
        avatar: user?.avatar || '',
        stories: [],
        has_unviewed: false,
        latest_at: row.created_at,
      }
    }

    grouped[row.user_id].stories.push({
      id: row.id,
      user_id: row.user_id,
      media_url: row.media_url,
      media_type: row.media_type,
      caption: row.caption || undefined,
      created_at: row.created_at,
      expires_at: row.expires_at,
      views,
    })

    if (!views.some(v => v.user_id === currentUserId)) {
      grouped[row.user_id].has_unviewed = true
    }

    if (row.created_at > grouped[row.user_id].latest_at) {
      grouped[row.user_id].latest_at = row.created_at
    }
  }

  return Object.values(grouped).sort((a, b) => {
    if (a.user_id === currentUserId) return -1
    if (b.user_id === currentUserId) return 1
    if (a.has_unviewed !== b.has_unviewed) return a.has_unviewed ? -1 : 1
    return b.latest_at.localeCompare(a.latest_at)
  })
}

export async function createStory(
  userId: string,
  mediaUrl: string,
  mediaType: 'image' | 'video',
  caption?: string
): Promise<Story | null> {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + STORY_DURATION_HOURS * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('stories')
    .insert({
      user_id: userId,
      media_url: mediaUrl,
      media_type: mediaType,
      caption: caption || null,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create story:', error.message)
    return null
  }

  return { ...data, views: [] } as Story
}

export async function recordStoryView(storyId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('story_views')
    .upsert(
      { story_id: storyId, user_id: userId, viewed_at: new Date().toISOString() },
      { onConflict: 'story_id,user_id' }
    )

  if (error) {
    console.error('Failed to record story view:', error.message)
  }
}

export async function deleteStory(storyId: string): Promise<boolean> {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', storyId)

  if (error) {
    console.error('Failed to delete story:', error.message)
    return false
  }
  return true
}

export async function uploadStoryMedia(
  userId: string,
  uri: string,
  mediaType: 'image' | 'video'
): Promise<string | null> {
  const ext = mediaType === 'video' ? 'mp4' : 'jpg'
  const path = `stories/${userId}/${Date.now()}.${ext}`

  const response = await fetch(uri)
  const blob = await response.blob()

  const { error } = await supabase.storage
    .from('media')
    .upload(path, blob, { contentType: mediaType === 'video' ? 'video/mp4' : 'image/jpeg' })

  if (error) {
    console.error('Failed to upload story media:', error.message)
    return null
  }

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
}
