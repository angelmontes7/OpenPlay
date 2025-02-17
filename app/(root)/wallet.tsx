import { ScrollView, Text, TextInput, View } from "react-native";
import RoundButton from "@/components/RoundButton";
import { Ionicons } from "@expo/vector-icons";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useUser } from "@clerk/clerk-expo";
import Payment from "@/components/Payment";
import { useEffect, useRef, useState } from "react";
import { fetchAPI } from "@/lib/fetch";

const Wallet = () => {
    const { user } = useUser();
    const [balance, setBalance] = useState(0); // Initial balance set to 0
    const amount = 5; // Initial amount set to an empty string
    const [transactions, setTransactions] = useState([]); // State to store transactions
    const paymentRef = useRef(null);

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

        const fetchTransactions = async () => {
            try {
                const response = await fetchAPI(`/(api)/transactions?clerkId=${user?.id}`, {
                    method: "GET",
                });

                if (response.transactions) {
                    setTransactions(response.transactions);
                }
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        };

        fetchBalance();
        fetchTransactions();
    }, [user?.id]);
    
    const onAddMoney = async () => {
        if (paymentRef.current) {
            paymentRef.current.openPaymentSheet();
        }

        try {
            const response = await fetchAPI("/(api)/balance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clerkId: user?.id,
                    amount: parseFloat(amount),
                }),
            });

            if (response.balance) {
                setBalance(response.balance);

                // Store the transaction
                await fetchAPI("/(api)/transactions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        clerkId: user?.id,
                        type: "add",
                        amount: parseFloat(amount),
                    }),
                });

                // Fetch the updated transactions
                const transactionsResponse = await fetchAPI(`/(api)/transactions?clerkId=${user?.id}`, {
                    method: "GET",
                });

                if (transactionsResponse.transactions) {
                    setTransactions(transactionsResponse.transactions);
                }
            }
        } catch (error) {
            console.error("Error updating balance:", error);
        }
    };

    const onWithdraw = () => {

    };

    const onAddCard = () => {  
        
    };

    return (
        <StripeProvider 
            publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
            merchantIdentifier="merchant.com.myapp"
            urlScheme="myapp"
        >
            <ScrollView className="bg-white">
                <View className="mt-5 items-center">
                    <View className="flex-row items-center p-4">
                        <Text className="text-5xl">$</Text>
                        <Text className="font-bold text-6xl">{balance}</Text>
                    </View>
                </View>

                <View className="flex-row items-center justify-between p-2">
                    <RoundButton icon={"add"} text={"Add funds"} onPress={onAddMoney} />
                    <RoundButton icon={"arrow-undo-sharp"} text={"Withdraw"} />
                    <RoundButton icon={"card-sharp"} text={"Add Card"} />
                    <RoundButton icon={"albums"} text={"More"} />
                </View>

                <Text className="font-bold mt-5 ml-3 text-xl">Transactions</Text>

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
                                            {transaction.type === "add" ? "Added Money" : "Withdraw Money"}
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
                <Payment
                    ref={paymentRef}
                    fullName={user?.fullName!} 
                    email={user?.emailAddresses[0].emailAddress!} 
                    amount={amount}                    
                />
            </ScrollView>
        </StripeProvider>
    );
};

export default Wallet;