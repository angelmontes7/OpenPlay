import { ScrollView, Text, View, Image, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, TextInput, TouchableOpacity, ImageBackground } from "react-native";
import { images, icons } from "@/constants";
import InputField from "@/components/InputField";
import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { Link } from "expo-router";
import OAuth from "@/components/OAuth";
import { useSignUp } from "@clerk/clerk-expo";
import { ReactNativeModal } from "react-native-modal";
import { router } from "expo-router";
import { fetchAPI } from "@/lib/fetch";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import * as WebBrowser from "expo-web-browser";

const SignUp = () => {
    const { isLoaded, signUp, setActive } = useSignUp();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        dob: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [verification, setVerification] = useState({
        state: 'default',
        error: '',
        code: '',
    });
    
    // Handle submission of sign-up form
    const onSignUpPress = async () => {
        if (!isLoaded) return

        if (!validateDOB(form.dob)) {
            return;
        }

        if (form.password !== form.confirmPassword) {
            Alert.alert("Passwords do not match", "Please ensure both passwords match.");
            return;
        }


        try {
            await signUp.create({
                emailAddress: form.email,
                username: form.username,
                password: form.password,
            })

            // Send user an email with verification code
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            // Set 'pendingVerification' to true to display second form
            // and capture OTP code
            setVerification({
                ...verification,
                state: 'pending'
            })
        } catch (err: any) {
            Alert.alert('Error', err.errors[0].longMessage)
        }
    }

    // Handle submission of verification form
    const onVerifyPress = async () => {
        if (!isLoaded) return

        try {
            // Use the code the user provided to attempt verification
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code: verification.code,
            })

            // If verification was completed, set the session to active
            // and redirect the user
            if (signUpAttempt.status === 'complete') {
                await fetchAPI("/api/database/user", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: form.username,
                        email: form.email,
                        dob: form.dob,
                        clerkId: signUpAttempt.createdUserId,
                    }),
                });
                
                try {
                    const response = await fetchAPI("/api/stripe/connected-account", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            clerkId: signUpAttempt.createdUserId,
                            email: form.email,
                        }),
                    });

                    if (response.onboardingLink) {
                    // Open the Stripe onboarding link using Expo's WebBrowser
                        await WebBrowser.openBrowserAsync(response.onboardingLink);
                    }
                } catch (error) {
                    console.error('Error creating connected account', error);
                }
                

                await setActive({ session: signUpAttempt.createdSessionId })
                setVerification({ ...verification, state: 'success' })
            } else {
                setVerification({ ...verification, error: "Verification failed", state: 'failed' })
                console.error(JSON.stringify(signUpAttempt, null, 2))
            }
        } catch (err: any) {
            setVerification({ ...verification, error: err.errors[0].longMessage, state: 'failed' })
        }
    };

    const formatDOB = (value: string) => {
        // Remove all non-digit characters
        value = value.replace(/\D/g, '');

        // Format the value as MM-DD-YYYY
        if (value.length > 2 && value.length <= 4) {
            value = value.slice(0, 2) + '-' + value.slice(2);
        } else if (value.length > 4) {
            value = value.slice(0, 2) + '-' + value.slice(2, 4) + '-' + value.slice(4, 8);
        }

        return value;
    };

    const validateDOB = (dob: string) => {
        // Ensure the input is not empty
        if (!dob) {
            Alert.alert("Invalid Date", "Date of birth is required.");
            return false;
        }

        // Split the date string into components
        const [month, day, year] = dob.split('-').map(Number);

        // Check if the date components are valid numbers
        if (!month || !day || !year) {
            Alert.alert("Invalid Date", "The entered date is not valid.");
            return false;
        }

        // Create a date object from the components
        const date = new Date(year, month - 1, day);

        const today = new Date();

        if (year < 1900 || date > today) {
            Alert.alert("Invalid Date", "The entered date must be between 1900 and the current year.");
            return false;
        }

        return true;
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {/* Hero Section with Sports Background */}
                    <ImageBackground 
                        source={require("@/assets/images/sports-stadium.jpg")} // Replace with your sports arena image
                        className="w-full h-[300px]"
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
                            className="w-full h-full flex justify-end p-6"
                        >
                            <Animatable.View animation="fadeIn" duration={1000}>
                                <Text className="text-white text-4xl font-JakartaExtraBold mb-1">Game On!</Text>
                                <Text className="text-white text-xl font-JakartaMedium">Join the sports betting community</Text>
                            </Animatable.View>
                        </LinearGradient>
                    </ImageBackground>
                    
                    {/* Main Content */}
                    <View className="p-5 bg-white rounded-t-3xl -mt-6">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-black text-2xl font-JakartaBold">Create Account</Text>
                            <View className="flex-row items-center px-3 py-1 bg-green-100 rounded-full">
                                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                                <Text className="text-green-600 text-xs ml-1 font-JakartaMedium">Secure & Verified</Text>
                            </View>
                        </View>

                        <InputField
                            label="Username"
                            placeholderTextColor="#A0A0A0"
                            placeholder="Choose a unique username"
                            icon={icons.person}
                            value={form.username}
                            onChangeText={(value) => setForm({ ...form, username: value })}
                        />
                        
                        <InputField
                            label="Email"
                            placeholderTextColor="#A0A0A0"
                            placeholder="Your email address"
                            icon={icons.email}
                            value={form.email}
                            onChangeText={(value) => setForm({ ...form, email: value })}
                        />
                        
                        <View className="relative">
                            <InputField
                                label="Password"
                                placeholderTextColor="#A0A0A0"
                                placeholder="Create a strong password"
                                icon={icons.lock}
                                secureTextEntry={!showPassword}
                                value={form.password}
                                onChangeText={(value) => setForm({ ...form, password: value })}
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
                        
                        <View className="relative">
                            <InputField
                                label="Confirm Password"
                                placeholderTextColor="#A0A0A0"
                                placeholder="Confirm your password"
                                icon={icons.lock}
                                secureTextEntry={!showConfirmPassword}
                                value={form.confirmPassword}
                                onChangeText={(value) => setForm({ ...form, confirmPassword: value })}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-2/3 transform -translate-y-1">
                                <Ionicons
                                    name={showConfirmPassword ? "eye" : "eye-off"}
                                    size={20}
                                    color="gray"
                                />
                            </TouchableOpacity>
                        </View>
                        
                        <Text className={`text-sm mt-1 ${form.password !== form.confirmPassword ? 'text-red-500' : 'text-green-500'}`}>
                            {form.password && form.confirmPassword ?
                                (form.password !== form.confirmPassword ? "Passwords do not match" : "Passwords match")
                                : ""}
                        </Text>
                        
                        <InputField
                            label="Date of Birth"
                            placeholder="MM-DD-YYYY"
                            placeholderTextColor="#A0A0A0"
                            icon={icons.calendar}
                            value={form.dob}
                            onChangeText={(value) => setForm({ ...form, dob: formatDOB(value) })}
                            keyboardType="number-pad"
                        />
                        
                        <Text className="text-xs text-gray-500 mt-1 mb-4">
                            *Age verification required for betting features
                        </Text>

                        <View className="mt-2 p-4 bg-blue-50 rounded-lg mb-5">
                            <Text className="text-blue-800 font-JakartaMedium text-sm">
                                By creating an account, you'll be able to:
                            </Text>
                            <View className="mt-2">
                                <View className="flex-row items-center mb-1">
                                    <Ionicons name="location" size={16} color="#0286FF" />
                                    <Text className="text-gray-700 ml-2">Find sports facilities near you</Text>
                                </View>
                                <View className="flex-row items-center mb-1">
                                    <Ionicons name="cash-outline" size={16} color="#0286FF" />
                                    <Text className="text-gray-700 ml-2">Place bets with other users</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Ionicons name="people-outline" size={16} color="#0286FF" />
                                    <Text className="text-gray-700 ml-2">Join local sports communities</Text>
                                </View>
                            </View>
                        </View>

                        <CustomButton 
                            title="Create Account" 
                            onPress={onSignUpPress} 
                            className="mt-2 bg-[#0286FF]" 
                        />

                        <OAuth />

                        <Link href="/sign-in" className='mt-6 mb-8'>
                            <Text className="text-center text-gray-600">
                                Already have an account? <Text className="text-[#0286FF] font-JakartaBold">Sign In</Text>
                            </Text>
                        </Link>
                    </View>

                    <ReactNativeModal
                        isVisible={verification.state === 'pending'}
                        onModalHide={() => {
                            if (verification.state === 'success') setShowSuccessModal(true)
                        }}>
                        <View className='bg-white px-7 py-9 rounded-2xl min-h-[300px]'>
                            <Text className='text-2xl font-JakartaExtraBold mb-2'>Verification</Text>
                            <Text className='font-Jakarta mb-5'>We've sent a verification code to {form.email}</Text>
                            <InputField
                                label="Verification Code"
                                icon={icons.lock}
                                placeholder="Enter 6-digit code"
                                value={verification.code}
                                keyboardType="numeric"
                                onChangeText={(code) => setVerification({ ...verification, code })}
                            />
                            {verification.error && (
                                <Text className="text-red-500 text-sm mt-1">
                                    {verification.error}
                                </Text>
                            )}
                            <CustomButton title="Verify Email" onPress={onVerifyPress} className="mt-5 bg-success-500" />
                        </View>
                    </ReactNativeModal>

                    <ReactNativeModal isVisible={showSuccessModal}>
                        <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                            <Animatable.View animation="bounceIn" duration={1500}>
                                <Image source={images.check} className="w-[110px] mx-auto my-5" />
                            </Animatable.View>
                            <Text className='text-3xl font-JakartaBold text-center'>You're In!</Text>
                            <Text className='text-base text-gray-500 font-Jakarta text-center mt-2 mb-2'>
                                Your account has been verified. Time to find games and place your bets!
                            </Text>
                            <CustomButton
                                title="Explore Nearby Venues"
                                onPress={() => router.replace('/(root)/(tabs)/home')}
                                className='mt-5 bg-[#0286FF]' 
                            />
                        </View>
                    </ReactNativeModal>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default SignUp;


