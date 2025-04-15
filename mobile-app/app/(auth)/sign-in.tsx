import { ScrollView, Text, View, Image, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, ImageBackground, TouchableOpacity } from "react-native";
import { images, icons } from "@/constants";
import InputField from "@/components/InputField";
import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { Link, useRouter } from "expo-router";
import OAuth from "@/components/OAuth";
import { useSignIn } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";

const SignIn = () => {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const onSignInPress = async () => {
        if (!isLoaded) return

        try {
            const signInAttempt = await signIn.create({
            identifier: form.email,
            password: form.password,
            })

            if (signInAttempt.status === 'complete') {
            await setActive({ session: signInAttempt.createdSessionId })
            router.replace('/')
            } else {

            console.error(JSON.stringify(signInAttempt, null, 2))
            }
        } catch (err) {
            
            console.error(JSON.stringify(err, null, 2))
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {/* Hero Section with Sports Background */}
                    <ImageBackground 
                        source={require("@/assets/images/sports-stadium.jpg")} // Replace with relevant sports arena image
                        className="w-full h-[280px]"
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
                            className="w-full h-full flex justify-end p-6"
                        >
                            <Animatable.View animation="fadeIn" duration={800}>
                                <Text className="text-white text-4xl font-JakartaBold mb-1">Welcome Back!</Text>
                                <Text className="text-white text-xl font-JakartaMedium">Ready to place your bets?</Text>
                            </Animatable.View>
                        </LinearGradient>
                    </ImageBackground>
                    
                    {/* Main Content */}
                    <View className="p-6 bg-white rounded-t-3xl -mt-6">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-black text-2xl font-JakartaBold">Sign In</Text>
                            <View className="flex-row items-center">
                                <Ionicons name="time-outline" size={16} color="#0286FF" />
                                <Text className="text-blue-500 text-xs ml-1 font-JakartaMedium">Live events active</Text>
                            </View>
                        </View>

                        <InputField 
                            label="Email"
                            placeholderTextColor="#A0A0A0" 
                            placeholder="Your email address" 
                            icon={icons.email} 
                            value={form.email} 
                            onChangeText={(value) => setForm({ ...form, email: value })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        
                        <View className="relative">
                            <InputField 
                                label="Password"
                                placeholderTextColor="#A0A0A0" 
                                placeholder="Your password" 
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

                        <Link href="/forgot-password" className='self-end mb-6 mt-1'>
                            <Text className="text-gray-500 text-sm">
                                Forgot password? <Text className="text-[#0286FF] font-JakartaSemiBold">Reset it</Text>
                            </Text>
                        </Link>

                        <CustomButton 
                            title="Log In" 
                            onPress={onSignInPress} 
                            className="bg-[#0286FF]" 
                        />

                        {/* Live Events Preview */}
                        {/* #TODO #TODO #TODO #TODO #TODO #TODO #TODO #TODO #TODO #TODO #TODO #TODO 
                        When we have actual games in database pull games from database to display */}
                        <Animatable.View 
                            animation="fadeInUp" 
                            duration={1000} 
                            delay={300}
                            className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100"
                        >
                            <Text className="text-gray-800 font-JakartaSemiBold text-sm mb-2">
                                Active Games Near You
                            </Text>
                            <View className="flex-row justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                    <Text className="text-gray-700">Basketball: Downtown Arena</Text>
                                </View>
                                <Text className="text-blue-500 font-JakartaMedium">12 bets</Text>
                            </View>
                            <View className="flex-row justify-between mt-2">
                                <View className="flex-row items-center">
                                    <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                    <Text className="text-gray-700">Soccer: Riverside Field</Text>
                                </View>
                                <Text className="text-blue-500 font-JakartaMedium">8 bets</Text>
                            </View>
                            <TouchableOpacity className="mt-3">
                                <Text className="text-[#0286FF] text-center font-JakartaSemiBold text-sm">
                                    Sign in to view all events →
                                </Text>
                            </TouchableOpacity>
                        </Animatable.View>

                        <OAuth />

                        <Link href="/(auth)/sign-up" className='mt-6 mb-8'>
                            <Text className="text-center text-gray-600">
                                Don't have an account? <Text className="text-[#0286FF] font-JakartaBold">Sign Up</Text>
                            </Text>
                        </Link>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default SignIn;