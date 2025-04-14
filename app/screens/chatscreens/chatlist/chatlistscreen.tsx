// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { ChatStackParamList } from '../../../(root)/(tabs)/chat';
// import { fetchChatRooms } from '../../../../chat-server/chat-api'; // Import the fetch function
// import { createChatRoom } from '../../../../chat-server/chat-api'; // Import the create function

// // Type for navigation props
// type Props = NativeStackScreenProps<ChatStackParamList, 'ChatList'>;

// export default function ChatListScreen({ navigation }: Props) {
//   const [chatRooms, setChatRooms] = useState<any[]>([]);

//   // Fetch chatrooms from the backend when the screen is mounted
//   useEffect(() => {
//     const loadChatRooms = async () => {
//       const rooms = await fetchChatRooms();
//       setChatRooms(rooms);
//     };

//     loadChatRooms();
//   }, []);

//   // Navigate to a chat room
//   const goToChatRoom = (roomId: string, roomName: string) => {
//     navigation.navigate('ChatRoom', { roomId, roomName });
//   };

//   // Function to handle creating a new chatroom
//   const handleCreateNewChat = async () => {
//     const newRoomName = `Chat Room ${chatRooms.length + 1}`; // Example of a default name
//     const newRoom = await createChatRoom(newRoomName);  // Create a new chatroom using the API

//     if (newRoom) {
//       // If the chatroom was created successfully, add it to the chatRooms state
//       setChatRooms((prevRooms) => [...prevRooms, newRoom]);
//     } else {
//       alert('Failed to create chatroom');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Chat Rooms</Text>

//       <FlatList
//         data={chatRooms}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <TouchableOpacity onPress={() => goToChatRoom(item.id, item.name)}>
//             <View style={styles.chatItem}>
//               <Text style={styles.chatItemText}>{item.name}</Text>
//             </View>
//           </TouchableOpacity>
//         )}
//       />

//       {/* Floating Add New Chat Button */}
//       <TouchableOpacity 
//         style={styles.floatingButton} 
//         onPress={handleCreateNewChat}
//       >
//         <Text style={styles.floatingButtonText}>+</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9f9f9',
//     padding: 16,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   chatItem: {
//     backgroundColor: '#ffffff',
//     padding: 15,
//     marginBottom: 10,
//     borderRadius: 8,
//     elevation: 2,  // Add shadow on Android
//     shadowColor: '#000',  // Add shadow on iOS
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   chatItemText: {
//     fontSize: 18,
//     color: '#333',
//   },
//   floatingButton: {
//     position: 'absolute',
//     bottom: 30,
//     right: 30,
//     backgroundColor: '#007bff',
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 5,  // Shadow for Android
//     shadowColor: '#000',  // Shadow for iOS
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   floatingButtonText: {
//     fontSize: 30,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });

import React, { useState, useEffect } from 'react';
import { Button, Modal, TextInput, View, Text } from 'react-native';
import { fetchAPI } from '@/lib/fetch';

const ChatListScreen = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [userId, setUserId] = useState(1); // Set this to the logged-in user's ID (use Clerk or auth context)
  const [chatrooms, setChatrooms] = useState<any[]>([]);

  // Function to open/close the modal
  const toggleModal = () => setModalVisible(!isModalVisible);

  // Function to fetch chatrooms
  const fetchChatrooms = async () => {
    try {
      const response = await fetchAPI(`/(api)/chatrooms?userId=${userId}`);
      // const data = await response.json();

      if (response.ok) {
        setChatrooms(response.chatrooms);
      } else {
        console.error(response.error);
      }
    } catch (error) {
      console.error('Error fetching chatrooms:', error);
    }
  };

  // Function to create a new chatroom
  const createNewChat = async () => {
    try {
      if (!newChatName) {
        alert('Please enter a chat name');
        return;
      }

      const response = await fetchAPI("/(api)/chatrooms?userId=${userId}", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newChatName,
          userIds: [userId], // Add the creator's ID to the chat
        }),

        
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Chatroom created:', data.chatroomId);
        // After creating the chat, fetch the updated chat list
        fetchChatrooms();
      } else {
        console.error(data.error);
      }

      // Close the modal after creating the chat
      toggleModal();
      setNewChatName(''); // Reset the input field
    } catch (error) {
      console.error('Error creating chatroom:', error);
    }
  };

  useEffect(() => {
    fetchChatrooms(); // Fetch chatrooms when the component mounts
  }, [userId]);

  return (
    <View>
      {/* Button to create new chat */}
      <Button title="New Chat" onPress={toggleModal} />
      
      {/* Modal for creating new chat */}
      <Modal visible={isModalVisible} animationType="slide">
        <View style={{ padding: 20 }}>
          <Text>Create New Chat</Text>
          <TextInput
            placeholder="Enter chat name"
            value={newChatName}
            onChangeText={setNewChatName}
            style={{ borderWidth: 1, marginBottom: 20, padding: 8 }}
          />
          <Button title="Create" onPress={createNewChat} />
          <Button title="Cancel" onPress={toggleModal} />
        </View>
      </Modal>

      {/* Render the list of chatrooms */}
      <Text>Your Chatrooms:</Text>
      <View>
        {chatrooms.map((chatroom) => (
          <Text key={chatroom.id}>{chatroom.name}</Text>
        ))}
      </View>
    </View>
  );
};

export default ChatListScreen;