/*import React, { useEffect, useState } from 'react';
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
    
            {/* Modal Overlay for Users Under 21 */
            /*{isUnder21 && (
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

export default Wagers;*/

import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Text, View, FlatList, Alert } from "react-native";
import CustomButton from "@/components/CustomButton";
import { useUser } from "@clerk/clerk-expo";
import { fetchAPI } from "@/lib/fetch";

const Wagers = () => {
    const { user } = useUser();
    const [dob, setDob] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [wagers, setWagers] = useState<any[]>([]);
    const [currentView, setCurrentView] = useState<"list" | "create" | "join">("list"); // Track which view is active
    const [selectedWager, setSelectedWager] = useState<any>(null); // Store wager for joining

    const fetchUserData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetchAPI(`/api/user?clerkId=${user.id}`);
            if (response?.dob) {
                setDob(response.dob);
            } else {
                throw new Error("Invalid user data received");
            }
        } catch (err) {
            setError((err as any).message || "Failed to fetch user data.");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const fetchWagers = useCallback(async () => {
        try {
            const response = await fetchAPI(`/api/wagers`);
            setWagers(response || []);
        } catch (err) {
            console.error("Error fetching wagers:", err);
        }
    }, []);

    useEffect(() => {
        fetchUserData();
        fetchWagers();
    }, [fetchUserData, fetchWagers]);

    const isUnder21 = dob ? new Date().getFullYear() - new Date(dob).getFullYear() < 21 : true;

    const handleJoinWager = async (wager: any) => {
        setSelectedWager(wager);
        setCurrentView("join");
    };

    const handleConfirmJoin = async () => {
        if (!selectedWager) return;
        try {
            await fetchAPI(`/api/wagers/join`, {
                method: "POST",
                body: JSON.stringify({ userId: user?.id, wagerId: selectedWager.id }),
            });
            Alert.alert("Success", "You have joined the wager!");
            fetchWagers();
            setCurrentView("list"); // Return to the main view
        } catch (err) {
            Alert.alert("Error", "Could not join wager.");
        }
    };

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
                <Text className="text-red-500 font-bold">Error: {error}</Text>
                <CustomButton title="Retry" onPress={fetchUserData} className="bg-blue-500 mt-4" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 justify-center items-center">
            {currentView === "list" && (
                <>
                    <Text className="text-lg font-bold">Hello {user?.username}</Text>

                    {!isUnder21 ? (
                        <View className="mt-6 space-y-4 mx-auto w-3/4">
                            <CustomButton title="Create a Wager" onPress={() => setCurrentView("create")} className="bg-green-500" />
                            <Text className="text-lg font-bold mt-4">Available Wagers:</Text>

                            {wagers.length === 0 ? (
                                <Text className="text-gray-500">No wagers available.</Text>
                            ) : (
                                <FlatList
                                    data={wagers}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <View className="bg-gray-100 p-4 rounded-lg mb-2">
                                            <Text className="text-black font-bold">💰 Wager: ${item.amount}</Text>
                                            <Text className="text-gray-600">Participants: {item.participants.length}</Text>
                                            <CustomButton title="Join Wager" onPress={() => handleJoinWager(item)} className="bg-yellow-500 mt-2" />
                                        </View>
                                    )}
                                />
                            )}
                        </View>
                    ) : (
                        <View className="absolute inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
                            <Text className="text-white text-lg font-bold text-center px-4">
                                🚫 You must be 21 or older to access the Wagers tab.
                            </Text>
                        </View>
                    )}
                </>
            )}

            {currentView === "create" && (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-lg font-bold">Create a New Wager</Text>
                    <CustomButton title="Back" onPress={() => setCurrentView("list")} className="bg-red-500 mt-4" />
                    {/* Add your wager creation form here */}
                </View>
            )}

            {currentView === "join" && selectedWager && (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-lg font-bold">Join Wager</Text>
                    <Text className="text-gray-600">Amount: ${selectedWager.amount}</Text>
                    <Text className="text-gray-600">Participants: {selectedWager.participants.length}</Text>
                    <CustomButton title="Confirm Join" onPress={handleConfirmJoin} className="bg-yellow-500 mt-4" />
                    <CustomButton title="Back" onPress={() => setCurrentView("list")} className="bg-red-500 mt-4" />
                </View>
            )}
        </SafeAreaView>
    );
};

export default Wagers;

