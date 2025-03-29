import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Text, View, FlatList, Alert } from "react-native";
import CustomButton from "@/components/CustomButton";
import { useUser } from "@clerk/clerk-expo";
import { fetchAPI } from "@/lib/fetch";
import CreateWagerModal from "@/components/CreateWagerModal";
import { Ionicons } from "@expo/vector-icons";
import { fetchFacilities } from "@/lib/fetchFacilities";
import { getUserLocation, watchUserLocation } from "@/lib/location";

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
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [courtData, setCourtData] = useState<{ id: string; name: string; distance: number }[]>([]);
    
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
                
                setWagers(response);
                
            } catch (error) {
                console.error("Error fetching wagers:", error);
                setError("Error fetching wagers");
            }
        }; 

        checkUserDOB();
        fetchWagers();
    }, [user?.id]);

    useEffect(() => {
        const fetchLocation = async () => {
          const location = await getUserLocation();
          if (location) {
            setLatitude(location.latitude);
            setLongitude(location.longitude);
          }
        };
    
        fetchLocation();
      }, []);
    
      useEffect(() => {
        const subscription = watchUserLocation((location) => {
          setLatitude(location.latitude);
          setLongitude(location.longitude);
        });
    
        return () => {
          subscription?.then((sub) => sub?.remove());
        };
      }, []);
    
      useEffect(() => {
        const fetchData = async () => {
          try {
            const facilities = await fetchFacilities(latitude, longitude);
            setCourtData(facilities);
          } catch (error) {
            setError("Failed to load facilities");
          }
        };
      
        if (latitude && longitude) {
          fetchData();
        }
      }, [latitude, longitude]);

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
                            <View className="p-4">
                                {wagers.length === 0 ? (
                                    <Text className="text-center text-gray-400">No Wagers Available</Text>
                                ) : (
                                    wagers.map((wager) => (
                                    <View
                                        key={wager.id}
                                        className="flex-row items-center justify-between bg-gray-100 p-3 rounded-lg mb-2"
                                    >
                                        <View className="flex-row items-center">
                                        <Ionicons name="cash-outline" size={24} color="green" />
                                        <View className="ml-3">
                                            <Text className="font-semibold">Wager Amount: ${wager.amount}</Text>
                                            <Text className="text-gray-500 text-xs">
                                            Participants: {wager.participants?.length ?? 0}
                                            </Text>
                                        </View>
                                        </View>
                                        <CustomButton
                                        title="Join"
                                        onPress={() => handleJoinWager(wager)}
                                        className="bg-blue-500 px-4 py-2 rounded-lg"
                                        />
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