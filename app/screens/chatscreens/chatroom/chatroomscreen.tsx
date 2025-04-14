// import React, {useState} from 'react';
// import { View, Text, Button, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import {ChatStackParamList} from '@/app/(root)/(tabs)/chat';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// // type ChatStackParamList = {
// //   ChatList: undefined;
// //   ChatRoom:  { roomId: string; roomName: string };
// //   NewChat: undefined;
// // };

// type Props = NativeStackScreenProps<ChatStackParamList, 'ChatRoom'>;

// type Message = {
//   id: string;
//   text: string;
//   sender: string;
//   isUser: Boolean; // true if current user sent message
// };

// export default function ChatRoomScreen({ route }: Props) {
//   const { roomName } = route.params;
//   const [ messages, setMessages] = useState<Message[]>([
//     { id: '1', text: 'Hey, how\'s it going?', sender: 'Jacques', isUser: false },
//     { id: '2', text: 'I\'m good! How about you?', sender: 'You', isUser: true },
//   ]);
// const[inputText, setInputText] = useState('');

// const sendMessage = () => {
//   if (inputText.trim() === '') return;

//   const newMessage: Message = {
//     id: Math.random().toString(),
//     text: inputText,
//     sender: 'You',
//     isUser: true,
//   };

//   setMessages((prevMessages) => [...prevMessages, newMessage]);
//   setInputText('');
// };

// return (
//   <KeyboardAwareScrollView className="flex-1 bg-gray-100">
//     {/* Room Name Header */}
//     <View className="p-4 bg-white shadow-md">
//       <Text className="text-xl font-bold">{roomName}</Text>
//     </View>

//     {/* Messages List */}
//     <FlatList
//       data={messages}
//       keyExtractor={(item) => item.id}
//       renderItem={({ item }) => (
//         <View className={`m-2 p-3 rounded-lg ${item.isUser ? 'bg-blue-500 self-end' : 'bg-gray-300 self-start'}`}>
//           {!item.isUser && <Text className="text-xs text-gray-600">{item.sender}</Text>}
//           <Text className={`text-white ${item.isUser ? 'text-right' : 'text-left'}`}>{item.text}</Text>
//         </View>
//       )}
//       contentContainerStyle={{ padding: 10 }}
//     />

//     {/* Typing Box */}
//     <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
//       <View className="flex-row items-center p-3 bg-white border-t">
//         <TextInput
//           value={inputText}
//           onChangeText={setInputText}
//           placeholder="Type a message..."
//           className="flex-1 border border-gray-300 p-2 rounded-lg"
//         />
//         <TouchableOpacity onPress={sendMessage} className="ml-2 bg-blue-500 p-3 rounded-lg">
//           <Text className="text-white font-bold">Send</Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   </KeyboardAwareScrollView>
// );
// }

import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatStackParamList } from '@/app/(root)/(tabs)/chat';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatRoom'>;

type Message = {
  id: string;
  text: string;
  sender: string; // e.g., "me" or "them"
};

export default function ChatRoomScreen({ route }: Props) {
  const { roomId, roomName } = route.params;
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hey there!', sender: 'them' },
    { id: '2', text: 'Hi! How’s it going?', sender: 'me' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'me',
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Chat Header */}
      <View className="items-center py-4 border-b border-gray-200">
        <Text className="text-lg font-semibold">{roomName}</Text>
        <Text className="text-xs text-gray-500">Room ID: {roomId}</Text>
      </View>

      {/* Message List */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View className={`mb-2 ${item.sender === 'me' ? 'items-end' : 'items-start'}`}>
            <View className={`max-w-[75%] px-4 py-2 rounded-2xl ${item.sender === 'me' ? 'bg-blue-500' : 'bg-gray-200'}`}>
              <Text className={`${item.sender === 'me' ? 'text-white' : 'text-black'}`}>{item.text}</Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">{item.sender === 'me' ? 'You' : 'Other User'}</Text>
          </View>
        )}
      />

      {/* Typing Input */}
      <View className="flex-row items-center p-4 border-t border-gray-200 bg-white">
        <TextInput
          className="flex-1 border rounded-full px-4 py-2 mr-2 bg-gray-100"
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={sendMessage}>
          <Ionicons name="send" size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}