import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal,
} from 'react-native'
import LottieView from 'lottie-react-native'
import { useUser } from "@clerk/clerk-expo";
import CreditCardForm, { Button, FormModel } from 'rn-credit-card'
import { fetchAPI } from '@/lib/fetch'

interface ChargeCardModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChargeCardModal: React.FC<ChargeCardModalProps> = ({ visible, onClose }) => {
  const { user } = useUser();
  const formMethods = useForm<FormModel>({
    // to trigger the validation on the blur event
    mode: 'onBlur',
    defaultValues: {
      holderName: '',
      cardNumber: '',
      expiration: '',
      cvv: '',
    },
  })
  const { handleSubmit, formState, reset } = formMethods

  function handleFormSubmit(model: FormModel) {
    handleAddCard(model);
    reset();
    onClose(); // Hides the modal
  }

  function handleClose() {
    reset();
    onClose();
  }
  const handleAddCard = async (model: FormModel) => {
    try {
        const response = await fetchAPI("/api/database/charge-cards", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                clerkId: user?.id,
                holderName: model.holderName,
                cardNumber: model.cardNumber,
                expiryMonth: model.expiration.split("/")[0],
                expiryYear: model.expiration.split("/")[1],
                cvc: model.cvv,
            }),
        });

        if (response.card) {
            Alert.alert("Success", "Card added successfully.");
        }
    } catch (error) {
        console.error("Error adding card:", error);
        Alert.alert("Error", "Failed to add card. Please try again.");
    }
};
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <FormProvider {...formMethods}>
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            style={styles.avoider}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <CreditCardForm
              LottieView={LottieView}
              horizontalStart
              overrides={{
                labelText: {
                  marginTop: 16,
                },
              }}
            />
          </KeyboardAvoidingView>
          {formState.isValid && (
            <Button
              style={styles.button}
              title={'Store Card'}
              onPress={handleSubmit(handleFormSubmit)}
            />
          )}
          <Button
            style={styles.button}
            title={'Cancel'}
            onPress={handleClose}
          />
        </SafeAreaView>
      </FormProvider>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avoider: {
    flex: 1,
    padding: 36,
  },
  button: {
    margin: 36,
    marginTop: 0,
  },
})

export default ChargeCardModal;