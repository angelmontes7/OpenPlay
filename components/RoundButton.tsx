import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type RoundButtonProps = {
    text: string;
    icon: typeof Ionicons.defaultProps;
    onPress?: () => void;
};

const RoundButton = ({text, icon, onPress}: RoundButtonProps) => {
    return (
        <TouchableOpacity className="align-items-center justify-center gap-3" onPress={onPress}>
            <View className="h-20 w-20 rounded-full bg-gray-100 justify-center items-center">
                <Ionicons name={icon} size={30} color="black" />
            </View>
            <Text className="text-xs font-semibold text-center">{text}</Text>
        </TouchableOpacity>
    )
};

export default RoundButton;