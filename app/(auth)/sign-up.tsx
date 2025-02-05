/*
import { useState } from "react";
import { SafeAreaView, Text, View, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from "react-native";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";

const SignUp = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [dob, setDob] = useState("");

    const handleSignUp = () => {
        console.log("Signing up with:", { firstName, lastName, email, username, password, dob });
        // Handle sign-up logic (API call)
    };

    return (
        <SafeAreaView className="flex-1 bg-white px-6">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1 justify-center items-center">
                        {/* Back Button */
           /* <TouchableOpacity 
                onPress={() => router.replace("/(auth)/welcome")}
                className="flex flex-row items-center py-4"
            >
                <Text className="text-[#0286FF] text-lg font-JakartaBold"> {'<'} Back</Text>
            </TouchableOpacity>

            {/* Scrollable Content */ // w-full to take up whole screen for forms
            /*<ScrollView className="w-3/4 mx-auto" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Logo or Illustration */

                {/* Form Inputs */}
               /* <Text className="text-black text-2xl font-bold text-center mb-5">Create an Account</Text>

                <View className="mb-5">
                    <Text className="text-black text-md font-JakartaSemiBold mb-1">First Name</Text>
                    <TextInput
                        className = "border border-[#E2E8F0] w-full px-3 py-3 rounded-lg text-black"
                        //className="border border-gray-300 w-full px-4 py-3 rounded-lg text-md"
                        value={firstName} onChangeText={setFirstName} placeholder="Enter first name" 
                        placeholderTextColor="#858585"
                    />
                </View>

                <View className="mb-5">
                    <Text className="text-black text-md font-JakartaSemiBold mb-1">Last Name</Text>
                    <TextInput 
                        className="border border-[#E2E8F0] w-full px-3 py-3 rounded-lg text-md"
                        value={lastName} onChangeText={setLastName} placeholder="Enter last name"
                        placeholderTextColor="#858585"
                    />
                </View>

                <View className="mb-5">
                    <Text className="text-black text-md font-JakartaSemiBold mb-1">Email</Text>
                    <TextInput 
                        className="border border-[#E2E8F0] w-full px-3 py-3 rounded-lg text-black"
                        value={email} onChangeText={setEmail} placeholder="Enter email" keyboardType="email-address"
                        placeholderTextColor="#858585"
                    />
                </View>

                <View className="mb-5">
                    <Text className="text-black text-md font-JakartaSemiBold mb-1">Username</Text>
                    <TextInput 
                        className="border border-[#E2E8F0] w-full px-3 py-3 rounded-lg text-md"
                        value={username} onChangeText={setUsername} placeholder="Choose a username"
                        placeholderTextColor="#858585"
                    />
                </View>

                <View className="mb-5">
                    <Text className="text-black text-md font-JakartaSemiBold mb-1">Password</Text>
                    <TextInput 
                        className="border border-[#E2E8F0] w-full px-3 py-3 rounded-lg text-md"
                        value={password} onChangeText={setPassword} placeholder="Enter password" secureTextEntry
                        placeholderTextColor="#858585"
                    />
                </View>

                <View className="mb-5">
                    <Text className="text-black text-md font-JakartaSemiBold mb-1">Date of Birth</Text>
                    <TextInput 
                        className="border border-[#E2E8F0] w-full px-3 py-3 rounded-lg text-md"
                        value={dob} onChangeText={setDob} placeholder="MM-DD-YYYY" keyboardType="number-pad"
                        placeholderTextColor="#858585"
                    />
                </View>

                {/* Sign Up Button */
               /* <TouchableOpacity 
                    onPress={handleSignUp} 
                    className="w-full bg-[#0286FF] py-4 rounded-full mb-4"
                >
                    <Text className="text-white text-center font-JakartaBold text-lg">Sign Up</Text>
                </TouchableOpacity>

                {/* Sign In Link */
                /*<View className="flex flex-row justify-center mt-4">
                    <Text className="text-[#858585] text-md">Already have an account? </Text>
                    <TouchableOpacity 
                        onPress={() => router.replace("/(auth)/sign-in")}
                    >
                        <Text className="text-[#0286FF] text-md font-JakartaBold">Sign In</Text>
                    </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignUp;*/

import { useState } from "react";
import { SafeAreaView, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { router } from "expo-router";

const SignUp = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [dob, setDob] = useState("");

    const handleSignUp = () => {
        console.log("Signing up with:", { firstName, lastName, email, username, password, dob });
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1 px-6">
                        {/* Back Button */}
                        <TouchableOpacity 
                            onPress={() => router.replace("/(auth)/welcome")}
                            className="flex flex-row items-center py-4"
                        >
                            <Text className="text-[#0286FF] text-lg font-JakartaBold"> {"<"} Back</Text>
                        </TouchableOpacity>

                        {/* Scrollable Content */}
                        <ScrollView 
                            className="w-3/4 mx-auto" 
                            contentContainerStyle={{ paddingBottom: 40 }} 
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text className="text-black text-2xl font-bold text-center mb-5">Create an Account</Text>

                            <View className="mb-5">
                                <Text className="text-black text-md font-JakartaSemiBold mb-1">First Name</Text>
                                <TextInput
                                    className="border border-[#E2E8F0] w-full px-3 py-3 rounded-lg text-black"
                                    value={firstName} onChangeText={setFirstName} placeholder="Enter first name" 
                                    placeholderTextColor="#858585"
                                />
                            </View>

                            <View className="mb-5">
                                <Text className="text-black text-md font-JakartaSemiBold mb-1">Last Name</Text>
                                <TextInput 
                                    className="border border-[#E2E8F0] w-full px-3 py-3 rounded-lg text-md"
                                    value={lastName} onChangeText={setLastName} placeholder="Enter last name"
                                    placeholderTextColor="#858585"
                                />
                            </View>

                            <View className="mb-5">
                                <Text className="text-black text-md font-JakartaSemiBold mb-1">Email</Text>
                                <TextInput 
                                    className="border border-[#E2E8F0] w-full px-3 py-3 rounded-lg text-black"
                                    value={email} onChangeText={setEmail} placeholder="Enter email" keyboardType="email-address"
                                    placeholderTextColor="#858585"
                                />
                            </View>

                            <View className="mb-5">
                                <Text className="text-black text-md font-JakartaSemiBold mb-1">Username</Text>
                                <TextInput 
                                    className="border border-[#E2E8F0] w-full px-3 py-3 rounded-lg text-md"
                                    value={username} onChangeText={setUsername} placeholder="Choose a username"
                                    placeholderTextColor="#858585"
                                />
                            </View>

                            <View className="mb-5">
                                <Text className="text-black text-md font-JakartaSemiBold mb-1">Password</Text>
                                <TextInput 
                                    className="border border-[#E2E8F0] w-full px-3 py-3 rounded-lg text-md"
                                    value={password} onChangeText={setPassword} placeholder="Enter password" secureTextEntry
                                    placeholderTextColor="#858585"
                                />
                            </View>

                            <View className="mb-5">
                                <Text className="text-black text-md font-JakartaSemiBold mb-1">Date of Birth</Text>
                                <TextInput 
                                    className="border border-[#E2E8F0] w-full px-3 py-3 rounded-lg text-md"
                                    value={dob} onChangeText={setDob} placeholder="MM-DD-YYYY" keyboardType="number-pad"
                                    placeholderTextColor="#858585"
                                />
                            </View>

                            {/* Sign Up Button */}
                            <TouchableOpacity 
                                onPress={handleSignUp} 
                                className="w-full bg-[#0286FF] py-4 rounded-full mb-4"
                            >
                                <Text className="text-white text-center font-JakartaBold text-lg">Sign Up</Text>
                            </TouchableOpacity>

                            {/* Sign In Link */}
                            <View className="flex flex-row justify-center mt-4">
                                <Text className="text-[#858585] text-md">Already have an account? </Text>
                                <TouchableOpacity 
                                    onPress={() => router.replace("/(auth)/sign-in")}
                                >
                                    <Text className="text-[#0286FF] text-md font-JakartaBold">Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignUp;

