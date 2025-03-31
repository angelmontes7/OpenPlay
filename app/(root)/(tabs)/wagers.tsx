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

type TabType = "Available" | "Active" | "History" | "Disputes";

const Wagers = () => {
    const { user } = useUser();
    const [dob, setDob] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("Available");
    const [availableWagers, setAvailableWagers] = useState([]);
    const [userWagers, setUserWagers] = useState([])
    const [currentView, setCurrentView] = useState<"list" | "create" | "join">("list");
    const [selectedWager, setSelectedWager] = useState<any>(null);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [courtData, setCourtData] = useState<{ id: string; name: string; distance: number }[]>([]);
    const [balance, setBalance] = useState(0); // Initial balance set to 0
    const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);

    // Fetch user DOB to determine if they could use wagers tab
    useEffect(() => {
      const checkUserDOB = async () => {
          if (!user?.id) return;
          try {
              const response = await fetchAPI(`/(api)/user?clerkId=${user.id}`);
              setDob(response.dob);
              console.log('Fetched user data:', response);
          } catch (error) {
              console.error("Error fetching DOB:", error);
              setError("Error fetching DOB");
          } finally {
              setLoading(false);
          }
      };
      checkUserDOB();
    },[user?.id]);

    // Fetch Balance
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

    // Fetch available wagers (wagers with status "pending" – no clerkId filter)
    const fetchAvailableWagers = async () => {
      try {
          const response = await fetchAPI(`/(api)/wager`, {
              method: "GET",
          });
          
          setAvailableWagers(response);
          
      } catch (error) {
          console.error("Error fetching wagers:", error);
          setError("Error fetching wagers");
      } 
    };

    // Fetch user wagers (using clerkId) – these include wagers the user created or participated in
    const fetchUserWagers = async () => {
      if (!user?.id) return;
      try {
        const response = await fetchAPI(`/(api)/wager?clerkId=${user.id}`, { method: "GET" });
        setUserWagers(response);
      } catch (error) {
        console.error("Error fetching user wagers:", error);
        setError("Error fetching user wagers");
      }
    };
    
    // Initial data fetching
    useEffect(() => {
      fetchAvailableWagers();
    }, []);

    useEffect(() => {
      fetchUserWagers();
    }, [user?.id]);

    useEffect(() => {
      fetchBalance();
    }, [user?.id]);

    // Fetch facilities (sports facilities)
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
    
    // Get user location (to be used to get wagers near them)
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

    // Check if user is under 21 (legal gambling age)
    const isUnder21 = dob ? new Date().getTime() - new Date(dob).getTime() < 21 * 365.25 * 24 * 60 * 60 * 1000: true;
 
    
    const handleJoinWager = (wager: { id: string; team_name: string; base_bet_amount: number }) => {
        setSelectedWager(wager);
        setIsJoinModalVisible(true);
    };

    // Navigation bar
    const renderNavBar = () => {
      const tabs: TabType[] = ["Available", "Active", "History", "Disputes"];
      return (
        <View style={{ flexDirection: "row", justifyContent: "space-around", padding: 16, backgroundColor: "#fff", elevation: 2 }}>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
              <Text style={{ fontSize: 16, fontWeight: activeTab === tab ? "bold" : "normal", color: activeTab === tab ? "#1d2236" : "#666" }}>
                {tab === "Available"
                  ? "Available Wagers"
                  : tab === "Active"
                  ? "Your Active Wagers"
                  : tab === "History"
                  ? "History"
                  : "Disputes"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    };

    // Determine wagers to display based on activeTab
    let displayedWagers: any[] = [];
    if (activeTab === "Available") {
      // Available wagers are those with status pending
      displayedWagers = availableWagers;
    } else {
      // For user wagers, filter by status
      if (activeTab === "Active") {
        displayedWagers = userWagers.filter(
          (wager) => wager.status === "active" || wager.status === "pending"
        );
      } else if (activeTab === "History") {
        displayedWagers = userWagers.filter((wager) => wager.status === "closed");
      } else if (activeTab === "Disputes") {
        displayedWagers = userWagers.filter((wager) => wager.status === "disputed");
      }
    }

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

          {/* Navigation Bar */}
          {renderNavBar()}

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
                    <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
                      {activeTab === "Available"
                        ? "Available Wagers"
                        : activeTab === "Active"
                        ? "Your Active Wagers"
                        : activeTab === "History"
                        ? "History"
                        : "Wager Disputes"}
                    </Text>
                    {displayedWagers.length === 0 ? (
                      <View className="flex items-center justify-center mt-6">
                        <Ionicons name="sad-outline" size={48} color="gray" />
                        <Text className="text-gray-500 mt-2">No Wagers Available</Text>
                      </View>
                    ) : (
                      <FlatList
                        data={displayedWagers}
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
              onCreate={() => {
                setCurrentView("list");
                fetchUserWagers();
                fetchAvailableWagers();
                fetchBalance();
              }}
            />
          )}
            <JoinWagerModal
                visible={isJoinModalVisible}
                selectedWager={selectedWager}
                onClose={() => setIsJoinModalVisible(false)}
                clerkId={user?.id}
                onJoin={() => {
                  setIsJoinModalVisible(false);
                  fetchUserWagers();
                  fetchAvailableWagers();
                  fetchBalance();
                }}
            />
        </SafeAreaView>
      );
};

export default Wagers;