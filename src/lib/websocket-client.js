"use client";

// WebSocket client simulation for development
// In production, this would connect to your actual WebSocket server

class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = WebSocket.CONNECTING;
        this.onopen = null;
        this.onmessage = null;
        this.onclose = null;
        this.onerror = null;

        // Simulate connection
        setTimeout(() => {
            this.readyState = WebSocket.OPEN;
            if (this.onopen) {
                this.onopen();
            }

            // Simulate some real-time events
            this.simulateEvents();
        }, 1000);
    }

    send(data) {
        if (this.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket is not open');
            return;
        }

        try {
            const message = JSON.parse(data);
            console.log('Sending WebSocket message:', message);

            // Simulate server responses
            this.handleMessage(message);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    close() {
        this.readyState = WebSocket.CLOSED;
        if (this.onclose) {
            this.onclose();
        }
    }

    handleMessage(message) {
        // Simulate server processing and responses
        switch (message.type) {
            case 'auth':
                // Simulate successful authentication
                setTimeout(() => {
                    this.simulateMessage({
                        type: 'auth_success',
                        payload: { userId: message.payload.userId }
                    });

                    // Simulate online users
                    this.simulateMessage({
                        type: 'user_online',
                        payload: {
                            onlineUsers: ['hr_1', 'candidate_1', 'hr_2', 'system']
                        }
                    });
                }, 500);
                break;

            case 'send_message':
                // Simulate message delivery
                setTimeout(() => {
                    this.simulateMessage({
                        type: 'new_message',
                        payload: {
                            conversationId: message.payload.conversationId,
                            message: {
                                ...message.payload.message,
                                status: 'delivered'
                            }
                        }
                    });
                }, 200);
                break;

            case 'typing_start':
                // Echo typing to other participants (in real app, server would handle this)
                setTimeout(() => {
                    this.simulateMessage({
                        type: 'typing_start',
                        payload: message.payload
                    });
                }, 100);
                break;

            case 'typing_stop':
                setTimeout(() => {
                    this.simulateMessage({
                        type: 'typing_stop',
                        payload: message.payload
                    });
                }, 100);
                break;

            case 'mark_read':
                // Simulate read receipt
                setTimeout(() => {
                    this.simulateMessage({
                        type: 'message_read',
                        payload: {
                            messageId: message.payload.messageId,
                            readBy: [message.payload.userId]
                        }
                    });
                }, 100);
                break;
        }
    }

    simulateMessage(message) {
        if (this.onmessage && this.readyState === WebSocket.OPEN) {
            this.onmessage({
                data: JSON.stringify(message)
            });
        }
    }

    simulateEvents() {
        // Simulate periodic online status updates
        setInterval(() => {
            if (this.readyState === WebSocket.OPEN) {
                this.simulateMessage({
                    type: 'user_online',
                    payload: {
                        onlineUsers: ['hr_1', 'candidate_1', 'hr_2', 'system']
                    }
                });
            }
        }, 30000); // Every 30 seconds

        // Simulate occasional new messages from other users
        setTimeout(() => {
            if (this.readyState === WebSocket.OPEN) {
                this.simulateMessage({
                    type: 'new_message',
                    payload: {
                        conversationId: 'conv_1',
                        message: {
                            id: `msg_${Date.now()}`,
                            conversationId: 'conv_1',
                            senderId: 'hr_1',
                            senderName: 'Sarah Miller',
                            senderType: 'hr',
                            content: 'Just wanted to follow up on our conversation. Looking forward to hearing from you!',
                            type: 'text',
                            timestamp: new Date().toISOString(),
                            status: 'sent',
                            attachments: []
                        }
                    }
                });
            }
        }, 10000); // After 10 seconds
    }
}

// Export the mock WebSocket for development
export default function createWebSocket(url) {
    // In development, use mock WebSocket
    if (process.env.NODE_ENV === 'development') {
        return new MockWebSocket(url);
    }

    // In production, use real WebSocket
    return new WebSocket(url);
}