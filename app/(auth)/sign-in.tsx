import { ScrollView, Text, View, Image, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from "react-native";
import { images, icons } from "@/constants";
import InputField from "@/components/InputField";
import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { Link } from "expo-router";
import OAuth from "@/components/OAuth";
const SignIn = () => {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const onSignInPress = async () => {};

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View className="flex-1 bg-white">
                        <View>
                            <Image source={images.onboarding1} className="z-0 w-full h-[250px]" />
                            <Text className="text-black text-2xl font-JakartaSemiBold left-5">Welcome Back!</Text>
                        </View>
                        <View className="p-5">
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

                            <CustomButton title="Log In" onPress={onSignInPress} className="mt-6" />

                            <OAuth />


                            <Link href="/(auth)/sign-up" className='text-lg text-center text-general-200 mt-10'>
                                <Text>Don't have an account? </Text>
                                <Text className="text-primary-500">Sign Up</Text>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default SignIn;