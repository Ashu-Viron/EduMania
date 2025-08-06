import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { Inject } from '@nestjs/common';

@WebSocketGateway(3002, {
  pingTimeout: 60000,
  pingInterval: 25000,
  namespace: '/api/chat',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket']
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private rooms: Map<string, Set<string>> = new Map();
  private userSockets: Map<string, Socket> = new Map();

  constructor(
    @Inject(JwtService) private jwtService: JwtService,
    private authService: AuthService
  ) {}

  async handleConnection(socket: Socket) {
    console.log('New connection attempt:', socket.id);

    try {
      const token = socket.handshake.auth?.token?.split(' ')[1] ||
        socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        socket.emit('error', 'Missing token');
        socket.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.id || payload.userId;

      if (!userId) {
        socket.disconnect();
        return;
      }

      const user = await this.authService.getProfile(userId);
      if (!user) {
        socket.emit('error', 'Authentication failed');
        socket.disconnect();
        return;
      }

      socket.data.userId = userId;
      this.userSockets.set(userId, socket);

      console.log(`User connected: ${user.name}`);
    } catch (error) {
      console.error('Connection error:', error);
      socket.emit('error', 'Authentication failed');
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    console.log(`User disconnected: ${socket.id}`);
    for (const [userId, userSocket] of this.userSockets.entries()) {
      if (userSocket.id === socket.id) {
        this.userSockets.delete(userId);
        
        const currentRoom = this.findUserRoom(userId);
        if (currentRoom) {
            socket.to(currentRoom).emit('userLeft', { userId });
            this.rooms.get(currentRoom)?.delete(userId);
        }

        break;
      }
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(socket: Socket, roomId: string) {
    const userId = this.getUserIdFromSocket(socket);
    if (!userId) return;

    try {
      const currentRoom = this.findUserRoom(userId);
      if (currentRoom && currentRoom !== roomId) {
        socket.leave(currentRoom);
        this.rooms.get(currentRoom)?.delete(userId);
      }

      socket.join(roomId);
      this.rooms.set(roomId, this.rooms.get(roomId) || new Set());
      this.rooms.get(roomId).add(userId);
      console.log(`User ${userId} joined room ${roomId}`);
      // Notify other users in the room
      socket.to(roomId).emit('userJoined', { userId });
    } catch (error) {
      socket.emit('error', 'Failed to join room');
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(socket: Socket, roomId: string) {
    const userId = this.getUserIdFromSocket(socket);
    if (!userId) return;

    try {
      socket.leave(roomId);
      this.rooms.get(roomId)?.delete(userId);
      console.log(`User ${userId} left room ${roomId}`);
      socket.to(roomId).emit('userLeft', { userId });
    } catch (error) {
      socket.emit('error', 'Failed to leave room');
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(socket: Socket, payload: { roomId: string; content: string }) {
    const userId = this.getUserIdFromSocket(socket);
    if (!userId) return;

    try {
      const user = await this.authService.getProfile(userId);
      if (!user) return;
      if (!payload.content || payload.content.trim() === '') {
        socket.emit('error', 'Message cannot be empty');
        return;
      }
      const message = {
        id: Date.now().toString(),
        content: payload.content,
        senderId: userId,
        createdAt: new Date().toISOString(),
        sender: {
          id: user.id,
          name: user.name,
          avatar: user.avatar || 'https://tinyurl.com/Avatar010x'
        },
        roomId: payload.roomId,
      };
      this.server.to(payload.roomId).emit('newMessage', message);
      console.log(`Message sent to room ${payload.roomId}`);
    } catch (error) {
      console.error('Message send error:', error);
      socket.emit('error', 'Failed to send message');
    }
  }

  @SubscribeMessage('typing')
  handleTyping(socket: Socket, payload: { roomId: string; isTyping: boolean }) {
    const userId = this.getUserIdFromSocket(socket);
    if (!userId) return;
    socket.to(payload.roomId).emit('typing', { userId, isTyping: payload.isTyping });
  }
  
  @SubscribeMessage('startVoiceCall')
  handleStartVoiceCall(socket: Socket, payload: { roomId: string, offer: RTCSessionDescriptionInit }) {
    const userId = this.getUserIdFromSocket(socket);
    if (!userId) return;
    socket.to(payload.roomId).emit('voiceCallStarted', { offer: payload.offer });
  }

  @SubscribeMessage('startVideoCall')
  handleStartVideoCall(socket: Socket, payload: { roomId: string, offer: RTCSessionDescriptionInit }) {
    const userId = this.getUserIdFromSocket(socket);
    if (!userId) return;
    socket.to(payload.roomId).emit('videoCallStarted', { offer: payload.offer });
  }

  @SubscribeMessage('acceptCall')
  handleAcceptCall(socket: Socket, payload: { roomId: string, answer: RTCSessionDescriptionInit }) {
    const userId = this.getUserIdFromSocket(socket);
    if (!userId) return;
    socket.to(payload.roomId).emit('callAccepted', { answer: payload.answer });
  }

  @SubscribeMessage('rejectCall')
  handleRejectCall(socket: Socket, payload: { roomId: string }) {
    const userId = this.getUserIdFromSocket(socket);
    if (!userId) return;
    socket.to(payload.roomId).emit('callRejected');
  }

  @SubscribeMessage('iceCandidate')
  handleIceCandidate(socket: Socket, payload: { roomId: string, candidate: RTCIceCandidate }) {
    const userId = this.getUserIdFromSocket(socket);
    if (!userId) return;
    socket.to(payload.roomId).emit('iceCandidate', { candidate: payload.candidate });
  }

  @SubscribeMessage('endCall')
  handleEndCall(socket: Socket, payload: { roomId: string }) {
    const userId = this.getUserIdFromSocket(socket);
    if (!userId) return;
    socket.to(payload.roomId).emit('callEnded');
  }

  private getUserIdFromSocket(socket: Socket): string | null {
    return socket.data.userId || null;
  }

  private findUserRoom(userId: string): string | null {
    for (const [roomId, users] of this.rooms.entries()) {
      if (users.has(userId)) {
        return roomId;
      }
    }
    return null;
  }
}