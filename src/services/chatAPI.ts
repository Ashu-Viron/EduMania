import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { getSocketUrl } from './api';

let socket: Socket | null = null;

export const connectSocket = () => {
  const { accessToken } = useAuthStore.getState();
  const socketUrl = `${getSocketUrl()}`;

  console.log('Connecting to WebSocket...');

  if (socket && socket.connected) {
    console.log('Socket already connected. Skipping new connection.');
    return socket;
  }

  if (accessToken) {
    try {
      socket = io(socketUrl, {
        path: '/api/chat', // Use a specific path
        auth: {
          token: `Bearer ${accessToken}`
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        withCredentials: true,
        secure: process.env.NODE_ENV === 'production',
        // pingTimeout: 60000, // Rely on built-in pings
        // pingInterval: 25000,
      });

      socket.on('connect', () => {
        console.log('Socket connected successfully! ID:', socket?.id);
      });

      socket.on('disconnect', (reason) => {
        console.warn('Socket disconnected:', reason);
      });

      socket.on('connect_error', (err) => {
        console.error('Connection error:', err.message,  (err as any)?.cause);
      });
      
      socket.on('error', (error) => {
        console.error('Server-side error:', error);
      });

    } catch (error) {
      console.error('Socket initialization error:', error);
    }
  } else {
    console.warn('No access token found. Cannot connect to WebSocket.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected.');
  }
};

export const joinChatRoom = (roomId: string) => {
  socket?.emit('joinRoom', roomId);
};

export const leaveChatRoom = (roomId: string) => {
  socket?.emit('leaveRoom', roomId);
};

export const sendMessage = (roomId: string, content: string) => {
  socket?.emit('sendMessage', { roomId, content });
};

// NEW: Typing indicator functions
export const sendTypingStatus = (roomId: string, isTyping: boolean) => {
  socket?.emit('typing', { roomId, isTyping });
};

export const onTypingStatus = (callback: (data: { userId: string, isTyping: boolean }) => void) => {
  socket?.on('typing', callback);
};

export const offTypingStatus = () => {
  socket?.off('typing');
};

// NEW: Call signaling functions
export const startVoiceCall = (roomId: string, offer: RTCSessionDescriptionInit) => {
  socket?.emit('startVoiceCall', { roomId, offer });
};

export const onVoiceCall = (callback: (data: { offer: RTCSessionDescriptionInit }) => void) => {
  socket?.on('voiceCallStarted', callback);
};

export const startVideoCall = (roomId: string, offer: RTCSessionDescriptionInit) => {
  socket?.emit('startVideoCall', { roomId, offer });
};

export const onVideoCall = (callback: (data: { offer: RTCSessionDescriptionInit }) => void) => {
  socket?.on('videoCallStarted', callback);
};

export const acceptCall = (roomId: string, answer: RTCSessionDescriptionInit) => {
  socket?.emit('acceptCall', { roomId, answer });
};

export const onCallAccepted = (callback: (data: { answer: RTCSessionDescriptionInit }) => void) => {
  socket?.on('callAccepted', callback);
};

export const rejectCall = (roomId: string) => {
  socket?.emit('rejectCall', { roomId });
};

export const onCallRejected = (callback: () => void) => {
  socket?.on('callRejected', callback);
};

export const sendIceCandidate = (roomId: string, candidate: RTCIceCandidate) => {
  socket?.emit('iceCandidate', { roomId, candidate });
};

export const onIceCandidate = (callback: (data: { candidate: RTCIceCandidate }) => void) => {
  socket?.on('iceCandidate', callback);
};

export const endCall = (roomId: string) => {
  socket?.emit('endCall', { roomId });
};

export const onCallEnded = (callback: () => void) => {
  socket?.on('callEnded', callback);
};


export const onMessageReceived = (callback: (message: any) => void) => {
  socket?.on('newMessage', callback);
};

export const onError = (callback: (error: string) => void) => {
  socket?.on('error', callback);
};

export const offMessageReceived = () => {
  socket?.off('newMessage');
};

export const offError = () => {
  socket?.off('error');
};