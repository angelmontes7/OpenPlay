/*import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";

const SignUp = () => {
    return (
        <SafeAreaView>
            <Text> Sign Up </Text>
        </SafeAreaView>
    );
};

export default SignUp;*/

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, TextInput, Button } from "react-native";

const SignUp = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSignUp = () => {
        console.log("Signing up with:", { username, password });
        // Handle signup logic here
    };

    return (
        <SafeAreaView className="flex-1 justify-center items-center p-4">
            <Text className="text-2xl font-bold mb-5">Sign Up</Text>
            <View className="w-full mb-5">
                <Text>Username:</Text>
                <TextInput
                    className="h-10 border border-gray-400 w-full px-2 mb-3 rounded"
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter username"
                />
                <Text>Password:</Text>
                <TextInput
                    className="h-10 border border-gray-400 w-full px-2 mb-3 rounded"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    secureTextEntry
                />
            </View>
            <Button title="Sign Up" onPress={handleSignUp} />
        </SafeAreaView>
    );
};

export default SignUp;
