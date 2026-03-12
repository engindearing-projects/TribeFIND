export interface Story {
  id: string
  user_id: string
  media_url: string
  media_type: 'image' | 'video'
  caption?: string
  created_at: string
  expires_at: string
  views: StoryView[]
}

export interface StoryView {
  user_id: string
  viewed_at: string
}

export interface StoryGroup {
  user_id: string
  username: string
  display_name: string
  avatar: string
  stories: Story[]
  has_unviewed: boolean
  latest_at: string
}
