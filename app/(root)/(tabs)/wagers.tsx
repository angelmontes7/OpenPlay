import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Text, View, FlatList, Alert } from "react-native";
import CustomButton from "@/components/CustomButton";
import { useUser } from "@clerk/clerk-expo";
import { fetchAPI } from "@/lib/fetch";
import CreateWagerModal from "@/components/CreateWagerModal";

const courtData = [
    { id: '1', name: 'Downtown Basketball Court', distance: 2 },
    { id: '2', name: 'Central Park Tennis Court', distance: 6 },
    { id: '3', name: 'City Soccer Field', distance: 12 },
];

const Wagers = () => {
    const { user } = useUser();
    const [dob, setDob] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [wagers, setWagers] = useState([]);
    const [currentView, setCurrentView] = useState<"list" | "create" | "join">("list");
    const [selectedWager, setSelectedWager] = useState<any>(null);
    const [data, setData] = useState<{ dob: string } | null>(null);

    useEffect(() => {
        const checkUserDOB = async () => {
            if (!user?.id) return;
            try {
                const response = await fetchAPI(`/(api)/user?clerkId=${user.id}`);
                console.log(response);  // Log the response data for debugging
                setData(response);
                setDob(response.dob);
                console.log('Fetched user data:', response);
            } catch (error) {
                console.error("Error fetching DOB:", error);
                setError("Error fetching DOB");
            } finally {
                setLoading(false);
            }
        };

        const fetchWagers = async () => {
            try {
                const response = await fetchAPI(`/(api)/wager?clerkId=${user?.id}`, {
                    method: "GET",
                });

                if (response.wagers) {
                    setWagers(response.wagers);
                }
            } catch (error) {
                console.error("Error fetching wagers:", error);
                setError("Error fetching wagers");
            }
        };

        checkUserDOB();
        fetchWagers();
    }, [user?.id]);

    const isUnder21 = dob ? new Date().getFullYear() - new Date(dob).getFullYear() < 21 : true;

    const fetchUserData = async () => {
        if (!user?.id) return;
        try {
            const response = await fetchAPI(`/(api)/user?clerkId=${user.id}`);
            setData(response);
            setDob(response.dob);
        } catch (error) {
            setError("Error fetching DOB");
        }
    };    
    
    const handleJoinWager = async (wager: any) => {
        setSelectedWager(wager);
        setCurrentView("join");
    };

    const handleConfirmJoin = async () => {
        if (!selectedWager) return;
        try {
            await fetchAPI(`/(api)/wager`, {
                method: "POST",
                body: JSON.stringify({ userId: user?.id, wagerId: selectedWager.id }),
            });
            Alert.alert("Success", "You have joined the wager!");
            fetchWagers();
            setCurrentView("list");
        } catch (err) {
            Alert.alert("Error", "Could not join wager.");
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#1d2236" />
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
                <CreateWagerModal 
                    visible={currentView === "create"}
                    clerkId={user?.id || ""}
                    courtData={courtData}
                    onClose={() => setCurrentView("list")}
                    onCreate={() => fetchWagers()}
                />
            )}

            {currentView === "join" && selectedWager && (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-lg font-bold">Join Wager</Text>
                    <Text className="text-gray-600">Amount: ${selectedWager.amount}</Text>
                    <CustomButton title="Confirm Join" onPress={handleConfirmJoin} className="bg-blue-500 mt-4" />
                    <CustomButton title="Back" onPress={() => setCurrentView("list")} className="bg-red-500 mt-4" />
                </View>
            )}
        </SafeAreaView>
    );
};

export default Wagers;