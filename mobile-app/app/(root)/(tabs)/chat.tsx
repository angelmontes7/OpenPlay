import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import socket from "@/lib/socket";
import { useAuth } from '@clerk/clerk-expo';

// Message structure to distinguish between sent and received messages
interface ChatMessage {
  id: string;
  text: string;
  isSent: boolean; // true if sent by user, false if received
  timestamp: Date;
}

const Chat = () => {
  const { userId: clerkId } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Handle incoming messages
    socket.on('receive-message', (msg: { text: string; senderId: string }) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: msg.text,
        isSent: msg.senderId === clerkId, // Check if the message was sent by this user
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off('receive-message');
    };
  }, [clerkId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      // Create a new message object
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: message,
        isSent: true,
        timestamp: new Date()
      };
      
      // Add message to local state first (optimistic UI update)
      setMessages((prev) => [...prev, newMessage]);
      
      // Send message through socket
      socket.emit('send-message', {
        text: message,
        senderId: clerkId
      });
      
      // Clear input field
      setMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    // Tailwind classes for message bubbles
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
      <View className={bubbleClasses}>
        <Text className={textClasses}>{item.text}</Text>
        <Text className={timestampClasses}>{formatTime(item.timestamp)}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        <View className="h-12 bg-gray-100 justify-center items-center border-b border-gray-300">
          <Text className="text-lg font-bold text-gray-800">Chat</Text>
        </View>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
        
        <View className="flex-row px-3 py-2 mb-20 bg-gray-100 border-t border-gray-300 items-center">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Message"
            placeholderTextColor="#8e8e93"
            className="flex-1 bg-white rounded-full px-4 py-2 min-h-10 max-h-24 text-base"
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
  );
};

export default Chat;