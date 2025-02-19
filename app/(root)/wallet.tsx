import { ScrollView, Text, TextInput, View, Modal, Button, Alert } from "react-native";
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
    const [transactions, setTransactions] = useState([]); // State to store transactions
    const [isCardModalVisible, setIsCardModalVisible] = useState(false); // State for card modal visibility
    const [cardNumber, setCardNumber] = useState("");
    const [expiryMonth, setExpiryMonth] = useState("");
    const [expiryYear, setExpiryYear] = useState("");
    const [cvc, setCvc] = useState("");
    const [storedCard, setStoredCard] = useState(null); // State to store the card information
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

        const fetchStoredCard = async () => {
            try {
                const response = await fetchAPI(`/(api)/charge_cards?clerkId=${user?.id}`, {
                    method: "GET",
                });

                if (response.card) {
                    setStoredCard(response.card);
                }
            } catch (error) {
                console.error("Error fetching stored card:", error);
            }
        };

        fetchBalance();
        fetchTransactions();
        fetchStoredCard();
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

    const onWithdraw = async () => {
        try {
            // Fetch the connected account ID from your database
            const accountResponse = await fetchAPI(`/(api)/connected-account?clerkId=${user?.id}`, {
                method: "GET",
            });

            const connectedAccountId = accountResponse.connected_account_id;

            const response = await fetchAPI("/(api)/payout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clerkId: user?.id,
                    amount: parseFloat(amount),
                    destination: connectedAccountId,
                }),
            });

            if (response.payout) {
                setBalance(balance - parseFloat(amount));

                // Store the transaction
                await fetchAPI("/(api)/transactions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        clerkId: user?.id,
                        type: "withdraw",
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

                Alert.alert("Success", "Withdrawal successful.");
            }
        } catch (error) {
            console.error("Error processing withdrawal:", error);
            Alert.alert("Error", "Failed to process withdrawal. Please try again.");
        }
    };

    const onAddCard = () => {  
        setIsCardModalVisible(true);
    };

    const handleAddCard = async () => {
        try {
            const response = await fetchAPI("/(api)/charge_cards", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clerkId: user?.id,
                    cardNumber,
                    expiryMonth,
                    expiryYear,
                    cvc,
                }),
            });

            if (response.card) {
                setStoredCard(response.card);
                setIsCardModalVisible(false);
                Alert.alert("Success", "Card added successfully.");
            }
        } catch (error) {
            console.error("Error adding card:", error);
            Alert.alert("Error", "Failed to add card. Please try again.");
        }
    };

    const onMore = () => {
        if (storedCard) {
            Alert.alert("Stored Card", `Card Number: ${storedCard.card_number}\nExpiry: ${storedCard.expiry_month}/${storedCard.expiry_year}`);
        } else {
            Alert.alert("No Card", "No card stored.");
        }
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
                    <RoundButton icon={"arrow-undo-sharp"} text={"Withdraw"} onPress={onWithdraw} />
                    <RoundButton icon={"card-sharp"} text={"Add Card"} onPress={onAddCard}/>
                    <RoundButton icon={"albums"} text={"More"} onPress={onMore}/>
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

                {/* Modal for adding a card */}
                <Modal
                    visible={isCardModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setIsCardModalVisible(false)}
                >
                    <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                        <View className="bg-white p-5 rounded-lg w-3/4">
                            <Text className="text-lg font-bold mb-4">Add Card</Text>
                            <TextInput
                                className="border p-2 rounded-lg w-full mb-2"
                                placeholder="Card Number"
                                keyboardType="numeric"
                                value={cardNumber}
                                onChangeText={setCardNumber}
                            />
                            <TextInput
                                className="border p-2 rounded-lg w-full mb-2"
                                placeholder="Expiry Month"
                                keyboardType="numeric"
                                value={expiryMonth}
                                onChangeText={setExpiryMonth}
                            />
                            <TextInput
                                className="border p-2 rounded-lg w-full mb-2"
                                placeholder="Expiry Year"
                                keyboardType="numeric"
                                value={expiryYear}
                                onChangeText={setExpiryYear}
                            />
                            <TextInput
                                className="border p-2 rounded-lg w-full mb-2"
                                placeholder="CVC"
                                keyboardType="numeric"
                                value={cvc}
                                onChangeText={setCvc}
                            />
                            <Button title="Add Card" onPress={handleAddCard} />
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </StripeProvider>
    );
};

export default Wallet;