import { ScrollView, Text, View, Image, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from "react-native";
import { images, icons } from "@/constants";
import InputField from "@/components/InputField";
import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { Link } from "expo-router";
import OAuth from "@/components/OAuth";
import { useSignUp } from "@clerk/clerk-expo";
import { ReactNativeModal } from "react-native-modal";
import { router } from "expo-router";
const SignUp = () => {
    const { isLoaded, signUp, setActive } = useSignUp();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        dob: "",
    });

    const [verification, setVerification] = useState({
        state: 'default',
        error: '',
        code: '',
    });
    // Handle submission of sign-up form
    const onSignUpPress = async () => {
        if (!isLoaded) return

        // Start sign-up process using email and password provided
        try {
        await signUp.create({
            emailAddress: form.email,
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
                // TODO: CREATE A DATABASE USER!!!!
                // TODO: CREATE A DATABASE USER!!!!
                // TODO: CREATE A DATABASE USER!!!!
                // TODO: CREATE A DATABASE USER!!!!
                // TODO: CREATE A DATABASE USER!!!!
                // TODO: CREATE A DATABASE USER!!!!
                // TODO: CREATE A DATABASE USER!!!!
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

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View className="flex-1 bg-white">
                        <View>
                            <Image source={images.onboarding1} className="z-0 w-full h-[250px]" />
                            <Text className="text-black text-2xl font-JakartaSemiBold left-5">Create Your Account</Text>
                        </View>
                        <View className="p-5">
                            <InputField 
                                label="Username"
                                placeholderTextColor="#A0A0A0"
                                placeholder="Enter your username" 
                                icon={icons.person} 
                                value={form.name} 
                                onChangeText={(value) => setForm({ ...form, name: value })}
                            />
                            <InputField 
                                label="Email"
                                placeholderTextColor="#A0A0A0" 
                                placeholder="Enter your email" 
                                icon={icons.email} 
                                value={form.email} 
                                onChangeText={(value) => setForm({ ...form, email: value })}
                            />
                            <InputField 
                                label="Password"
                                placeholderTextColor="#A0A0A0" 
                                placeholder="Enter your password" 
                                icon={icons.lock} 
                                secureTextEntry={true}
                                value={form.password} 
                                onChangeText={(value) => setForm({ ...form, password: value })}
                            />
                            <InputField 
                                label="DOB"
                                placeholderTextColor="#A0A0A0"
                                placeholder="MM-DD-YYYY" 
                                icon={icons.person} 
                                value={form.dob} 
                                onChangeText={(value) => setForm({ ...form, dob: value })}
                                keyboardType="number-pad"
                            />

                            <CustomButton title="Sign Up" onPress={onSignUpPress} className="mt-6" />

                            <OAuth />


                            <Link href="/sign-in" className='text-lg text-center text-general-200 mt-10'>
                                <Text>Already have an account? </Text>
                                <Text className="text-primary-500">Log In</Text>
                            </Link>
                        </View>

                        <ReactNativeModal 
                            isVisible={verification.state === 'pending'}
                            onModalHide={() => {
                                if(verification.state === 'success') setShowSuccessModal(true)}}>
                            <View className='bg-white px-7 py-9 rounded-2xl min-h-[300px]'>
                                <Text className='text-2xl font-JakartaExtraBold mb-2'>Verification</Text>
                                <Text className='font-Jakarta mb-5'>We have sent a verification code to {form.email}</Text>
                                <InputField 
                                    label="Code"
                                    icon={icons.lock}
                                    placeholder="12345"
                                    value={verification.code}
                                    keyboardType="numeric"
                                    onChangeText={(code) => setVerification({ ...verification, code})}
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
                                <Image source={images.check} className="w-[110px] mx-auto my-5" />
                                <Text className='text-3xl font-JakartaBold text-center'> Verified</Text>
                                <Text className='text-base text-gray-400 font-Jakarta text-center mt-2'>You have successfully verified your account.</Text>
                                <CustomButton 
                                    title="Browse Home" 
                                    onPress={() => router.replace('/(root)/(tabs)/home')} 
                                    className='mt-5' />
                            </View>
                        </ReactNativeModal>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default SignUp;