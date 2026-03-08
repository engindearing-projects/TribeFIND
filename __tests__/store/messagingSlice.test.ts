import messagingReducer, {
  setChatRooms,
  addChatRoom,
  setMessages,
  addMessage,
  setCurrentChatRoom,
  setLoadingMessages,
  setLoadingChatRooms,
  setTypingUsers,
  clearMessages,
  markChatRoomAsRead,
} from '../../store/messagingSlice';

const mockMessage = {
  id: 'msg-1',
  chat_room_id: 'room-1',
  sender_id: 'user-1',
  content: 'Hello!',
  message_type: 'text' as const,
  created_at: '2024-06-01T12:00:00Z',
  sender: {
    username: 'alice',
    display_name: 'Alice',
    avatar: 'https://example.com/alice.png',
  },
};

const mockMessage2 = {
  id: 'msg-2',
  chat_room_id: 'room-1',
  sender_id: 'user-2',
  content: 'Hi there!',
  message_type: 'text' as const,
  created_at: '2024-06-01T12:01:00Z',
};

const mockChatRoom = {
  id: 'room-1',
  name: 'Test Room',
  type: 'direct' as const,
  participants: ['user-1', 'user-2'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T12:00:00Z',
  unread_count: 3,
};

const mockChatRoom2 = {
  id: 'room-2',
  name: 'Group Chat',
  type: 'group' as const,
  participants: ['user-1', 'user-2', 'user-3'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T11:00:00Z',
  unread_count: 5,
};

describe('messagingSlice', () => {
  const initialState = {
    chatRooms: [],
    messages: {},
    currentChatRoom: null,
    loadingMessages: false,
    loadingChatRooms: false,
    totalUnreadCount: 0,
    typingUsers: {},
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = messagingReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should start with no current chat room', () => {
      const state = messagingReducer(undefined, { type: 'unknown' });
      expect(state.currentChatRoom).toBeNull();
    });

    it('should start with zero unread count', () => {
      const state = messagingReducer(undefined, { type: 'unknown' });
      expect(state.totalUnreadCount).toBe(0);
    });
  });

  describe('setChatRooms', () => {
    it('should set chat rooms and calculate total unread', () => {
      const state = messagingReducer(initialState, setChatRooms([mockChatRoom, mockChatRoom2]));
      expect(state.chatRooms).toHaveLength(2);
      expect(state.totalUnreadCount).toBe(8); // 3 + 5
    });

    it('should set loadingChatRooms to false', () => {
      const loadingState = { ...initialState, loadingChatRooms: true };
      const state = messagingReducer(loadingState, setChatRooms([]));
      expect(state.loadingChatRooms).toBe(false);
    });

    it('should handle rooms with zero unread', () => {
      const roomNoUnread = { ...mockChatRoom, unread_count: 0 };
      const state = messagingReducer(initialState, setChatRooms([roomNoUnread]));
      expect(state.totalUnreadCount).toBe(0);
    });
  });

  describe('addChatRoom', () => {
    it('should add a new chat room', () => {
      const state = messagingReducer(initialState, addChatRoom(mockChatRoom));
      expect(state.chatRooms).toHaveLength(1);
      expect(state.chatRooms[0]).toEqual(mockChatRoom);
    });

    it('should update existing chat room with same id (dedup)', () => {
      const stateWithRoom = { ...initialState, chatRooms: [mockChatRoom] };
      const updatedRoom = { ...mockChatRoom, name: 'Updated Room', unread_count: 0 };
      const state = messagingReducer(stateWithRoom, addChatRoom(updatedRoom));
      expect(state.chatRooms).toHaveLength(1);
      expect(state.chatRooms[0].name).toBe('Updated Room');
    });

    it('should recalculate total unread count', () => {
      const stateWithRoom = { ...initialState, chatRooms: [mockChatRoom], totalUnreadCount: 3 };
      const state = messagingReducer(stateWithRoom, addChatRoom(mockChatRoom2));
      expect(state.totalUnreadCount).toBe(8); // 3 + 5
    });
  });

  describe('setMessages', () => {
    it('should set messages for a chat room', () => {
      const messages = [mockMessage, mockMessage2];
      const state = messagingReducer(
        initialState,
        setMessages({ chatRoomId: 'room-1', messages })
      );
      expect(state.messages['room-1']).toEqual(messages);
    });

    it('should set loadingMessages to false', () => {
      const loadingState = { ...initialState, loadingMessages: true };
      const state = messagingReducer(
        loadingState,
        setMessages({ chatRoomId: 'room-1', messages: [] })
      );
      expect(state.loadingMessages).toBe(false);
    });

    it('should replace existing messages for same room', () => {
      const stateWithMessages = { ...initialState, messages: { 'room-1': [mockMessage] } };
      const state = messagingReducer(
        stateWithMessages,
        setMessages({ chatRoomId: 'room-1', messages: [mockMessage2] })
      );
      expect(state.messages['room-1']).toEqual([mockMessage2]);
    });
  });

  describe('addMessage', () => {
    it('should add a message to a chat room', () => {
      const state = messagingReducer(initialState, addMessage(mockMessage));
      expect(state.messages['room-1']).toHaveLength(1);
      expect(state.messages['room-1'][0]).toEqual(mockMessage);
    });

    it('should create messages array if room does not exist', () => {
      const state = messagingReducer(initialState, addMessage(mockMessage));
      expect(state.messages['room-1']).toBeDefined();
    });

    it('should not add duplicate message', () => {
      const stateWithMessage = { ...initialState, messages: { 'room-1': [mockMessage] } };
      const state = messagingReducer(stateWithMessage, addMessage(mockMessage));
      expect(state.messages['room-1']).toHaveLength(1);
    });

    it('should sort messages by timestamp', () => {
      const olderMessage = { ...mockMessage2, id: 'msg-older', created_at: '2024-06-01T11:00:00Z' };
      let state = messagingReducer(initialState, addMessage(mockMessage));
      state = messagingReducer(state, addMessage(olderMessage));
      expect(state.messages['room-1'][0].id).toBe('msg-older');
      expect(state.messages['room-1'][1].id).toBe('msg-1');
    });

    it('should update chat room last_message and updated_at', () => {
      const stateWithRoom = { ...initialState, chatRooms: [mockChatRoom] };
      const state = messagingReducer(stateWithRoom, addMessage(mockMessage));
      expect(state.chatRooms[0].last_message).toEqual(mockMessage);
      expect(state.chatRooms[0].updated_at).toBe(mockMessage.created_at);
    });

    it('should increment unread count when not in current chat room', () => {
      const roomWithZeroUnread = { ...mockChatRoom, unread_count: 0 };
      const stateWithRoom = { ...initialState, chatRooms: [roomWithZeroUnread], totalUnreadCount: 0 };
      const state = messagingReducer(stateWithRoom, addMessage(mockMessage));
      expect(state.chatRooms[0].unread_count).toBe(1);
      expect(state.totalUnreadCount).toBe(1);
    });

    it('should not increment unread count when in current chat room', () => {
      const roomWithZeroUnread = { ...mockChatRoom, unread_count: 0 };
      const stateInRoom = {
        ...initialState,
        chatRooms: [roomWithZeroUnread],
        currentChatRoom: 'room-1',
        totalUnreadCount: 0,
      };
      const state = messagingReducer(stateInRoom, addMessage(mockMessage));
      expect(state.chatRooms[0].unread_count).toBe(0);
      expect(state.totalUnreadCount).toBe(0);
    });
  });

  describe('setCurrentChatRoom', () => {
    it('should set the current chat room', () => {
      const state = messagingReducer(initialState, setCurrentChatRoom('room-1'));
      expect(state.currentChatRoom).toBe('room-1');
    });

    it('should set to null', () => {
      const stateInRoom = { ...initialState, currentChatRoom: 'room-1' };
      const state = messagingReducer(stateInRoom, setCurrentChatRoom(null));
      expect(state.currentChatRoom).toBeNull();
    });

    it('should mark chat room as read when entering', () => {
      const stateWithUnread = {
        ...initialState,
        chatRooms: [mockChatRoom], // unread_count: 3
        totalUnreadCount: 3,
      };
      const state = messagingReducer(stateWithUnread, setCurrentChatRoom('room-1'));
      expect(state.chatRooms[0].unread_count).toBe(0);
      expect(state.totalUnreadCount).toBe(0);
    });

    it('should correctly reduce total unread when entering a room', () => {
      const stateWithMultipleUnread = {
        ...initialState,
        chatRooms: [mockChatRoom, mockChatRoom2], // 3 + 5
        totalUnreadCount: 8,
      };
      const state = messagingReducer(stateWithMultipleUnread, setCurrentChatRoom('room-1'));
      expect(state.totalUnreadCount).toBe(5);
      expect(state.chatRooms[0].unread_count).toBe(0);
      expect(state.chatRooms[1].unread_count).toBe(5);
    });
  });

  describe('setLoadingMessages', () => {
    it('should set loading messages to true', () => {
      const state = messagingReducer(initialState, setLoadingMessages(true));
      expect(state.loadingMessages).toBe(true);
    });

    it('should set loading messages to false', () => {
      const state = messagingReducer({ ...initialState, loadingMessages: true }, setLoadingMessages(false));
      expect(state.loadingMessages).toBe(false);
    });
  });

  describe('setLoadingChatRooms', () => {
    it('should set loading chat rooms to true', () => {
      const state = messagingReducer(initialState, setLoadingChatRooms(true));
      expect(state.loadingChatRooms).toBe(true);
    });

    it('should set loading chat rooms to false', () => {
      const state = messagingReducer({ ...initialState, loadingChatRooms: true }, setLoadingChatRooms(false));
      expect(state.loadingChatRooms).toBe(false);
    });
  });

  describe('setTypingUsers', () => {
    it('should set typing users for a chat room', () => {
      const state = messagingReducer(
        initialState,
        setTypingUsers({ chatRoomId: 'room-1', userIds: ['user-2'] })
      );
      expect(state.typingUsers['room-1']).toEqual(['user-2']);
    });

    it('should clear typing users', () => {
      const stateWithTyping = { ...initialState, typingUsers: { 'room-1': ['user-2'] } };
      const state = messagingReducer(
        stateWithTyping,
        setTypingUsers({ chatRoomId: 'room-1', userIds: [] })
      );
      expect(state.typingUsers['room-1']).toEqual([]);
    });
  });

  describe('clearMessages', () => {
    it('should clear messages for a chat room', () => {
      const stateWithMessages = { ...initialState, messages: { 'room-1': [mockMessage] } };
      const state = messagingReducer(stateWithMessages, clearMessages('room-1'));
      expect(state.messages['room-1']).toBeUndefined();
    });

    it('should not affect other rooms', () => {
      const stateWithMessages = {
        ...initialState,
        messages: { 'room-1': [mockMessage], 'room-2': [mockMessage2] },
      };
      const state = messagingReducer(stateWithMessages, clearMessages('room-1'));
      expect(state.messages['room-2']).toBeDefined();
    });
  });

  describe('markChatRoomAsRead', () => {
    it('should mark a chat room as read', () => {
      const stateWithUnread = {
        ...initialState,
        chatRooms: [mockChatRoom], // unread_count: 3
        totalUnreadCount: 3,
      };
      const state = messagingReducer(stateWithUnread, markChatRoomAsRead('room-1'));
      expect(state.chatRooms[0].unread_count).toBe(0);
      expect(state.totalUnreadCount).toBe(0);
    });

    it('should not change total unread if already zero', () => {
      const roomNoUnread = { ...mockChatRoom, unread_count: 0 };
      const stateNoUnread = { ...initialState, chatRooms: [roomNoUnread], totalUnreadCount: 0 };
      const state = messagingReducer(stateNoUnread, markChatRoomAsRead('room-1'));
      expect(state.totalUnreadCount).toBe(0);
    });

    it('should handle non-existent room gracefully', () => {
      const state = messagingReducer(initialState, markChatRoomAsRead('non-existent'));
      expect(state.totalUnreadCount).toBe(0);
    });
  });
});
