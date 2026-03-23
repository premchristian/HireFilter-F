const initialConversations = [];

// Use globalThis to persist the store in development (handling hot reloads)
if (!globalThis.mockStore) {
    globalThis.mockStore = {
        conversations: initialConversations,
        typing: {} // { [conversationId]: { [userId]: timestamp } }
    };
}

// Support hot reload if typing property was added later
if (!globalThis.mockStore.typing) {
    globalThis.mockStore.typing = {};
}

// Forcibly clear on first load if needed, but the above persistent check is safer
// globalThis.mockStore.conversations = []; 

const mockStore = globalThis.mockStore;
export default mockStore;
