import { Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Swiper from "react-native-swiper";
import { useRef, useState } from "react";
import { onboarding, icons } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { Image } from "react-native";

const Onboarding = () => {
    const swiperRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const isLastSlide = activeIndex === onboarding.length - 1;
    
    return (
        <SafeAreaView className="flex h-full items-center justify-between bg-white">
            <TouchableOpacity 
                onPress={() => {
                    router.replace("/(auth)/sign-up");
                }}
                className="w-full flex justify-end items-end pr-5"
            >
                <Text className="text-black text-md font-JakartaBold">Skip</Text>
            </TouchableOpacity>

            <Swiper
                ref={swiperRef}
                loop={false}
                dot={<View className="w-[32px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />}
                activeDot={<View className="w-[32px] h-[4px] mx-1 bg-[#0286FF] rounded-full" />}
                onIndexChanged={(index) => setActiveIndex(index)}
            >
                {onboarding.map((item, index) => (
                    <View key={index} className="flex flex-col items-center justify-center p-5">
                        <View className="relative w-full items-center">
                            <Image source={item.image} className="w-full h-[300px]" resizeMode="contain" />
                        </View>
                        
                        <View className="flex flex-row items-center justify-center w-full mt-8">
                            <Text className="text-black text-2xl font-bold mx-8 text-center">{item.title}</Text>
                        </View>
                        
                        <Text className="text-md font-JakartaSemiBold text-center text-[#858585] mx-10 mt-3">{item.description}</Text>
                        
                        {/* Feature icons for current slide */}
                        <View className="flex flex-row justify-center mt-6 space-x-8">
                            <View className="flex items-center">
                                <Image source={index === 0 ? icons.map : (index === 1 ? icons.calendar : icons.list)} style={{ width: 22, height: 22 }} tintColor="#0286FF" />
                                <Text className="text-xs text-[#858585] mt-1">{index === 0 ? "Find Games" : (index === 1 ? "Join Matches" : "Organize")}</Text>
                            </View>
                            
                            <View className="flex items-center">
                                <Image source={icons.wager} style={{ width: 22, height: 22 }} tintColor="#0286FF" />
                                <Text className="text-xs text-[#858585] mt-1">Place Bets</Text>
                            </View>
                            
                            <View className="flex items-center">
                                <Image source={icons.dollar} style={{ width: 22, height: 22 }} tintColor="#0286FF" />
                                <Text className="text-xs text-[#858585] mt-1">Win Rewards</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </Swiper>

            <View className="w-full px-5 mb-6 flex items-center">
                <CustomButton 
                    title={isLastSlide ? "Play & Bet Now" : "Next"} 
                    onPress={() => isLastSlide ? router.replace("/(auth)/sign-up") : swiperRef.current?.scrollBy(1)} 
                    className="w-11/12 mt-6" 
                />
            </View>
        </SafeAreaView>
    );
};

export default Onboarding;