import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { PaymentProps } from "@/types/type";

const Payment = forwardRef(({ fullName, email, amount, onSuccess }: PaymentProps, ref) => {
  const { user } = useUser();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [success, setSuccess] = useState<boolean>(false);
  const [connectedId, setConnectedId] = useState<string | null>(null);

  const openPaymentSheet = async () => {
    const connectedIdValue = await fetchConnectedId();
    if (!connectedIdValue) {
        try {
            const response = await fetchAPI("/api/stripe/connected-account", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clerkId: user.id,
                    email: email,
                }),
            });

            if (response.onboardingLink) {
            // Open the Stripe onboarding link using Expo's WebBrowser
                await WebBrowser.openBrowserAsync(response.onboardingLink);
            }
          } catch (error) {
            console.error('Error creating connected account', error);
        }
    }

    try {
      const response = await fetchAPI(`/api/stripe/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectedAccountId: connectedIdValue }),
      });
  
      if (response.status === "restricted") {
        if (response.onboardingLink) {
          await WebBrowser.openBrowserAsync(response.onboardingLink);
          return; // Stop here since user needs to onboard
        } else {
          Alert.alert("Account Issue", "Unable to onboard at this time.");
          return;
        }
      }
  
      // if status === "enabled"
      await initializePaymentSheet(connectedIdValue);
      const { error } = await presentPaymentSheet();
  
      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        setSuccess(true);
        onSuccess();
      }
    } catch (err) {
      console.error("Error checking Stripe status:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  useImperativeHandle(ref, () => ({
    openPaymentSheet,
  }));

  const fetchConnectedId = async () => {
    try {
      if (!user?.id) return;

      const response = await fetchAPI(`/api/database/user?clerkId=${user.id}`, {
        method: "GET",
      });
      
      const userData = response?.[0];
      const connectedAccountId = userData?.connected_account_id ?? null;
  
      setConnectedId(connectedAccountId)

      return connectedAccountId;
    } catch (error) {
      console.error("Error fetching users stripe connected id:", error);
    }
  };

  const initializePaymentSheet = async (connectedId: string | null) => {
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
            console.log("The connected account id is: ", connectedId)
            const { paymentIntent, customer } = await fetchAPI(
              "/api/stripe/create",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: fullName || email.split("@")[0],
                  email: email,
                  amount: amount,
                  connectedAccountId: connectedId,
                }),
              },
            );

            if (paymentIntent.client_secret) {
              const { result } = await fetchAPI("/api/stripe/pay", {
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
});

export default Payment;