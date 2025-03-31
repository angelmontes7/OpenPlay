import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Text, View, FlatList, Alert, TouchableOpacity } from "react-native";
import CustomButton from "@/components/CustomButton";
import { useUser } from "@clerk/clerk-expo";
import { fetchAPI } from "@/lib/fetch";
import CreateWagerModal from "@/components/CreateWagerModal";
import JoinWagerModal from "@/components/JoinWagerModal";
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
    const [balance, setBalance] = useState(0); // Initial balance set to 0
    const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);

    useEffect(() => {
      const fetchBalance = async () => {
          try {
              const response = await fetchAPI(`/(api)/balance?clerkId=${user?.id}`, {
                  method: "GET",
              });

              if (response.balance !== undefined) {
                  setBalance(response.balance);
              }
          } catch (error) {
              console.error("Error fetching balance:", error);
          }
      };

      fetchBalance();
    },[user?.id]);
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
    
    const handleJoinWager = (wager: { id: string; team_name: string; base_bet_amount: number }) => {
        setSelectedWager(wager);
        setIsJoinModalVisible(true);
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
        <SafeAreaView className="flex-1 bg-gray-100">
          <View className="mt-5 items-center">
              <View className="flex-row items-center">
                  <Text className="text-5xl">$</Text>
                  <Text className="font-bold text-6xl">{balance}</Text>
              </View>
          </View>
          {currentView === "list" && (
            <>
              <View className="flex-1 p-4">
                <Text className="text-2xl font-bold text-gray-800">Hello, {user?.username}</Text>
                {!isUnder21 ? (
                  <View className="mt-6 space-y-4">
                    <CustomButton
                      title="Create a Wager"
                      onPress={() => setCurrentView("create")}
                      className="bg-green-500"
                    />
                    <Text className="text-lg font-bold mt-4 text-gray-800">Available Wagers:</Text>
                    {wagers.length === 0 ? (
                      <View className="flex items-center justify-center mt-6">
                        <Ionicons name="sad-outline" size={48} color="gray" />
                        <Text className="text-gray-500 mt-2">No Wagers Available</Text>
                      </View>
                    ) : (
                      <FlatList
                        data={wagers}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingBottom: 200 }} // Add padding to the bottom
                        renderItem={({ item }) => {
                          const facility = courtData.find((court) => Number(court.id) === Number(item.sports_facility_id));
                          return (
                            <View className="bg-white shadow-md rounded-lg p-4 mb-4">
                              <View className="flex-row justify-between items-center">
                                <View>
                                  <Text className="text-lg font-bold text-gray-800">
                                    ${item.base_bet_amount} Wager
                                  </Text>
                                  {facility ? (
                                    <Text className="text-sm text-gray-500">
                                      Facility: {facility.name}
                                    </Text>
                                  ) : (
                                    <Text className="text-sm text-gray-500 text-red-500">
                                      Facility: Unknown
                                    </Text>
                                  )}
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleJoinWager(item)}
                                    className="bg-blue-500 px-10 py-3 rounded-md"
                                    >
                                    <Text className="text-white font-bold text-center">Join</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          );
                        }}
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
              </View>
            </>
          )}
    
          {currentView === "create" && (
            <CreateWagerModal
              visible={currentView === "create"}
              clerkId={user?.id || ""}
              courts={courtData}
              onClose={() => setCurrentView("list")}
              onCreate={() => {}}
            />
          )}
            <JoinWagerModal
                visible={isJoinModalVisible}
                selectedWager={selectedWager}
                onClose={() => setIsJoinModalVisible(false)}
                clerkId={user?.id}
                onJoin={handleJoinWager}
            />
        </SafeAreaView>
      );
};

export default Wagers;