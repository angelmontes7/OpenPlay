import { ScrollView, Text, View } from "react-native";
import RoundButton from "@/components/RoundButton";
const Wallet = () => {
    const balance = 1500;

    const onAddMoney = () => {

    };

    const onWithdraw = () => {

    };

    const onAddCard = () => {  
        
    };
    return (
        <ScrollView className="bg-white">
            <View className="m-80, items-center ">
                <View className="flex-row items-center p-4">
                    <Text className="text-5xl">$</Text>
                    <Text className="font-bold text-6xl">{balance}</Text>
                </View>
            </View>

            <View className="flex-row items-center justify-between p-4">
                <RoundButton icon={'add'} text={'Add funds'} onPress={onAddMoney}/>
                <RoundButton icon={'arrow-undo-sharp'} text={'Withdraw'} onPress={onWithdraw}/>
                <RoundButton icon={'card-sharp'} text={'Add Card'} onPress={onAddCard}/>
                <RoundButton icon={'albums'} text={'More'}/>
                
                
            </View>
        </ScrollView>
    );
};

export default Wallet;