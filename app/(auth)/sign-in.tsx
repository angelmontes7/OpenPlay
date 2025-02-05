/*import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";

const SignIn = () => {
    return (
        <SafeAreaView>
            <Text> Sign In </Text>
        </SafeAreaView>
    );
};

export default SignIn;*/

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";

const SignIn = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSignIn = () => {
        console.log("Signing in with:", { username, password });
        // Handle sign-in logic here
    };

    return (
        <SafeAreaView className="flex-1 justify-center items-center px-4 bg-white">
            {/*Back Button*/}
            <TouchableOpacity
                onPress={() => router.replace("/(auth)/welcome")}
                className="flex flex-row items-center py-4"
            >
                <Text className="text-[#0286FF] text-lg font-JakartaBold"> {'<'} Back</Text>
            </TouchableOpacity>
            
            {/* Sign In Text */}
            <Text className="text-3xl font-bold text-black mb-5">Sign In</Text>

            {/* Username Input */}
            <View className="w-full mb-4">
                <Text className="text-black text-md font-JakartaSemiBold mb-1">Username:</Text>
                <TextInput
                    className="h-12 border border-[#E2E8F0] w-full px-3 rounded-lg text-black"
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter username"
                    placeholderTextColor="#858585"
                />
            </View>

            {/* Password Input */}
            <View className="w-full mb-6">
                <Text className="text-black text-md font-JakartaSemiBold mb-1">Password:</Text>
                <TextInput
                    className="h-12 border border-[#E2E8F0] w-full px-3 rounded-lg text-black"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    placeholderTextColor="#858585"
                    secureTextEntry
                />
            </View>

            {/* Sign In Button */}
            <TouchableOpacity 
                onPress={handleSignIn} 
                className="w-full bg-[#0286FF] py-4 rounded-full mb-4"
            >
                <Text className="text-white text-center font-JakartaBold text-lg">Sign In</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex flex-row justify-center mt-4">
                <Text className="text-[#858585] text-md">Don't have an account? </Text>
                <TouchableOpacity 
                    onPress={() => router.push("/(auth)/sign-up")}
                >
                    <Text className="text-[#0286FF] text-md font-JakartaBold">Sign Up</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default SignIn;