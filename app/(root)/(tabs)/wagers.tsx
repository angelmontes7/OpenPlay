import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Text, View, FlatList, Alert, TouchableOpacity } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { fetchAPI } from "@/lib/fetch";
import CreateWagerModal from "@/components/CreateWagerModal";
import JoinWagerModal from "@/components/JoinWagerModal";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { fetchFacilities } from "@/lib/fetchFacilities";
import { getUserLocation, watchUserLocation } from "@/lib/location";
import { LinearGradient } from "expo-linear-gradient";
import CloseWagerModal from "@/components/CloseWagerModal";
import DisputesModal from "@/components/DisputesModal";
import { set } from "react-hook-form";


type TabType = "Available" | "Active" | "History" | "Disputes";

const Wagers = () => {
    const { user } = useUser();
    const [dob, setDob] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("Available");
    const [availableWagers, setAvailableWagers] = useState([]);
    const [userWagers, setUserWagers] = useState<any[]>([])
    const [currentView, setCurrentView] = useState<"list" | "create" | "join">("list");
    const [selectedWager, setSelectedWager] = useState<any>(null);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [courtData, setCourtData] = useState<{ id: string; name: string; distance: number }[]>([]);
    const [balance, setBalance] = useState(0); // Initial balance set to 0
    const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
    const [isCloseModalVisible, setCloseModalVisible] = useState(false);
    const [isDisputeModalVisible, setDisputeModalVisible] = useState(false);
    

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

    // Fetch wagers the user has created
    const fetchUserCreatedWagers = async () => {
      if (!user?.id) return;
      try {
        const response = await fetchAPI(`/(api)/wager?clerkId=${user.id}`, { method: "GET" });
        return response;
      } catch (error) {
        console.error("Error fetching created wagers:", error);
        setError("Error fetching created wagers");
        return [];
      }
    };

    // Fetch wagers the user has joined (from wager_participants)
    const fetchUserJoinedWagers = async () => {
      if (!user?.id) return;
      try {
        const response = await fetchAPI(`/(api)/wager_participants?clerkId=${user.id}`, { method: "GET" });
        // Normalize the joined wager result so that fields match those from created wagers.
        return response.map((item: any) => ({
          id: item.wager_id, // use wager_id as the wager identifier
          creator_id: item.creator_id,
          sports_facility_id: item.sports_facility_id,
          base_bet_amount: item.base_bet_amount,
          total_amount: item.total_amount,
          status: item.wager_status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          amount_of_participants: item.amount_of_participants,
          // Joined flag
          joined: true,
          // Include Participant details
          participant_details: {
            participant_id: item.user_id,
            team_name: item.team_name,
            bet_amount: item.bet_amount,
            joined_at: item.joined_at,
          }
        }));
      } catch (error) {
        console.error("Error fetching joined wagers:", error);
        setError("Error fetching joined wagers");
        return [];
      }
    };

    // Combine both created and joined wagers into a single userWagers list
    const fetchUserWagers = async () => {
      if (!user?.id) return;
      try {
        const [created, joined] = await Promise.all([
          fetchUserCreatedWagers(),
          fetchUserJoinedWagers()
        ]);
        // Combine the created and joined wagers
        const combinedWagers = [...(created || []), ...(joined || [])];

        // Filter out duplicate wagers based on the wager ID
        const uniqueWagers = combinedWagers.filter(
          (wager, index, self) =>
            index === self.findIndex((w) => w.id === wager.id)
        );

        setUserWagers(uniqueWagers);
      } catch (error) {
        console.error("Error fetching user wagers:", error);
        setError("Error fetching user wagers");
      }
    };

    // Fetch wager details based on wagerId
    const fetchWagerDetails = async (wagerId: string) => {
      try {
        const response = await fetchAPI(`/(api)/wager_info?wagerId=${wagerId}`, { method: "GET" });
        
        // Normalize the wager details and participant information
        return response.map((item: any) => ({
          id: item.wager_id, // use wager_id as the wager identifier
          creator_id: item.creator_id,
          sports_facility_id: item.sports_facility_id,
          base_bet_amount: item.base_bet_amount,
          total_amount: item.total_amount,
          status: item.wager_status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          amount_of_participants: item.amount_of_participants,
          // Include Participant details
          participant_details: {
            participant_id: item.user_id,
            team_name: item.team_name,
            bet_amount: item.bet_amount,
            joined_at: item.joined_at,
            winning_vote: item.winning_vote,
          }
        }));
      } catch (error) {
        console.error("Error fetching wager details:", error);
        setError("Error fetching wager details");
        return [];
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
          const nearbyFacilities = facilities.filter((facility) => Number(facility.distance) <= 10);
          setCourtData(nearbyFacilities)
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
      // Find the wager in userWagers that matches the current wager ID
      const existingWager = userWagers.find((w) => Number(w.id) === Number(wager.id));

      // Extract participant_id if the wager exists
      if (wager.creator_id === user?.id) {
        Alert.alert("Error", "Cannot join your own created wager.");
        return;
      }
      else if (existingWager?.participant_details.participant_id === user?.id){
        Alert.alert("Error", "You have already joined this wager.");
        return;
      }
        setSelectedWager(wager);
        setIsJoinModalVisible(true);
    };

    const handleCloseWager = (wagerDetails: any) => {
      // Find the current user's participant record
      const myRecord = wagerDetails.find(
        (w: any) => w.participant_details.participant_id === user?.id
      );

      // If we found their record and they've already voted...
      if (myRecord && myRecord.participant_details.winning_vote !== null) {
        Alert.alert("You have already voted");
        return;
      }
      setSelectedWager(wagerDetails);
      setCloseModalVisible(true)
    }

    const handleDisputeWager = (wagerDetails: any) => {
      // Find the current user's participant record
      const myRecord = wagerDetails.find(
        (w: any) => w.participant_details.participant_id === user?.id
      );

      // If we found their record and they've already voted...
      if (myRecord && myRecord.participant_details.winning_vote !== null) {
        Alert.alert("You have already voted");
        return;
      }
      setSelectedWager(wagerDetails);
      setDisputeModalVisible(true)
    }

    
    // Navigation Tabs
    const renderTabs = () => {
      const tabs: { key: TabType; label: string; icon: string }[] = [
        { key: "Available", label: "Available", icon: "search-dollar" },
        { key: "Active", label: "Active", icon: "play-circle" },
        { key: "History", label: "History", icon: "history" },
        { key: "Disputes", label: "Disputes", icon: "exclamation-circle" }
      ];
      
      return (
        <View className="flex-row bg-gray-900 mx-4 mt-[-20px] rounded-xl shadow-sm py-2 px-2">
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
      // Available wagers are those with status pending (from availableWagers state)
      displayedWagers = availableWagers;
    } else {
      // For user wagers (created or joined), filter by status
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
      <View className="flex-1 bg-gray-900">
        
        {/* Header with Balance */}
        <LinearGradient
          colors={['#4338ca', '#3b82f6', '#0ea5e9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-5 py-6"
        >
          <View className="flex-row justify-between items-center mb-5 mt-5 p-2 pt-10">
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
                  className="h-14 rounded-xl overflow-hidden m-1"
                  onPress={() => setCurrentView("create")}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="w-full h-full justify-center items-center"
                  >
                    <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                    <Text className="text-white font-bold text-lg mb-1">Create a New Wager</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Description Header */}
                <Text className="text-lg font-bold text-white mt-2 mb-2">
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
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={() => (
                    <View className="items-center justify-center py-12 bg-gray-800/50 rounded-2xl backdrop-blur-sm">
                      <View className="bg-blue-500/20 p-4 rounded-full mb-3">
                        <Ionicons name="search" size={40} color="#60A5FA" />
                      </View>
                      <Text className="text-lg font-bold text-white mb-1">No {activeTab} Wagers Found</Text>
                      <Text className="text-sm text-blue-300/70">Pull down to refresh</Text>
                    </View>
                  )}
                  renderItem={({ item }) => {
                    const facility = courtData.find((court) => Number(court.id) === Number(item.sports_facility_id));
                    const creator = userData.find((user) => user.clerk_id === item.creator_id);

                    return (
                      <View className="overflow-hidden relative mb-5">
                        {/* Background Glow Effect */}
                        <View className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl -z-10" />
                        
                        <View className="bg-gray-800/90 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-lg shadow-blue-900/20">
                          {/* Status Badge - Positioned in top-right corner */}
                          <View className="absolute top-3 right-3 z-10">
                            <View className={`px-3 py-1 rounded-full shadow-md ${getBadgeColor(item.status)}`}>
                              <Text className="text-xs font-bold capitalize">{item.status}</Text>
                            </View>
                          </View>
                          
                          {/* Card Header with Amounts */}
                          <View className="p-4 border-b border-gray-700/50">
                            <View className="flex-row justify-between items-start">
                              <View className="bg-gray-700/50 rounded-xl p-3 flex-1 mr-3">
                                <Text className="text-blue-400 text-xs font-medium mb-1">Bet Amount</Text>
                                <Text className="text-white text-2xl font-bold">${item.base_bet_amount}</Text>
                              </View>
                              <View className="bg-gray-700/50 rounded-xl p-3 flex-1">
                                <Text className="text-blue-400 text-xs font-medium mb-1">Total Pool</Text>
                                <Text className="text-white text-2xl font-bold">${item.total_amount}</Text>
                              </View>
                            </View>
                          </View>
                          
                          {/* Card Body with Details */}
                          <View className="p-4">
                            <View className="space-y-4">
                              {/* Creator Info */}
                              <View className="flex-row items-center">
                                <View className="w-9 h-9 bg-blue-500/20 rounded-full items-center justify-center mr-3">
                                  <Ionicons name="person" size={18} color="#60A5FA" />
                                </View>
                                <View>
                                  <Text className="text-blue-400 text-xs font-medium mb-1">Creator</Text>
                                  <Text className="text-white text-sm font-semibold">
                                    {creator ? creator.username : "Unknown User"}
                                  </Text>
                                </View>
                              </View>
                              
                              {/* Participants Info */}
                              <View className="flex-row items-center">
                                <View className="w-9 h-9 bg-purple-500/20 rounded-full items-center justify-center mr-3">
                                  <Ionicons name="people-outline" size={18} color="#A78BFA" />
                                </View>
                                <View>
                                  <Text className="text-blue-400 text-xs font-medium mb-1">Participants</Text>
                                  <Text className="text-white text-sm font-semibold">
                                    {item.amount_of_participants}
                                  </Text>
                                </View>
                              </View>
                              
                              {/* Location Info */}
                              <View className="flex-row items-center">
                                <View className="w-9 h-9 bg-cyan-500/20 rounded-full items-center justify-center mr-3">
                                  <Ionicons name="location" size={18} color="#22D3EE" />
                                </View>
                                <View>
                                  <Text className="text-blue-400 text-xs font-medium mb-1">Location</Text>
                                  <Text className="text-white text-sm font-semibold">
                                    {facility ? facility.name : "Unknown Location"}
                                  </Text>
                                </View>
                              </View>
                            </View>
                            
                            {/* Action Buttons */}
                            {activeTab === "Available" && (
                              <TouchableOpacity
                                className="mt-5 bg-gray-700 py-3.5 rounded-xl items-center shadow-md shadow-gray-900/30"
                                onPress={() => handleJoinWager(item)}
                              >
                                <Text className="text-white font-bold text-sm">Join Wager</Text>
                              </TouchableOpacity>
                            )}

                            {activeTab === "Active" && (
                              <TouchableOpacity
                                className="mt-5 bg-gray-700 py-3.5 rounded-xl items-center shadow-md shadow-gray-900/30"
                                onPress={async() => {
                                  const wagerDetails = await fetchWagerDetails(item.id);
                                  handleCloseWager(wagerDetails);
                                }}
                              >
                                <Text className="text-white font-bold text-sm">Mark as Finished</Text>
                              </TouchableOpacity>
                            )}

                            {activeTab === "Disputes" && (
                              <TouchableOpacity
                                className="mt-5 bg-gray-700 py-3.5 rounded-xl items-center shadow-md shadow-gray-900/30"
                                onPress={async() => {
                                  const wagerDetails = await fetchWagerDetails(item.id);
                                  handleDisputeWager(wagerDetails);
                                }}
                              >
                                <Text className="text-white font-bold text-sm">Resolve Dispute</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
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
              clerkId={user?.id || ""}
              onJoin={() => {
                setIsJoinModalVisible(false);
                fetchUserWagers();
                fetchAvailableWagers();
                fetchBalance();
              }}
          />
          <CloseWagerModal
            isVisible={isCloseModalVisible}
            onClose={() => setCloseModalVisible(false)}
            selectedWager={selectedWager}
            userId={user?.id || ""}
            onConfirmed={() => {
              setCloseModalVisible(false);
              fetchUserWagers();
              fetchAvailableWagers();
              fetchBalance();
            }}
          />

          <DisputesModal
            isVisible={isDisputeModalVisible}
            onClose={() => setDisputeModalVisible(false)}
            selectedWager={selectedWager}
            userId={user?.id || ""}
            onConfirmed={() => {
              setDisputeModalVisible(false);
              fetchUserWagers();
              fetchAvailableWagers();
              fetchBalance();
            }}
          />
      </View>
    );
};

export default Wagers;