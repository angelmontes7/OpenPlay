import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Text, View, FlatList, Alert } from "react-native";
import CustomButton from "@/components/CustomButton";
import { useUser } from "@clerk/clerk-expo";
import { fetchAPI } from "@/lib/fetch";
import CreateWagerModal from "@/components/CreateWagerModal";
import { Ionicons } from "@expo/vector-icons";

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
    const [transactions, setTransactions] = useState<{ id: string; type: string; amount: number; date: string }[]>([]);
    const [data, setData] = useState<{ dob: string } | null>(null);
    const [nearbyCourts, setNearbyCourts] = useState<{ id: string; name: string; distance: number }[]>([]);

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
                const response = await fetchAPI(`/(api)/wager`, {
                    method: "GET",
                });

                if (response.wagers) {
                    setWagers(wagers);
                }
            } catch (error) {
                console.error("Error fetching wagers:", error);
                setError("Error fetching wagers");
            }
        }; 

        /*const fetchWagers = async () => {
            try {
                const response = await fetch(`/(api)/wager`);
                const data = await response.json();
                console.log("Fetched Wagers:", data);
                setWagers(data);
            } catch (error) {
                console.error("Error fetching wagers:", error);
            }
        };*/
        
        /*// Pass `fetchWagers` to `CreateWagerModal`
        <CreateWagerModal fetchWagers={fetchWagers} visible={false} onClose={function (): void {
            throw new Error("Function not implemented.");
        } } courts={[]} clerkId={""} onCreate={function (wager: { username: string; amount: string; type: string; court: { id: string; name: string; distance: number; }; }): void {
            throw new Error("Function not implemented.");
        } } />*/


        const filteredCourts = courtData.filter((court) => court.distance <= 7);
        setNearbyCourts(filteredCourts);

        checkUserDOB();
        fetchWagers();
    }, [user?.id]);

    const isUnder21 = dob ? new Date().getTime() - new Date(dob).getTime() < 21 * 365.25 * 24 * 60 * 60 * 1000: true;

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
            setWagers([]);
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

    function handleCreateWager(wager: { username: string; amount: string; court: { id: string; name: string; distance: number; }; }): void {
        throw new Error("Function not implemented.");
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
                                            <Text className="text-gray-600">Participants: {item.participants?.length ?? 0}</Text>
                                            <CustomButton title="Join Wager" onPress={() => handleJoinWager(item)} className="bg-yellow-500 mt-2" />
                                        </View>
                                    )}
                                />
                            )}
                            <View className="p-4">
                                {transactions.length === 0 ? (
                                    <Text className="text-center text-gray-400">No Transactions</Text>
                                ) : (
                                    transactions.map((transaction) => (
                                        <View
                                            key={transaction.id}
                                            className="flex-row items-center justify-between bg-gray-100 p-3 rounded-lg mb-2"
                                        >
                                            <View className="flex-row items-center">
                                                <Ionicons
                                                    name={transaction.type === "add" ? "add-circle" : "remove-circle"}
                                                    size={24}
                                                    color={transaction.type === "add" ? "green" : "red"}
                                                />
                                                <View className="ml-3">
                                                    <Text className="font-semibold">
                                                        {transaction.type === "add" ? "Added Money" : "Withdrew Money"}
                                                    </Text>
                                                    <Text className="text-gray-500 text-xs">{transaction.date}</Text>
                                                </View>
                                            </View>
                                            <Text
                                                className={`font-semibold ${
                                                    transaction.type === "add" ? "text-green-600" : "text-red-600"
                                                }`}
                                            >
                                                {transaction.type === "add" ? `+ $${transaction.amount}` : `- $${transaction.amount}`}
                                            </Text>
                                        </View>
                                    ))
                                )}
                            </View>
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
                    courts={courtData}
                    onClose={() => setCurrentView("list")}
                    onCreate={handleCreateWager}
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