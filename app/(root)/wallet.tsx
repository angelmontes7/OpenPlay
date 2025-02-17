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
    const [amount, setAmount] = useState(""); // Initial amount set to an empty string
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

        fetchBalance();
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
                    amount: parseFloat(amount), // Amount to add, you can change this as needed
                }),
            });

            if (response.balance) {
                setBalance(response.balance);
            }
        } catch (error) {
            console.error("Error updating balance:", error);
        }
    };


    const onWithdraw = () => {

    };

    const onAddCard = () => {  
        
    };
    const transactions = [
        // TODO: fetch actual customer transactions from database
        // TODO: fetch actual customer transactions from database
        // TODO: fetch actual customer transactions from database
        // TODO: fetch actual customer transactions from database
        { id: 1, type: "add", amount: 50, date: "Feb 14, 2025 - 10:30 AM" },
        { id: 2, type: "withdraw", amount: 20, date: "Feb 13, 2025 - 03:15 PM" },
        { id: 3, type: "add", amount: 100, date: "Feb 12, 2025 - 08:45 AM" },
        { id: 4, type: "withdraw", amount: 30, date: "Feb 11, 2025 - 01:00 PM" },
        { id: 5, type: "withdraw", amount: 20, date: "Feb 13, 2025 - 03:15 PM" },
    ];

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
                    {transactions.map((transaction) => (
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
                    ))}
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