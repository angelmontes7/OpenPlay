import React, { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Text, View } from "react-native";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { fetchAPI } from "@/lib/fetch";

const Wagers = () => {
    const { user } = useUser();
    const [data, setData] = useState<{ dob: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;

            try {
                const response = await fetchAPI(`/(api)/user?clerkId=${user.id}`);
                setData(response);
            } catch (error) {
                setError((error as any).message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    // Function to calculate age
    const getAge = (dob: string) => {
        const birthDate = new Date(dob); // Date is in YYYY-MM-DD format
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Determine if user is under 21
    const isUnder21 = data?.dob ? getAge(data.dob) < 21 : true; // Default to restricted if DOB is missing

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#00ff00" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center">
                <Text className="text-red-500 font-bold">Error fetching user data.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 justify-center items-center">
            <Text className="text-lg font-bold">Hello {user?.username}</Text>

            <View className="mt-6 space-y-4 mx-auto w-3/4">
                {!isUnder21 ? (
                    <>
                        <CustomButton
                            title="Create a Wager"
                            onPress={() => router.replace("/wagers/create")}
                            className="bg-green-500"
                        />
                        <CustomButton
                            title="Join a Wager"
                            onPress={() => router.replace("/wagers/join")}
                            className="bg-yellow-500"
                        />
                    </>
                ) : null}
            </View>
    
            {/* Modal Overlay for Users Under 21 */}
            {isUnder21 && (
                <View className="absolute inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
                    <View className="w-full h-full flex justify-center items-center">
                        <Text className="text-white text-lg font-bold text-center px-4">
                            🚫 You must be 21 or older to access the Wagers tab.
                        </Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

export default Wagers;
