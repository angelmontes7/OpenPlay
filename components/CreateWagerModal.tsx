import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import CustomButton from '@/components/CustomButton';
import { useUser } from '@clerk/clerk-expo';

interface CreateWagerModalProps {
  visible: boolean;
  onClose: () => void;
  courts: { id: string; name: string; distance: number }[];
  clerkId: string;
  onCreate: (wager: { username: string; amount: string; type: string; court: { id: string; name: string; distance: number } }) => void;
}

const CreateWagerModal: React.FC<CreateWagerModalProps> = ({ visible, onClose, courts, clerkId, onCreate }) => {
  const { user } = useUser();
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setWagerType] = useState('');
  const [selectedCourt, setSelectedCourt] = useState<{ id: string; name: string; distance: number } | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (visible) {
      const fetchBalance = async () => {
        try {
          const response = await fetch(`/(api)/balance?clerkId=${clerkId}`);
          const data = await response.json();
          console.warn('Fetched balance:', data);
          if (data.balance !== undefined) {
            setWalletBalance(data.balance);
          }
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      };
      fetchBalance();
    }
  }, [visible, clerkId]);

  const handleCreateWager = async () => {
    if (!username || !amount || !type || !selectedCourt) {
      alert('Please fill out all fields.');
      return;
    }

    if (parseFloat(amount) > walletBalance) {
      alert('Insufficient balance.');
      return;
    }

    const wager = { clerkId: clerkId, wagerAmount: amount, wagerType: type, court_id: selectedCourt.id, username: username };
    console.log('Creating wager:', { username, amount, court: selectedCourt });

    try {
      const response = await fetch('/(api)/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user?.id,
          type: 'subtract',
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();
      console.log('Updated balance:', data);
      if (data.balance !== undefined) {
        setWalletBalance(data.balance);
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }

    try {
      const response = await fetch('/(api)/wager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wager),
      });

      const data = await response.json();
      console.log('Created wager:', data);
    } catch (error) {
      console.error('Error creating wager:', error);
    }

    //fetchWagers();
    handleClose();
  };

  const handleClose = () => {
    setUsername('');
    setAmount('');
    setSelectedCourt(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.header}>Create Wager</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Username"
            placeholderTextColor="#A0A0A0" 
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder={`Enter Amount (Max: $${walletBalance})`}
            placeholderTextColor="#A0A0A0" 
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <TextInput
            style={styles.input}
            placeholder="Choose Wager Type"
            placeholderTextColor="#A0A0A0" 
            value={type}
            onChangeText={setWagerType}
          />
          <Text style={styles.subHeader}>Select Court:</Text>
          <FlatList
            data={courts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.courtItem, selectedCourt?.id === item.id && styles.selectedCourt]}
                onPress={() => setSelectedCourt(item)}>
                <Text>{item.name} ({item.distance} mi)</Text>
              </TouchableOpacity>
            )}
          />
          <Text style={styles.balanceText}>Current Balance: ${walletBalance}</Text>
          <CustomButton title="Create Wager" onPress={handleCreateWager} />
          <CustomButton title="Cancel" onPress={handleClose} style={styles.cancelButton} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  courtItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedCourt: {
    backgroundColor: '#ddd',
  },
  cancelButton: {
    backgroundColor: 'red',
    marginTop: 10,
  },
  balanceText: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
});

export default CreateWagerModal;

