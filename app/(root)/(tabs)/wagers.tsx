import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Text, View, FlatList, Alert, TouchableOpacity } from "react-native";
import CustomButton from "@/components/CustomButton";
import { useUser } from "@clerk/clerk-expo";
import { fetchAPI } from "@/lib/fetch";
import CreateWagerModal from "@/components/CreateWagerModal";
import JoinWagerModal from "@/components/JoinWagerModal";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { fetchFacilities } from "@/lib/fetchFacilities";
import { getUserLocation, watchUserLocation } from "@/lib/location";
import { LinearGradient } from "expo-linear-gradient";

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

    const [userData, setUserData] = useState<{ clerk_id: string; username: string }[]>([]);

    const fetchUserData = async () => {
      try {
        const response = await fetchAPI("/(api)/user", {
          method: "GET",
        });

        if (response) {
          setUserData(response);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    useEffect(() => {
      fetchUserData();
    }, []);

    // Fetch user DOB to determine if they could use wagers tab
    useEffect(() => {
      const checkUserDOB = async () => {
          if (!user?.id) return;
          try {
              const response = await fetchAPI(`/(api)/user?clerkId=${user.id}`);
              setDob(response.dob);
              console.log('Fetched user DOB:', response);
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
 
    
    const handleJoinWager = (wager: { id: string; team_name: string; base_bet_amount: number; creator_id: string }) => {
      if (wager.creator_id === user?.id) {
        Alert.alert("Error", "You cannot wager on your own wager.");
        return;
      }
        setSelectedWager(wager);
        setIsJoinModalVisible(true);
    };

    
    // Navigation Tabs
    const renderTabs = () => {
      const tabs: { key: TabType; label: string; icon: string }[] = [
        { key: "Available", label: "Available", icon: "search-dollar" },
        { key: "Active", label: "Active", icon: "play-circle" },
        { key: "History", label: "History", icon: "history" },
        { key: "Disputes", label: "Disputes", icon: "exclamation-circle" }
      ];
      
      return (
        <View className="flex-row bg-white mx-4 mt-[-20px] rounded-xl shadow-sm">
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab.key} 
              className={`flex-1 items-center py-3 px-2 ${activeTab === tab.key ? 'bg-blue-600 rounded-lg mx-1' : ''}`}
              onPress={() => setActiveTab(tab.key)}
            >
              <FontAwesome5 
                name={tab.icon} 
                size={16} 
                color={activeTab === tab.key ? "#FFFFFF" : "#7B8794"} 
              />
              <Text 
                className={`text-xs mt-1 ${activeTab === tab.key ? 'text-white font-medium' : 'text-gray-500'}`}
              >
                {tab.label}
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

    // Get badge color based on status
    const getBadgeColor = (status: string) => {
      switch(status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'active': return 'bg-blue-100 text-blue-800';
        case 'closed': return 'bg-green-100 text-green-800';
        case 'disputed': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
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
            </SafeAreaView>
        );
    }

    // Age restricted view
    if (isUnder21) {
      return (
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-1 items-center justify-center p-6">
            <Ionicons name="shield" size={64} color="#EF4444" />
            <Text className="text-2xl font-bold text-gray-900 mt-4 mb-2">Age Restricted</Text>
            <Text className="text-base text-gray-600 text-center">
              You must be 21 or older to access wagers.
            </Text>
          </View>
        </SafeAreaView>
      );
    }
    
    return (
        <SafeAreaView className="flex-1 bg-gray-100">
          
          {/* Header with Balance */}
          <LinearGradient
            colors={['#3B82F6', '#60A5FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-5 py-6"
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white opacity-80 text-sm mb-1">Welcome, {user?.username}</Text>
                <Text className="text-white text-sm font-medium">Available Balance</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-white text-2xl font-medium mr-1">$</Text>
                <Text className="text-white text-3xl font-bold">{balance}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Navigation Bar */}
          {renderTabs()}

          {currentView === "list" && (
            <>
              <View className="flex-1 p-4">
                
                  {/* Create Wager Button */}
                  <TouchableOpacity
                    className="bg-green-500 flex-row items-center justify-center py-3 rounded-lg mb-4 shadow-sm"
                    onPress={() => setCurrentView("create")}
                  >
                    <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                    <Text className="text-white font-semibold text-base ml-2">Create a New Wager</Text>
                  </TouchableOpacity>

                  {/* Description Header */}
                  <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
                    {activeTab === "Available"
                      ? "Available Wagers"
                      : activeTab === "Active"
                      ? "Your Active Wagers"
                      : activeTab === "History"
                      ? "History"
                      : "Wager Disputes"}
                  </Text>

                  {/* Wagers List */}
                  <FlatList
                    data={displayedWagers}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    ListEmptyComponent={() => (
                      <View className="items-center justify-center py-10">
                        <Ionicons name="search" size={48} color="#A0AEC0" />
                        <Text className="text-base font-medium text-gray-500 mt-3">No {activeTab} Wagers Found</Text>
                        <Text className="text-sm text-gray-400 mt-1">Pull down to refresh</Text>
                      </View>
                    )}
                    renderItem={({ item }) => {
                      const facility = courtData.find((court) => Number(court.id) === Number(item.sports_facility_id));
                      const creator = userData.find((user) => user.clerk_id === item.creator_id); // Find the creator's username
          
                      return (
                        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                          <View className="flex-row justify-between items-start mb-3">
                            <View>
                              <Text className="text-xs text-gray-500 mb-1">Bet Amount</Text>
                              <Text className="text-2xl font-bold text-gray-900">${item.base_bet_amount}</Text>
                            </View>
                            <View>
                              <Text className="text-xs text-gray-500 mb-1">Total Amount</Text>
                              <Text className="text-2xl font-bold text-gray-900">${item.total_amount}</Text>
                            </View>
                            <View>
                              <View className={`px-2 py-1 rounded ${getBadgeColor(item.status)}`}>
                                <Text className="text-xs font-medium capitalize">{item.status}</Text>
                              </View>
                            </View>
                          </View>
                          
                          <Text className="text-xs text-gray-500 mb-1">Creator</Text>
                            <View className="flex-row items-center mb-4">
                              <Ionicons name="person" size={16} color="#718096" />
                              <Text className="text-sm text-gray-600 ml-1">
                                {creator ? creator.username : "Unknown User"}
                              </Text>
                            </View>
                      
                          <Text className="text-xs text-gray-500 mb-1">Amount of Participants</Text>
                          <View className="flex-row items-center mb-4">
                            <Ionicons name="people-outline" size={16} color="#718096" />
                            <Text className="text-sm text-gray-600 ml-1">
                              {item.amount_of_participants}
                            </Text>
                          </View>
                          
                          <Text className="text-xs text-gray-500 mb-1">Location</Text>
                          <View className="flex-row items-center mb-4">
                            <Ionicons name="location" size={16} color="#718096" />
                            <Text className="text-sm text-gray-600 ml-1">
                              {facility ? facility.name : "Unknown Location"}
                            </Text>
                          </View>
                          
                          {activeTab === "Available" && (
                            <TouchableOpacity
                              className="bg-blue-600 py-3 rounded-lg items-center"
                              onPress={() => handleJoinWager(item)}
                            >
                              <Text className="text-white font-semibold text-sm">Join Wager</Text>
                            </TouchableOpacity>
                          )}

                          {activeTab === "Active" && (
                            <TouchableOpacity
                              className="bg-blue-600 py-3 rounded-lg items-center"
                              onPress={() => handleJoinWager(item)}
                            >
                              <Text className="text-white font-semibold text-sm">Finished?</Text>
                            </TouchableOpacity>
                          )}

                          {activeTab === "Disputes" && (
                            <TouchableOpacity
                              className="bg-blue-600 py-3 rounded-lg items-center"
                              onPress={() => handleJoinWager(item)}
                            >
                              <Text className="text-white font-semibold text-sm">Came to an Agreement?</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    }}
                  />
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