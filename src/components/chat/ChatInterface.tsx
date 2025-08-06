import { useState, useEffect, useRef, MouseEvent } from 'react';
import {
  connectSocket,
  disconnectSocket,
  joinChatRoom,
  leaveChatRoom,
  sendMessage,
  onMessageReceived,
  onError,
  offMessageReceived,
  offError,
  sendTypingStatus,
  onTypingStatus,
  offTypingStatus,
  startVoiceCall,
  onVoiceCall,
  startVideoCall,
  onVideoCall,
  acceptCall,
  onCallAccepted,
  rejectCall,
  onCallRejected,
  sendIceCandidate,
  onIceCandidate,
  endCall,
  onCallEnded,
} from '../../services/chatAPI';
import { useAuthStore } from '../../stores/authStore';
import {
  ChatContainer,
  MainContainer,
  Sidebar,
  ConversationList,
  Conversation,
  Avatar,
  ConversationHeader,
  VoiceCallButton,
  VideoCallButton,
  MessageList,
  Message,
  TypingIndicator,
  StatusList,
  MessageInput,
  Status
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { PhoneXMarkIcon, MicrophoneIcon, VideoCameraIcon } from '@heroicons/react/24/solid';

type UserStatus = 'online' | 'away' | 'dnd' | 'offline';
type MessageDirection = 'incoming' | 'outgoing';
type ChatScopeStatus = 'available' | 'unavailable' | 'away' | 'dnd' | 'invisible' | 'eager';

const mapToChatScopeStatus = (status: UserStatus): ChatScopeStatus => {
  switch (status) {
    case 'online': return 'available';
    case 'away': return 'away';
    case 'dnd': return 'dnd';
    case 'offline': return 'invisible';
    default: return 'invisible';
  }
};

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface ChatInterfaceProps {
  roomId: string;
  chatPartnerName: string;
  chatPartnerAvatar?: string;
}

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar?d=mp&s=100';

export default function ChatInterface({ roomId, chatPartnerName, chatPartnerAvatar = DEFAULT_AVATAR }: ChatInterfaceProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [userStatus, setUserStatus] = useState<UserStatus>('online');
  const [chatPartnerStatus, setChatPartnerStatus] = useState<UserStatus>('online');
  const [inputValue, setInputValue] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'receiving' | 'active'>('idle');
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    setTypingUsers(prev => prev.filter(userId => userId !== message.senderId));
  };
  
  const handleError = (err: string) => {
    setError(err);
    setTimeout(() => setError(''), 5000);
  };
  
  const handleTypingStatus = (data: { userId: string, isTyping: boolean }) => {
    if (data.isTyping) {
      setTypingUsers(prev => prev.includes(data.userId) ? prev : [...prev, data.userId]);
    } else {
      setTypingUsers(prev => prev.filter(userId => userId !== data.userId));
    }
  };

  const handleCallRejectedReceived = () => {
    console.log("Call rejected by other user.");
    endCall(roomId);
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    if (peerConnection.current) peerConnection.current.close();
    peerConnection.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setCallState('idle');
    setError(t('chat.call.rejected'));
  };

  const handleCallEnded = () => {
    console.log("Call ended by other user.");
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    if (peerConnection.current) peerConnection.current.close();
    peerConnection.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setCallState('idle');
  };

  useEffect(() => {
    if (!user) return;
    
    joinChatRoom(roomId);
    
    onMessageReceived(handleNewMessage);
    onError(handleError);
    onTypingStatus(handleTypingStatus);

    onVoiceCall(handleCallReceived);
    onVideoCall(handleCallReceived);
    onCallAccepted(handleCallAccepted);
    onCallRejected(handleCallRejectedReceived); // FIX: Use the new function
    onIceCandidate(handleIceCandidateReceived);
    onCallEnded(handleCallEnded);
    
    const statusInterval = setInterval(() => {
      const statuses: UserStatus[] = ['online', 'away', 'dnd', 'offline'];
      setChatPartnerStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 30000);
    
    return () => {
      leaveChatRoom(roomId);
      offMessageReceived();
      offError();
      offTypingStatus();
      clearInterval(statusInterval);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [roomId, user, localStream, remoteStream, peerConnection]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (text.trim() && user) {
      const tempMessage = {
        id: Date.now().toString(),
        content: text,
        senderId: user.id,
        createdAt: new Date().toISOString(),
        sender: {
          id: user.id,
          name: user.name,
          avatar: user.avatar || DEFAULT_AVATAR,
        },
      };
      setMessages(prev => [...prev, tempMessage]);
      sendMessage(roomId, text);
      setInputValue('');
      sendTypingStatus(roomId, false);
    }
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    const isCurrentlyTyping = text.trim().length > 0;
    if (isCurrentlyTyping !== isTyping) {
      setIsTyping(isCurrentlyTyping);
      sendTypingStatus(roomId, isCurrentlyTyping);
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(roomId, false);
    }, 3000);
  };

 const startCall = async (type: 'video' | 'voice') => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
    
    // FIX: Add an explicit check for the stream object
    if (stream) {
        setLocalStream(stream);
        setCallState('calling');
        
        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            sendIceCandidate(roomId, event.candidate);
          }
        };
        
        peerConnection.current.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
        };
        
        stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));
        
        const offer = await peerConnection.current.createOffer();
        if (peerConnection.current) {
          await peerConnection.current.setLocalDescription(offer);
          if (type === 'video') {
            startVideoCall(roomId, offer);
          } else {
            startVoiceCall(roomId, offer);
          }
        }
    }
  } catch (err) {
    console.error("Failed to start call:", err);
    setCallState('idle');
    setError('Failed to start call. Please check your camera and microphone permissions.');
  }
};
  
  const handleCallReceived = async (data: { offer: RTCSessionDescriptionInit }) => {
    if (callState === 'idle') {
      setCallState('receiving');
      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          sendIceCandidate(roomId, event.candidate);
        }
      };
      peerConnection.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
    }
  };
  
  const acceptIncomingCall = async () => {
  try {
   const hasVideo = callState === 'receiving' && !!remoteStream?.getVideoTracks().length;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: hasVideo
    });

    // FIX: Add an explicit check for the stream object
    if (stream) {
      setLocalStream(stream);
      stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));
      const answer = await peerConnection.current?.createAnswer();
      if (answer && peerConnection.current) {
        await peerConnection.current.setLocalDescription(answer);
        acceptCall(roomId, answer);
        setCallState('active');
      } else {
        throw new Error("Failed to create answer or peer connection not available.");
      }
    }
  } catch (err) {
    console.error("Failed to accept call:", err);
    setCallState('idle');
    setError('Failed to accept call. Please check your camera and microphone permissions.');
  }
};

  
  const rejectIncomingCall = () => {
    rejectCall(roomId);
    setCallState('idle');
  };
  
  const handleCallAccepted = (data: { answer: RTCSessionDescriptionInit }) => {
    peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
    setCallState('active');
  };
  
  const handleIceCandidateReceived = (data: { candidate: RTCIceCandidate }) => {
    peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
  };
  

  const formatMessages = () => {
    return messages.map(message => ({
      id: message.id,
      message: message.content,
      sender: message.senderId,
      direction: (message.senderId === user?.id ? 'outgoing' : 'incoming') as MessageDirection,
      position: 'single' as const,
      timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: message.sender.avatar || DEFAULT_AVATAR,
      name: message.sender.name,
      status: mapToChatScopeStatus(message.senderId === user?.id ? userStatus : chatPartnerStatus)
    }));
  };

  const typingIndicatorContent = typingUsers.length > 0
    ? `${typingUsers.map(id => id === user?.id ? 'You' : chatPartnerName).join(', ')} is typing...`
    : null;
    
  return (
    <div className="h-full w-full flex">
      <MainContainer className="h-full w-full">
        <Sidebar
          position="left"
          className={`${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 fixed lg:static z-20 h-full`}
        >
          <div className="flex items-center justify-between p-4 border-b lg:hidden">
            <h2 className="text-xl font-bold">{t('chat.conversations')}</h2>
            <button onClick={() => setIsMobileSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
          <StatusList>
            <Status size='xs' onClick={(e: MouseEvent) => setUserStatus('online')} status={mapToChatScopeStatus(userStatus)}>
              <Avatar src={user?.avatar || DEFAULT_AVATAR} />
              <div className="chat-status-content">
                <div className="chat-status-name">You</div>
                <div className="chat-status-text">{userStatus}</div>
              </div>
            </Status>
            <Status size='xs' status={mapToChatScopeStatus(chatPartnerStatus)}>
              <Avatar src={chatPartnerAvatar} />
              <div className="chat-status-content">
                <div className="chat-status-name">{chatPartnerName}</div>
                <div className="chat-status-text">{chatPartnerStatus}</div>
              </div>
            </Status>
          </StatusList>
          <ConversationList>
            <Conversation
              name={chatPartnerName}
              lastSenderName={chatPartnerName}
              info={chatPartnerStatus === 'online' ? "Active now" : chatPartnerStatus}
              active={true}
            >
              <Avatar src={chatPartnerAvatar} />
            </Conversation>
          </ConversationList>
        </Sidebar>

        <ChatContainer className="flex flex-col">
          <ConversationHeader>
            <ConversationHeader.Back className="lg:hidden" onClick={() => setIsMobileSidebarOpen(true)} />
            <Avatar src={chatPartnerAvatar} name={chatPartnerName} />
            <ConversationHeader.Content
              userName={chatPartnerName}
              info={chatPartnerStatus === 'online' ? "Active now" : chatPartnerStatus}
            />
            <ConversationHeader.Actions>
              <VoiceCallButton onClick={() => startCall('voice')} disabled={callState !== 'idle'} />
              <VideoCallButton onClick={() => startCall('video')} disabled={callState !== 'idle'} />
            </ConversationHeader.Actions>
          </ConversationHeader>

          {callState !== 'idle' && (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 text-white p-4 relative">
              {localStream && (
                <video
                  ref={video => { if (video && localStream) video.srcObject = localStream; }}
                  className="w-32 h-24 rounded-lg object-cover absolute bottom-4 right-4 z-10 border-2 border-white"
                  autoPlay
                  muted
                />
              )}
              {remoteStream && (
                <video
                  ref={video => { if (video && remoteStream) video.srcObject = remoteStream; }}
                  className="w-full h-full object-cover"
                  autoPlay
                />
              )}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-xl font-bold">
                  {callState === 'calling' && `Calling ${chatPartnerName}...`}
                  {callState === 'receiving' && `Incoming call from ${chatPartnerName}...`}
                  {callState === 'active' && 'Call Active'}
                </p>
                {callState === 'receiving' && (
                  <div className="mt-4 flex gap-4">
                    <button onClick={acceptIncomingCall} className="bg-green-500 p-4 rounded-full">
                      <MicrophoneIcon className="h-6 w-6 text-white" />
                    </button>
                    <button onClick={rejectIncomingCall} className="bg-red-500 p-4 rounded-full">
                      <PhoneXMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                )}
                {callState === 'active' && (
                  <div className="mt-4 flex gap-4">
                    <button onClick={handleCallEnded} className="bg-red-500 p-4 rounded-full">
                      <PhoneXMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {callState === 'idle' && (
            <MessageList
              typingIndicator={typingIndicatorContent && <TypingIndicator content={typingIndicatorContent} />}
              ref={messageListRef}
              className="flex-grow cs-message-list"
            >
              {formatMessages().map(msg => (
                <Message
                  key={msg.id}
                  model={{ message: msg.message, sentTime: msg.timestamp, sender: msg.name, direction: msg.direction, position: msg.position }}
                  avatarSpacer={msg.direction === 'incoming'}
                >
                  {msg.direction === 'incoming' && <Avatar src={msg.avatar} name={msg.name} status={msg.status} />}
                </Message>
              ))}
            </MessageList>
          )}

          <MessageInput
            placeholder={t('chat.inputPlaceholder')}
            value={inputValue}
            onChange={handleInputChange}
            onSend={handleSendMessage}
            disabled={callState !== 'idle'}
            attachButton={false}
            className="border-t border-gray-200"
          />
        </ChatContainer>
      </MainContainer>
      
      {error && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <style>{`
        .chat-status-item { display: flex; align-items: center; padding: 8px; cursor: pointer; position: relative; }
        .chat-status-item:hover { background-color: #f5f5f5; }
        .chat-status-content { margin-left: 12px; }
        .chat-status-name { font-weight: 500; }
        .chat-status-text { font-size: 0.8rem; color: #666; text-transform: capitalize; }
        .cs-message-list { flex-grow: 1; overflow-y: auto; }
        .cs-sidebar { width: 300px; max-width: 300px; }
        .cs-sidebar.closed { width: 0; max-width: 0; }
        @media (min-width: 1024px) {
          .cs-sidebar { width: 300px !important; max-width: 300px !important; }
        }
      `}</style>
    </div>
  );
}