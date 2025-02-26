import React, { useState, useEffect } from 'react';
import { useAuth, useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View, TextInput, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import CustomButton from '@/components/CustomButton';
import { Link } from 'expo-router';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  if (!isLoaded) {
    return null;
  }

  // If the user is already signed in,
  // redirect them to the home page
  useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  if (!isLoaded) {
    return null;
  }

  // Send the password reset code to the user's email
  async function create(e: React.FormEvent) {
    e.preventDefault();
    await signIn
      ?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      .then((_) => {
        setSuccessfulCreation(true);
        setError('');
      })
      .catch((err) => {
        console.error('error', err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
      });
  }

  // Reset the user's password.
  // Upon successful reset, the user will be
  // signed in and redirected to the home page
  async function reset(e: React.FormEvent) {
    e.preventDefault();
    await signIn
      ?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })
      .then((result) => {
        // Check if 2FA is required
        if (result.status === 'needs_second_factor') {
          setSecondFactor(true);
          setError('');
        } else if (result.status === 'complete') {
          // Set the active session to
          // the newly created session (user is now signed in)
          setActive({ session: result.createdSessionId });
          setError('');
        } else {
          console.log(result);
        }
      })
      .catch((err) => {
        console.error('error', err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
      });
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="flex-1 bg-white">
            <View className="p-5">
              <Text className="text-black text-2xl font-JakartaSemiBold">Forgot Password?</Text>
              <Text className="text-gray-500 text-sm mb-5">Enter your email to receive a password reset code.</Text>

              {!successfulCreation && (
                <>
                  <TextInput
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={(value) => setEmail(value)}
                    className="border border-gray-300 rounded-lg p-3 mb-4"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <CustomButton title="Send password reset code" onPress={create} className="mt-6" />
                  {error && <Text className="text-red-500 mt-2">{error}</Text>}
                </>
              )}

              {successfulCreation && (
                <>
                  <TextInput
                    placeholder="Enter your new password"
                    placeholderTextColor="#A0A0A0"
                    value={password}
                    onChangeText={(value) => setPassword(value)}
                    className="border border-gray-300 rounded-lg p-3 mb-4"
                    secureTextEntry
                  />
                  <TextInput
                    placeholder="Enter the password reset code"
                    placeholderTextColor="#A0A0A0"
                    value={code}
                    onChangeText={(value) => setCode(value)}
                    className="border border-gray-300 rounded-lg p-3 mb-4"
                  />
                  <CustomButton title="Reset" onPress={reset} className="mt-6" />
                  {error && <Text className="text-red-500 mt-2">{error}</Text>}
                </>
              )}

              {secondFactor && <Text className="text-red-500 mt-2">2FA is required, but this UI does not handle that</Text>}

              <Link href="/(auth)/sign-in" className='text-lg text-center text-general-200 mt-10'>
                <Text>Remembered your password? </Text>
                <Text className="text-primary-500">Log In</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordPage;