import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from "@clerk/clerk-expo";

interface WithDrawFundsModalProps {
  visible: boolean;
  onClose: () => void;
  onWithdrawSuccess: (amount: string) => void;
}

const WithDrawFundsModal: React.FC<WithDrawFundsModalProps> = ({ visible, onClose, onWithdrawSuccess }) => {
  const [inputAmount, setInputAmount] = useState('');
  const { user } = useUser();

  useEffect(() => {
    if (!visible) {
      setInputAmount(''); // Clear the input amount when the modal is closed
    }
  }, [visible]);

  const handleConfirmWithdraw = async () => {
    if (inputAmount.trim() === '' || isNaN(Number(inputAmount))) {
      alert('Please enter a valid amount');
      return;
    }

    onWithdrawSuccess(inputAmount);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Withdraw Funds</Text>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={inputAmount}
            onChangeText={setInputAmount}
            placeholder="Enter amount"
            placeholderTextColor="#aaa"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmWithdraw}>
              <Text style={styles.confirmButtonText}>Confirm Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
    backgroundColor: '#f8f8f8',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ddd',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#007bff',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default WithDrawFundsModal;
