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
import CreditCardForm, { Button, FormModel } from 'rn-credit-card'

interface ChargeCardModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (model: FormModel) => void;
}

const ChargeCardModal: React.FC<ChargeCardModalProps> = ({ visible, onClose, onSubmit }) => {
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
    onSubmit(model);
    reset();
    onClose(); // Hides the modal
  }

  function handleClose() {
    reset();
    onClose();
  }
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