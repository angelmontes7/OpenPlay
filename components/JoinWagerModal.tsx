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
import { fetchAPI } from '@/lib/fetch';

interface JoinWagerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedWager: { id: string; team_name: string; base_bet_amount: number } | null;  // Accept the selected wager
  clerkId: string;
  onJoin: (wager: { teamName: string; amount: number }) => void;
}

const JoinWagerModal: React.FC<JoinWagerModalProps> = ({ visible, onClose, selectedWager, clerkId, onJoin }) => {
  const { user } = useUser();
  const [walletBalance, setWalletBalance] = useState(0);
  const [teamName, setTeamName] = useState('');
  
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetchAPI(`/(api)/balance?clerkId=${user?.id}`, {
          method: 'GET',
        });
        if (response.balance !== undefined) {
          setWalletBalance(response.balance);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };
    fetchBalance();
  }, [user?.id]);

  const handleJoinWager = async () => {
    if (!selectedWager || !teamName) {
      alert('Please select a wager and enter a team name.');
      return;
    }

    const wagerAmount = parseFloat(selectedWager.base_bet_amount);
    const walletBalance = parseFloat(walletBalance);
    
    if (wagerAmount > walletBalance) {
      alert('Insufficient balance to join this wager.');
      return;
    }

    try {
      // Deduct balance
      const balanceResponse = await fetchAPI('/(api)/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user?.id,
          type: 'subtract',
          amount: wagerAmount,
        }),
      });
      if (balanceResponse.balance) {
        setWalletBalance(balanceResponse.balance);

        // Store transaction
        await fetchAPI('/(api)/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: user?.id,
            type: 'wager',
            amount: wagerAmount,
          }),
        });
      }

      // Add participant to wager
      const participantResponse = await fetchAPI('/(api)/wager_participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wagerId: selectedWager.id,
          clerkId: user?.id,
          teamName: teamName,
          betAmount: wagerAmount,
        }),
      });

      if (participantResponse.error) {
        alert(`Error adding participant: ${participantResponse.error}`);
        return;
      }

      console.log('Joined wager successfully:', participantResponse);
      onJoin({ teamName, amount: wagerAmount });
      handleClose();
    } catch (error) {
      console.error('Error joining wager:', error);
    }
  };

  const handleClose = () => {
    setTeamName('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.header}>Join Wager</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Team Name"
            placeholderTextColor="#A0A0A0"
            value={teamName}
            onChangeText={setTeamName}
          />
          
          <Text style={styles.balanceText}>Current Balance: ${walletBalance}</Text>
          <CustomButton title="Join Wager" onPress={handleJoinWager} />
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
  wagerItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedWager: {
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

export default JoinWagerModal;
