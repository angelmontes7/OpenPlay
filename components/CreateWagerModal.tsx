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

interface CreateWagerModalProps {
  visible: boolean;
  onClose: () => void;
  courts: { id: string; name: string; distance: number }[];
  clerkId: string;
  onCreate: (wager: { teamName: string; amount: string; court: { id: string; name: string; distance: number } }) => void;
}

const CreateWagerModal: React.FC<CreateWagerModalProps> = ({ visible, onClose, courts, clerkId, onCreate }) => {
  const { user } = useUser();
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCourt, setSelectedCourt] = useState<{ id: string; name: string; distance: number } | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
        try {
            const response = await fetchAPI(`/(api)/balance?clerkId=${user?.id}`, {
                method: "GET",
            });

            if (response.balance !== undefined) {
                setWalletBalance(response.balance);
            }
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    };

    fetchBalance();
  },[user?.id]);

  const handleCreateWager = async () => {
    if (!teamName || !amount || !selectedCourt) {
      alert('Please fill out all fields.');
      return;
    }

    const wagerAmount = parseFloat(amount);
    if (wagerAmount <= 0 || wagerAmount > walletBalance) {
      alert('Invalid wager amount or insufficient balance.');
      return;
    }

    const wagerData = {
      clerkId,
      wagerAmount,
      court_id: selectedCourt.id,
    };

    
    try {    
        // Step 1: Deduct balance
        const balanceResponse = await fetchAPI("/(api)/balance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                clerkId: user?.id,
                type: "subtract",
                amount: wagerAmount,
            }),
        });

        if (balanceResponse.balance) {
            setWalletBalance(balanceResponse.balance);

            // Store the transaction
            await fetchAPI("/(api)/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clerkId: user?.id,
                    type: "wager",
                    amount: wagerAmount,
                }),
            });
        }

        // Step 2: Create wager
        const wagerResponse = await fetchAPI('/(api)/wager', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wagerData),
        });

        if (wagerResponse.error) {
          alert(`Error is right here: ${wagerResponse.error}`);
          return;
        }

        const wagerId = wagerResponse.id; // Assuming response includes the new wager's ID

        console.log("Wager Reponse: ", wagerResponse)
        // Step 3: Insert creator as first participant
        const participantResponse = await fetchAPI('/(api)/wager_participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wagerId: wagerId,
            clerkId: user?.id,
            teamName: teamName, // User's chosen team name
            betAmount: wagerAmount,
          }),
        });

        if (participantResponse.error) {
          alert(`Error adding participant: ${participantResponse.error}`);
          return;
        }

        console.log('Created wager and added participant:', wagerResponse);
        onCreate({
          teamName,
          amount,
          court: selectedCourt,
        });

        handleClose();
    } catch (error) {
        console.error("Error updating balance:", error);
    }
  };

  const handleClose = () => {
    setTeamName('');
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
            placeholder={`Enter Team Name`}
            placeholderTextColor="#A0A0A0" 
            value={teamName}
            onChangeText={setTeamName}
          />
          <TextInput
            style={styles.input}
            placeholder={`Enter Amount (Max: $${walletBalance})`}
            placeholderTextColor="#A0A0A0" 
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
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

