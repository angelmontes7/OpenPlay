import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, Text } from 'react-native';
import socket from "@/lib/socket";

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.on('receive-message', (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('receive-message');
    };
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      socket.emit('send-message', message);
      setMessage('');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
      <TextInput value={message} onChangeText={setMessage} placeholder="Type a message..." />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
};

export default Chat;
