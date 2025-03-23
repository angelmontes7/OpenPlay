import React, { useState, useEffect } from 'react';
import { useAuth, useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, TouchableOpacity } from 'react-native';
import CustomButton from '@/components/CustomButton';
import { Link } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCode, setShowCode] = useState(false);

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
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="flex-1 bg-gray-50">
            {/* App Logo and Header */}
            {/* #TODO: Create actual logo */}
            {/* #TODO: Create actual logo */}
            {/* #TODO: Create actual logo */}
            {/* #TODO: Create actual logo */}
            <View className="items-center mt-10 mb-4">
              <View className="flex-row items-center justify-center">
                <Ionicons name="location" size={30} color="#1E88E5" />
                <Ionicons name="trophy" size={28} color="#FF6F00" style={{ marginLeft: 8 }} />
              </View>
              <Text className="text-2xl font-JakartaBold text-center mt-2">OpenPlay</Text>
              <Text className="text-gray-600 text-sm text-center">Find, Play, Bet, Win</Text>
            </View>
            
            {/* Card Container */}
            <View className="mx-5 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Text className="text-black text-xl font-JakartaSemiBold mb-1">Forgot Password?</Text>
              <Text className="text-gray-500 text-sm mb-6">We'll help you get back to finding courts and placing bets!</Text>

              {!successfulCreation ? (
                <>
                  <View className="mb-5">
                    <Text className="text-gray-700 mb-2 font-JakartaMedium">Email Address</Text>
                    <TextInput
                      placeholder="Enter your account email"
                      value={email}
                      onChangeText={(value) => setEmail(value)}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  <CustomButton 
                    title="Send Reset Code" 
                    onPress={create} 
                    className="bg-blue-600" 
                    textClassName="font-JakartaSemiBold"
                  />
                  {error && <Text className="text-red-500 mt-3 text-center">{error}</Text>}
                </>
              ) : (
                <>
                  <View className="mb-4">
                    <Text className="text-gray-700 mb-2 font-JakartaMedium">New Password</Text>
                    <TextInput
                      placeholder="Create a secure password"
                      placeholderTextColor="#A0A0A0"
                      value={password}
                      onChangeText={(value) => setPassword(value)}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-2/3 transform -translate-y-1">
                      <Ionicons
                          name={showPassword ? "eye" : "eye-off"}
                          size={20}
                          color="gray"
                      />
                    </TouchableOpacity>
                  </View>
                  <View className="mb-5">
                    <Text className="text-gray-700 mb-2 font-JakartaMedium">Reset Code</Text>
                    <TextInput
                      placeholder="Enter the code from your email"
                      placeholderTextColor="#A0A0A0"
                      value={code}
                      onChangeText={(value) => setCode(value)}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                      secureTextEntry={!showCode}
                    />
                    <TouchableOpacity
                      onPress={() => setShowCode(!showCode)}
                      className="absolute right-4 top-2/3 transform -translate-y-1">
                      <Ionicons
                          name={showCode ? "eye" : "eye-off"}
                          size={20}
                          color="gray"
                      />
                    </TouchableOpacity>
                  </View>
                  <CustomButton 
                    title="Reset Password" 
                    onPress={reset} 
                    className="bg-blue-600" 
                    textClassName="font-JakartaSemiBold"
                  />
                  {error && <Text className="text-red-500 mt-3 text-center">{error}</Text>}
                </>
              )}

              {secondFactor && (
                <View className="bg-amber-50 p-3 rounded-lg mt-4 border border-amber-200">
                  <Text className="text-amber-700 text-center">Two-factor authentication is required to continue.</Text>
                </View>
              )}
            </View>
            
            <View className="my-8 items-center">
              <Link href="/(auth)/sign-in" className="flex-row items-center">
                <Text className="text-gray-600">Remembered your password? </Text>
                <Text className="text-blue-600 font-JakartaMedium">Sign In</Text>
              </Link>
            </View>
            
            {/* Support and Help */}
            <View className="mb-10 mx-5 p-4 bg-gray-100 rounded-lg">
              <Text className="text-center text-gray-600 text-sm">Need help? Contact our support team</Text>
              <Text className="text-center text-blue-600 text-sm font-JakartaMedium mt-1">support@openplay.com</Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordPage;