import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import socket from "@/lib/socket";
import { useUser } from '@clerk/clerk-expo';
import { fetchAPI } from '@/lib/fetch';

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

  useEffect(() => {
    const fetchMessages = async () => {
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

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const bubbleClasses = item.isSent
      ? "bg-blue-500 self-end rounded-2xl py-3 px-4 mt-1 mb-1 max-w-xs ml-10"
      : "bg-gray-200 self-start rounded-2xl py-3 px-4 mt-1 mb-1 max-w-xs mr-10";

    const textClasses = item.isSent
      ? "text-white text-base"
      : "text-gray-800 text-base";

    const timestampClasses = item.isSent
      ? "text-xs text-blue-100 mt-1 text-right"
      : "text-xs text-gray-500 mt-1 text-right";

    return (
      <View className="mb-2">
        {!item.isSent && (
          <Text className="text-xs font-bold text-gray-700">{item.username}</Text>
        )}
        <View className={bubbleClasses}>
          <Text className={textClasses}>{item.text}</Text>
          <Text className={timestampClasses}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 mt-12 bg-gray-100">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={90}
        >
          {/* Header */}
          <View className="h-12 bg-white justify-center items-center border-b border-gray-300 flex-row px-4">
            <Text className="text-lg font-bold flex-1 text-center">{facilityName} Chat</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-500 text-base">Close</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
          {messages.length === 0 && (
            <Text className="text-center text-gray-400 mt-4">No messages yet. Say something!</Text>
          )}

          {/* Input */}
          <View className="flex-row px-3 py-2 mb-5 bg-white border-t border-gray-300 items-center">
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Message"
              placeholderTextColor="#8e8e93"
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 min-h-10 max-h-24 text-base"
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!message.trim()}
              className="ml-2 p-1"
            >
              <Text className={`text-blue-500 font-semibold text-base ${!message.trim() ? 'opacity-50' : ''}`}>
                Send
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default ChatModal;
