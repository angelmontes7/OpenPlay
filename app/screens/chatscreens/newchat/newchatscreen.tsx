// import { useState } from 'react';
// import { View, Text, TextInput, Button, Modal, TouchableOpacity, StyleSheet } from 'react-native';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { ChatStackParamList } from '../../../(root)/(tabs)/chat';

// type Props = NativeStackScreenProps<ChatStackParamList, 'NewChat'>;

// export default function NewChatScreen({ navigation }: Props) {
//   const [chatRoomName, setChatRoomName] = useState('');
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   // Function to handle the modal visibility
//   const toggleModal = () => {
//     setIsModalVisible(!isModalVisible);
//   };

//   // Function to handle chatroom creation
//   const createChatRoom = async () => {
//     if (!chatRoomName.trim()) {
//       alert('Please enter a valid chatroom name');
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const response = await fetch('/api/chatrooms', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ name: chatRoomName }),
//       });

//       if (response.ok) {
//         const newChatRoom = await response.json();
//         console.log('New chatroom created:', newChatRoom);
//         navigation.goBack(); // Close modal and go back to the chat list
//       } else {
//         throw new Error('Failed to create chatroom');
//       }
//     } catch (error) {
//       console.error(error);
//       alert('Something went wrong. Please try again later.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Create a New Chat</Text>

//       {/* Button to trigger the modal */}
//       <Button title="Create New Chatroom" onPress={toggleModal} />

//       {/* Modal for chatroom name input */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={isModalVisible}
//         onRequestClose={toggleModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter Chatroom Name"
//               value={chatRoomName}
//               onChangeText={setChatRoomName}
//             />

//             <TouchableOpacity
//               style={styles.button}
//               onPress={createChatRoom}
//               disabled={isLoading}
//             >
//               <Text style={styles.buttonText}>
//                 {isLoading ? 'Creating...' : 'Create'}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.button} onPress={toggleModal}>
//               <Text style={styles.buttonText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 20,
//     width: '80%',
//     elevation: 10,
//   },
//   input: {
//     borderBottomWidth: 1,
//     borderColor: '#ccc',
//     marginBottom: 15,
//     padding: 10,
//   },
//   button: {
//     backgroundColor: '#007AFF',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   cancelButton: {
//     backgroundColor: '#ddd',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     color: '#333',
//     fontWeight: '600',
//   },
// });