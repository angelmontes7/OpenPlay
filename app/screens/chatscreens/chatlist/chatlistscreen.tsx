import React, { useState, useEffect } from 'react';
import { Button, Modal, TextInput, View, Text } from 'react-native';
import { fetchAPI } from '@/lib/fetch';
import { useAuth } from '@clerk/clerk-expo';
import { useUser } from '@clerk/clerk-expo';


const ChatListScreen = () => {
  const { user } = useUser();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [chatrooms, setChatrooms] = useState<any[]>([]);
  const { userId: clerkId } = useAuth();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      if (!clerkId) return;

      try {
        const res = await fetch(`/(api)/user?clerkId=${user?.id}`);
        const data = await res.json();
        if (res.ok) {
          setUserId(data.id);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, [clerkId]);

  // Now you can use `userId` in your fetchChatrooms or createNewChat functions

  // Function to open/close the modal
  const toggleModal = () => setModalVisible(!isModalVisible);

  // Function to fetch chatrooms
  const fetchChatrooms = async () => {
    try {
      const data = await fetchAPI(`/(api)/chatrooms?userId=${userId}`);
      // const data = await response.json();

      if (data.ok) {
        setChatrooms(data.chatrooms);
      } else {
        console.error(data.error);
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

      if (!userId) {
        alert("User not loaded yet");
        return;
      }
    

      const data = await fetchAPI("/(api)/chatrooms", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newChatName,
          userIds: [userId], // Add the creator's ID to the chat
        }),

        
      });

      // const data = await response.json();

      if (data.chatroomId) {
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
    if (userId !== null) {
      fetchChatrooms(); // Fetch chatrooms when the component mounts
    }
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