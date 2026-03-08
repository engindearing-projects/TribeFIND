import contactsReducer, {
  setContacts,
  addContact,
  updateContactLocation,
  updateContactStatus,
  setSearchQuery,
  addPendingRequest,
  removePendingRequest,
  blockContact,
  unblockContact,
  updateNearbyContacts,
  setLoadingContacts,
  removeContact,
} from '../../store/contactsSlice';

const mockContact = {
  id: 'contact-1',
  username: 'alice',
  display_name: 'Alice',
  avatar: 'https://example.com/alice.png',
  isOnline: true,
  status: 'friend' as const,
};

const mockContact2 = {
  id: 'contact-2',
  username: 'bob',
  display_name: 'Bob',
  avatar: 'https://example.com/bob.png',
  isOnline: false,
  status: 'friend' as const,
};

describe('contactsSlice', () => {
  const initialState = {
    contacts: [],
    searchQuery: '',
    pendingRequests: [],
    blockedUsers: [],
    nearbyContacts: [],
    loadingContacts: false,
    contactUpdates: 0,
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = contactsReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should start with empty contacts', () => {
      const state = contactsReducer(undefined, { type: 'unknown' });
      expect(state.contacts).toEqual([]);
    });

    it('should start with loading false', () => {
      const state = contactsReducer(undefined, { type: 'unknown' });
      expect(state.loadingContacts).toBe(false);
    });
  });

  describe('setContacts', () => {
    it('should set contacts array', () => {
      const contacts = [mockContact, mockContact2];
      const state = contactsReducer(initialState, setContacts(contacts));
      expect(state.contacts).toEqual(contacts);
    });

    it('should set loadingContacts to false', () => {
      const loadingState = { ...initialState, loadingContacts: true };
      const state = contactsReducer(loadingState, setContacts([mockContact]));
      expect(state.loadingContacts).toBe(false);
    });

    it('should replace existing contacts', () => {
      const stateWithContacts = { ...initialState, contacts: [mockContact] };
      const state = contactsReducer(stateWithContacts, setContacts([mockContact2]));
      expect(state.contacts).toEqual([mockContact2]);
    });
  });

  describe('addContact', () => {
    it('should add a new contact', () => {
      const state = contactsReducer(initialState, addContact(mockContact));
      expect(state.contacts).toHaveLength(1);
      expect(state.contacts[0]).toEqual(mockContact);
    });

    it('should update existing contact with same id (dedup)', () => {
      const stateWithContact = { ...initialState, contacts: [mockContact] };
      const updatedContact = { ...mockContact, display_name: 'Alice Updated' };
      const state = contactsReducer(stateWithContact, addContact(updatedContact));
      expect(state.contacts).toHaveLength(1);
      expect(state.contacts[0].display_name).toBe('Alice Updated');
    });

    it('should add multiple different contacts', () => {
      let state = contactsReducer(initialState, addContact(mockContact));
      state = contactsReducer(state, addContact(mockContact2));
      expect(state.contacts).toHaveLength(2);
    });
  });

  describe('updateContactLocation', () => {
    it('should update location for existing contact', () => {
      const stateWithContact = { ...initialState, contacts: [mockContact] };
      const location = { latitude: 40.7128, longitude: -74.006, timestamp: '2024-06-01T12:00:00Z' };
      const state = contactsReducer(
        stateWithContact,
        updateContactLocation({ contactId: 'contact-1', location })
      );
      expect(state.contacts[0].location).toEqual(location);
    });

    it('should increment contactUpdates counter', () => {
      const stateWithContact = { ...initialState, contacts: [mockContact] };
      const location = { latitude: 40.7128, longitude: -74.006, timestamp: '2024-06-01T12:00:00Z' };
      const state = contactsReducer(
        stateWithContact,
        updateContactLocation({ contactId: 'contact-1', location })
      );
      expect(state.contactUpdates).toBe(1);
    });

    it('should increment contactUpdates even for non-existent contact', () => {
      const state = contactsReducer(
        initialState,
        updateContactLocation({
          contactId: 'non-existent',
          location: { latitude: 0, longitude: 0, timestamp: '2024-06-01T12:00:00Z' },
        })
      );
      expect(state.contactUpdates).toBe(1);
    });

    it('should set lastSeen on the contact', () => {
      const stateWithContact = { ...initialState, contacts: [mockContact] };
      const location = { latitude: 40.7128, longitude: -74.006, timestamp: '2024-06-01T12:00:00Z' };
      const state = contactsReducer(
        stateWithContact,
        updateContactLocation({ contactId: 'contact-1', location })
      );
      expect(state.contacts[0].lastSeen).toBeDefined();
    });
  });

  describe('updateContactStatus', () => {
    it('should update online status', () => {
      const stateWithContact = { ...initialState, contacts: [mockContact] };
      const state = contactsReducer(
        stateWithContact,
        updateContactStatus({ contactId: 'contact-1', isOnline: false })
      );
      expect(state.contacts[0].isOnline).toBe(false);
    });

    it('should update lastSeen when provided', () => {
      const stateWithContact = { ...initialState, contacts: [mockContact] };
      const state = contactsReducer(
        stateWithContact,
        updateContactStatus({ contactId: 'contact-1', isOnline: false, lastSeen: '2024-06-01T13:00:00Z' })
      );
      expect(state.contacts[0].lastSeen).toBe('2024-06-01T13:00:00Z');
    });

    it('should not update lastSeen when not provided', () => {
      const contactWithLastSeen = { ...mockContact, lastSeen: '2024-06-01T12:00:00Z' };
      const stateWithContact = { ...initialState, contacts: [contactWithLastSeen] };
      const state = contactsReducer(
        stateWithContact,
        updateContactStatus({ contactId: 'contact-1', isOnline: false })
      );
      expect(state.contacts[0].lastSeen).toBe('2024-06-01T12:00:00Z');
    });

    it('should not modify state for non-existent contact', () => {
      const stateWithContact = { ...initialState, contacts: [mockContact] };
      const state = contactsReducer(
        stateWithContact,
        updateContactStatus({ contactId: 'non-existent', isOnline: false })
      );
      expect(state.contacts[0].isOnline).toBe(true);
    });
  });

  describe('setSearchQuery', () => {
    it('should set the search query', () => {
      const state = contactsReducer(initialState, setSearchQuery('alice'));
      expect(state.searchQuery).toBe('alice');
    });

    it('should clear the search query', () => {
      const stateWithQuery = { ...initialState, searchQuery: 'alice' };
      const state = contactsReducer(stateWithQuery, setSearchQuery(''));
      expect(state.searchQuery).toBe('');
    });
  });

  describe('addPendingRequest', () => {
    it('should add a pending request', () => {
      const state = contactsReducer(initialState, addPendingRequest(mockContact));
      expect(state.pendingRequests).toHaveLength(1);
      expect(state.pendingRequests[0]).toEqual(mockContact);
    });

    it('should not add duplicate pending request', () => {
      let state = contactsReducer(initialState, addPendingRequest(mockContact));
      state = contactsReducer(state, addPendingRequest(mockContact));
      expect(state.pendingRequests).toHaveLength(1);
    });

    it('should add different pending requests', () => {
      let state = contactsReducer(initialState, addPendingRequest(mockContact));
      state = contactsReducer(state, addPendingRequest(mockContact2));
      expect(state.pendingRequests).toHaveLength(2);
    });
  });

  describe('removePendingRequest', () => {
    it('should remove a pending request by id', () => {
      const stateWithRequest = { ...initialState, pendingRequests: [mockContact] };
      const state = contactsReducer(stateWithRequest, removePendingRequest('contact-1'));
      expect(state.pendingRequests).toHaveLength(0);
    });

    it('should not affect other pending requests', () => {
      const stateWithRequests = { ...initialState, pendingRequests: [mockContact, mockContact2] };
      const state = contactsReducer(stateWithRequests, removePendingRequest('contact-1'));
      expect(state.pendingRequests).toHaveLength(1);
      expect(state.pendingRequests[0].id).toBe('contact-2');
    });

    it('should handle removing non-existent request', () => {
      const state = contactsReducer(initialState, removePendingRequest('non-existent'));
      expect(state.pendingRequests).toEqual([]);
    });
  });

  describe('blockContact', () => {
    it('should remove contact from contacts and add to blocked', () => {
      const stateWithContact = { ...initialState, contacts: [mockContact, mockContact2] };
      const state = contactsReducer(stateWithContact, blockContact(mockContact));
      expect(state.contacts).toHaveLength(1);
      expect(state.contacts[0].id).toBe('contact-2');
      expect(state.blockedUsers).toHaveLength(1);
      expect(state.blockedUsers[0].id).toBe('contact-1');
      expect(state.blockedUsers[0].status).toBe('blocked');
    });

    it('should not duplicate in blocked list', () => {
      const stateWithBlocked = {
        ...initialState,
        contacts: [mockContact],
        blockedUsers: [{ ...mockContact, status: 'blocked' as const }],
      };
      const state = contactsReducer(stateWithBlocked, blockContact(mockContact));
      expect(state.blockedUsers).toHaveLength(1);
    });

    it('should set status to blocked', () => {
      const stateWithContact = { ...initialState, contacts: [mockContact] };
      const state = contactsReducer(stateWithContact, blockContact(mockContact));
      expect(state.blockedUsers[0].status).toBe('blocked');
    });
  });

  describe('unblockContact', () => {
    it('should remove contact from blocked list', () => {
      const stateWithBlocked = {
        ...initialState,
        blockedUsers: [{ ...mockContact, status: 'blocked' as const }],
      };
      const state = contactsReducer(stateWithBlocked, unblockContact('contact-1'));
      expect(state.blockedUsers).toHaveLength(0);
    });

    it('should not affect other blocked contacts', () => {
      const stateWithBlocked = {
        ...initialState,
        blockedUsers: [
          { ...mockContact, status: 'blocked' as const },
          { ...mockContact2, status: 'blocked' as const },
        ],
      };
      const state = contactsReducer(stateWithBlocked, unblockContact('contact-1'));
      expect(state.blockedUsers).toHaveLength(1);
      expect(state.blockedUsers[0].id).toBe('contact-2');
    });
  });

  describe('updateNearbyContacts', () => {
    it('should set nearby contacts', () => {
      const nearby = [mockContact];
      const state = contactsReducer(initialState, updateNearbyContacts(nearby));
      expect(state.nearbyContacts).toEqual(nearby);
    });

    it('should replace existing nearby contacts', () => {
      const stateWithNearby = { ...initialState, nearbyContacts: [mockContact] };
      const state = contactsReducer(stateWithNearby, updateNearbyContacts([mockContact2]));
      expect(state.nearbyContacts).toEqual([mockContact2]);
    });
  });

  describe('setLoadingContacts', () => {
    it('should set loading to true', () => {
      const state = contactsReducer(initialState, setLoadingContacts(true));
      expect(state.loadingContacts).toBe(true);
    });

    it('should set loading to false', () => {
      const state = contactsReducer({ ...initialState, loadingContacts: true }, setLoadingContacts(false));
      expect(state.loadingContacts).toBe(false);
    });
  });

  describe('removeContact', () => {
    it('should remove a contact by id', () => {
      const stateWithContacts = { ...initialState, contacts: [mockContact, mockContact2] };
      const state = contactsReducer(stateWithContacts, removeContact('contact-1'));
      expect(state.contacts).toHaveLength(1);
      expect(state.contacts[0].id).toBe('contact-2');
    });

    it('should handle removing non-existent contact', () => {
      const stateWithContact = { ...initialState, contacts: [mockContact] };
      const state = contactsReducer(stateWithContact, removeContact('non-existent'));
      expect(state.contacts).toHaveLength(1);
    });
  });
});
