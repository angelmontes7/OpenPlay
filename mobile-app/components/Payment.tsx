import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";
import { useAuth } from "@clerk/clerk-expo";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { PaymentProps } from "@/types/type";

const Payment = forwardRef(({ fullName, email, amount, onSuccess }: PaymentProps, ref) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { userId } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);

  const openPaymentSheet = async () => {
    await initializePaymentSheet();

    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      setSuccess(true);
      onSuccess();
    }
  };

  useImperativeHandle(ref, () => ({
    openPaymentSheet,
  }));

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      intentConfiguration: {
        mode: {
          amount: parseInt(amount) * 100,
          currencyCode: "usd",
        },
        confirmHandler: async (
          paymentMethod,
          shouldSavePaymentMethod,
          intentCreationCallback,
        ) => {
          try {
            const { paymentIntent, customer } = await fetchAPI(
              "/(api)/(stripe)/create",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: fullName || email.split("@")[0],
                  email: email,
                  amount: amount,
                  paymentMethodId: paymentMethod.id,
                }),
              },
            );

            if (paymentIntent.client_secret) {
              const { result } = await fetchAPI("/(api)/(stripe)/pay", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  payment_method_id: paymentMethod.id,
                  payment_intent_id: paymentIntent.id,
                  customer_id: customer,
                  client_secret: paymentIntent.client_secret,
                  return_url: "myapp://wallet",
                }),
              });

              intentCreationCallback({
                clientSecret: result.client_secret,
              });
            }
          } catch (error) {
            console.error("Error during payment process:", error);
            Alert.alert("Payment Error", "An error occurred during the payment process. Please try again.");
          }
        },
      },
      returnURL: "myapp://wallet",
    });

    if (error) {
      console.error("Error initializing payment sheet:", error);
      Alert.alert("Payment Initialization Error", "An error occurred while initializing the payment sheet. Please try again.");
    }
  };

  return (
    <>
      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Payment Successful
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Your funds have been successfully added.
          </Text>

          <CustomButton
            title="Back to Wallet"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/wallet");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
});

export default Payment;