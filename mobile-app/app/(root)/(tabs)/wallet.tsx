import { ScrollView, Text, View, Alert, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useUser } from "@clerk/clerk-expo";
import { useState } from "react";
import { fetchAPI } from "@/lib/fetch";
import ChargeCardModal from "@/components/ChargeCardModal";
import StoredCardModal from "@/components/StoredCardModal";
import AddFundsModal from "@/components/AddFundsModal";
import WithdrawFundsModal from "@/components/WithdrawFundsModal";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

const Wallet = () => {
    const { user } = useUser();
    const [balance, setBalance] = useState(0); // Initial balance set to 0
    interface Transaction {
        id: string;
        type: string;
        amount: number;
        date: string;
    }

    const [transactions, setTransactions] = useState<Transaction[]>([]); // State to store transactions
    const [isCardModalVisible, setIsCardModalVisible] = useState(false); // State for card modal visibility
    const [isStoredCardModalVisible, setIsStoredCardModalVisible] = useState(false); // State for stored card modal visibility
    const [isAddFundsModalVisible, setIsAddFundsModalVisible] = useState(false); // State for add funds modal visibility
    const [isWithdrawFundsModalVisible, setIsWithdrawFundsModalVisible] = useState(false); // State for withdraw funds modal visibility
    
    //**** WHAT APPEARS WHEN THE WALLET IS OPENED UP ****/
    
    const fetchBalance = async () => {
        try {
            const response = await fetchAPI(`/api/database/balance?clerkId=${user?.id}`, {
                method: "GET",
            });

            if (response.balance !== undefined) {
                setBalance(response.balance);
            }
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await fetchAPI(`/api/database/transactions?clerkId=${user?.id}`, {
                method: "GET",
            });

            if (response.transactions) {
                setTransactions(response.transactions);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    };

        
    
    // Refresh balance and transactions when the Wallet tab is focused
    useFocusEffect(
        React.useCallback(() => {
        fetchBalance();
        fetchTransactions();
        }, [user?.id])
    );

    //**** ADD FUNDS COMPONENTS****//
    const onAddMoney = async () => {
        setIsAddFundsModalVisible(true);
    };

    //**** WITHDRAW FUNDS COMPONENTS****//
    const onWithdraw = async () => {
        setIsWithdrawFundsModalVisible(true);
    };

    //****ADD CARD COMPONENTS****//
    const onAddCard = () => {  
        setIsCardModalVisible(true);
    };

    //****STORED CARDS COMPONENTS****
    const onStoredCards = () => {
        setIsStoredCardModalVisible(true);
    };


    //**** VIEWABLE CONTENT****//
    return (
        <StripeProvider 
          publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
          merchantIdentifier="merchant.com.myapp"
          urlScheme="myapp"
        >
          <View className="flex-1 bg-slate-900">
            {/* Sticky Header Section */}
            <View className="z-20">
            {/* Gradient with Balance */}
            <LinearGradient
                colors={['#4338ca', '#3b82f6', '#0ea5e9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pt-20 pb-20 shadow-lg"
            >
                <Text className="text-blue-100 text-center mb-2 font-medium">Your Balance</Text>
                <View className="flex-row items-center justify-center">
                <Text className="text-white text-4xl font-bold mr-1">$</Text>
                <Text className="text-white text-6xl font-extrabold">{balance}</Text>
                </View>
            </LinearGradient>

            {/* Floating Action Buttons */}
            <View className="px-4 -mt-12 z-10">
                <View className="bg-gray-900 backdrop-blur-lg rounded-3xl p-4 shadow-lg border border-white/5">
                <View className="flex-row justify-between">
                    {/* Add Funds */}
                    <TouchableOpacity className="items-center" onPress={onAddMoney}>
                    <View className="w-14 h-14 rounded-full items-center justify-center mb-2 shadow-lg shadow-blue-500/70">
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </View>
                    <Text className="text-white text-xs font-medium">Add Funds</Text>
                    </TouchableOpacity>

                    {/* Withdraw */}
                    <TouchableOpacity className="items-center" onPress={onWithdraw}>
                    <View className="w-14 h-14 rounded-full items-center justify-center mb-2 shadow-lg shadow-blue-500/70">
                        <Ionicons name="arrow-undo-sharp" size={24} color="#FFFFFF" />
                    </View>
                    <Text className="text-white text-xs font-medium">Withdraw</Text>
                    </TouchableOpacity>

                    {/* Add Card */}
                    <TouchableOpacity className="items-center" onPress={onAddCard}>
                    <View className="w-14 h-14 rounded-full items-center justify-center mb-2 shadow-lg shadow-blue-500/70">
                        <Ionicons name="card-sharp" size={24} color="#FFFFFF" />
                    </View>
                    <Text className="text-white text-xs font-medium">Add Card</Text>
                    </TouchableOpacity>

                    {/* Stored Cards */}
                    <TouchableOpacity className="items-center" onPress={onStoredCards}>
                    <View className="w-14 h-14 rounded-full items-center justify-center mb-2 shadow-lg shadow-blue-500/70">
                        <Ionicons name="albums" size={24} color="#FFFFFF" />
                    </View>
                    <Text className="text-white text-xs font-medium">Cards</Text>
                    </TouchableOpacity>
                </View>
                </View>
            </View>

            {/* Sticky Transactions Header */}
            <View className="px-5 pt-2 pb-2 z-10">
                <View className="flex-row items-center">
                <View className="h-6 w-1.5 bg-blue-500 rounded-full mr-3 shadow-lg shadow-blue-500/50" />
                <Text className="text-xl font-bold text-white">Transactions</Text>
                </View>
            </View>
            </View>

            {/* Scrollable Transaction List */}
            <ScrollView className="flex-1 px-5 pb-8" showsVerticalScrollIndicator={false}>
            {transactions.length === 0 ? (
                <View className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 items-center justify-center border border-white/10 mt-4">
                <View className="w-16 h-16 bg-blue-500/20 rounded-full items-center justify-center mb-3">
                    <Ionicons name="receipt-outline" size={28} color="#60A5FA" />
                </View>
                <Text className="text-white font-semibold text-base">No Transactions Yet</Text>
                <Text className="text-blue-200/70 text-sm text-center mt-1">
                    Transactions will appear here once you start using your wallet
                </Text>
                </View>
            ) : (
                <View className="space-y-3 mt-4">
                {transactions.map((transaction) => (
                    <View
                    key={transaction.id}
                    className="bg-white/10 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-md"
                    >
                    <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center flex-1">
                        <View
                            className={`w-12 h-12 rounded-full items-center justify-center ${
                            transaction.type === "add"
                                ? "bg-green-500/20"
                                : transaction.type === "subtract"
                                ? "bg-red-500/20"
                                : transaction.type === "wager"
                                ? "bg-orange-500/20"
                                : transaction.type === "wager_win"
                                ? "bg-yellow-500/20"
                                : transaction.type === "wager_refund"
                                ? "bg-blue-500/20"
                                : "bg-gray-500/20"
                            }`}
                        >
                            <Ionicons
                            name={
                                transaction.type === "add"
                                ? "add-circle"
                                : transaction.type === "subtract"
                                ? "remove-circle"
                                : transaction.type === "wager"
                                ? "cash-outline"
                                : transaction.type === "wager_win"
                                ? "trophy-outline"
                                : transaction.type === "wager_refund"
                                ? "arrow-redo-outline"
                                : "help-circle-outline"
                            }
                            size={22}
                            color={
                                transaction.type === "add"
                                ? "#4ADE80"
                                : transaction.type === "subtract"
                                ? "#F87171"
                                : transaction.type === "wager"
                                ? "#FDBA74"
                                : transaction.type === "wager_win"
                                ? "#FCD34D"
                                : transaction.type === "wager_refund"
                                ? "#60A5FA"
                                : "#9CA3AF"
                            }
                            />
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className="font-bold text-white">
                            {transaction.type === "add"
                                ? "Added Money"
                                : transaction.type === "subtract"
                                ? "Withdrew Money"
                                : transaction.type === "wager"
                                ? "Wagered Money"
                                : transaction.type === "wager_win"
                                ? "Won Wager"
                                : transaction.type === "wager_refund"
                                ? "Wager Refunded"
                                : "Unknown Transaction"}
                            </Text>
                            <Text className="text-blue-200/70 text-xs">{transaction.date}</Text>
                        </View>
                        </View>
                        <Text
                        className={`font-bold text-lg ${
                            transaction.type === "add" || transaction.type === "wager_win" || transaction.type === "wager_refund"
                            ? "text-green-400"
                            : transaction.type === "subtract" || transaction.type === "wager"
                            ? "text-red-400"
                            : "text-gray-400"
                        }`}
                        >
                        {transaction.type === "add" || transaction.type === "wager_win" || transaction.type === "wager_refund"
                            ? `+$${transaction.amount}`
                            : transaction.type === "subtract" || transaction.type === "wager"
                            ? `-$${transaction.amount}`
                            : `$${transaction.amount}`}
                        </Text>
                    </View>
                    </View>
                ))}
                </View>
            )}
            </ScrollView>
      
            {/* MODALS */}
            <AddFundsModal
              visible={isAddFundsModalVisible}
              onClose={() => {
                setIsAddFundsModalVisible(false);
                fetchBalance();
                fetchTransactions();
                }}
            />
      
            <WithdrawFundsModal
              visible={isWithdrawFundsModalVisible}
              onClose={() => {
                setIsWithdrawFundsModalVisible(false);
                fetchBalance();
                fetchTransactions();
                }}
              availableBalance={balance}
            />
      
            <ChargeCardModal
              visible={isCardModalVisible}
              onClose={() => setIsCardModalVisible(false)}
            />
      
            <StoredCardModal
              visible={isStoredCardModalVisible}
              onClose={() => setIsStoredCardModalVisible(false)}
              clerkId={user?.id || ""}
            />
          </View>
        </StripeProvider>
      );
};

export default Wallet;