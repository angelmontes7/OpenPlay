import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import socket from "@/lib/socket";
import { useUser } from '@clerk/clerk-expo';
import { fetchAPI } from '@/lib/fetch';
import { BlurView } from 'expo-blur';

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  facilityId: string;
  facilityName: string;
}

interface ChatMessage {
  id: string;
  text: string;
  username: string;
  isSent: boolean;
  timestamp: Date;
}

const ChatModal: React.FC<ChatModalProps> = ({ visible, onClose, facilityId, facilityName }) => {
  const { user } = useUser();
  const clerkId = user?.id;
  const userName = user?.username || user?.fullName || "Anonymous";
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(100);
    }
  }, [visible]);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAPI(`/api/database/messages?facility_id=${facilityId}`, {
          method: "GET",
        });
        
        if (data?.messages && data.messages.length > 0){
          const formattedMessages: ChatMessage[] = data?.messages.map((msg: any) => ({
            id: msg.id.toString(),
            text: msg.text,
            username: msg.username,
            isSent: msg.sender_id === clerkId,
            timestamp: new Date(msg.timestamp),
          }));
    
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (visible && facilityId) {
      fetchMessages();
    }
  }, [visible, facilityId]);
  
  useEffect(() => {
    if (!visible || !facilityId) return;

    socket.emit("join-room", facilityId);

    const handleReceiveMessage = (msg: { text: string; senderId: string; username: string }) => {
        if (msg.senderId !== clerkId) {
            const newMessage: ChatMessage = {
                id: Date.now().toString(),
                text: msg.text,
                username: msg.username,
                isSent: msg.senderId === clerkId,
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, newMessage]);
        }
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.emit("leave-room", facilityId);
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [visible, facilityId, clerkId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      username: userName || "Anonymous",
      isSent: true,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, newMessage]);

    socket.emit('send-message', {
      text: message,
      senderId: clerkId,
      username: userName,
      roomId: facilityId
    });

    setMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item, index }: { item: ChatMessage, index: number }) => {
    const isFirstMessageFromUser = index === 0 || 
      messages[index - 1].username !== item.username;

    const bubbleClasses = item.isSent
      ? "bg-indigo-600 self-end rounded-2xl rounded-tr-none py-2 px-4 mt-1 mb-1 max-w-xs ml-10"
      : "bg-gray-800 self-start rounded-2xl rounded-tl-none py-2 px-4 mt-1 mb-1 max-w-xs mr-10";

    const textClasses = item.isSent
      ? "text-white text-base"
      : "text-gray-100 text-base";

    const timestampClasses = item.isSent
      ? "text-xs text-indigo-200 mt-1 text-right"
      : "text-xs text-gray-400 mt-1 text-right";

    return (
      <Animated.View 
        className="mb-2"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        {!item.isSent && isFirstMessageFromUser && (
          <View className="flex-row items-center mb-1">
            <View className="w-8 h-8 rounded-full bg-purple-500 mr-2 items-center justify-center">
              <Text className="text-white font-bold">{item.username.charAt(0).toUpperCase()}</Text>
            </View>
            <Text className="text-xs font-bold text-gray-300">{item.username}</Text>
          </View>
        )}
        <View className={`${bubbleClasses} shadow-sm`}>
          <Text className={textClasses}>{item.text}</Text>
          <Text className={timestampClasses}>{formatTime(item.timestamp)}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} transparent>
      <BlurView intensity={30} tint="dark" className="flex-1">
        <Animated.View 
          className="flex-1 mt-10 rounded-t-3xl overflow-hidden"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            className="flex-1"
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="flex-1"
              keyboardVerticalOffset={40}
            >
              {/* Header */}
              <View className="h-16 justify-center items-center border-b border-gray-700 flex-row px-4">
                <View className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
                <Text className="text-xl font-bold flex-1 text-center text-white">{facilityName}</Text>
                <TouchableOpacity 
                  onPress={onClose}
                  className="bg-gray-800 rounded-full w-8 h-8 items-center justify-center"
                >
                  <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Messages */}
              {isLoading ? (
                <View className="flex-1 justify-center items-center">
                  <View className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                  <Text className="text-gray-300 mt-4">Loading messages...</Text>
                </View>
              ) : (
                <>
                  {messages.length === 0 ? (
                    <View className="flex-1 justify-center items-center p-6">
                      <Ionicons name="chatbubble-ellipses-outline" size={60} color="#4F46E5" />
                      <Text className="text-center text-gray-400 mt-4 text-lg">No messages yet. Start the conversation!</Text>
                    </View>
                  ) : (
                    <FlatList
                      ref={flatListRef}
                      data={messages}
                      keyExtractor={(item) => item.id}
                      renderItem={renderMessage}
                      contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
                      showsVerticalScrollIndicator={false}
                    />
                  )}
                </>
              )}

              {/* Input */}
              <View className="px-4 mb-5 py-3 border-t border-gray-800 items-center flex-row">
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Type a message..."
                  placeholderTextColor="#9ca3af"
                  className="flex-1 bg-gray-800 rounded-full px-5 py-3 min-h-10 max-h-24 text-base text-white"
                  multiline
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                />
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={!message.trim()}
                  className={`ml-2 p-3 rounded-full ${message.trim() ? 'bg-indigo-600' : 'bg-gray-700'}`}
                >
                  <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </LinearGradient>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default ChatModal;
