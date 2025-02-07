import { ScrollView, Text, View, Image, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from "react-native";
import { images, icons } from "@/constants";
import InputField from "@/components/InputField";
import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { useUser } from "@clerk/clerk-expo";
import { ReactNativeModal } from "react-native-modal";
import * as ImagePicker from "expo-image-picker";

const Profile = () => {
    const { user } = useUser();
    
    const [form, setForm] = useState({
        name: user?.fullName || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        dob: "",
    });

    const [profilePic, setProfilePic] = useState(user?.imageUrl || images.defaultProfile);
    const [showModal, setShowModal] = useState(false);

    // Function to pick an image from the gallery
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfilePic(result.assets[0].uri);
        }
    };

    const handleSaveChanges = () => {
        // TODO: Implement API call to update user profile
        Alert.alert("Success", "Your profile has been updated.");
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View className="flex-1 items-center mt-5">
                        <TouchableWithoutFeedback onPress={pickImage}>
                            <Image source={{ uri: profilePic }} className="w-32 h-32 rounded-full border-2 border-gray-300" />
                        </TouchableWithoutFeedback>
                        <Text className="text-black text-xl font-JakartaSemiBold mt-3">Edit Profile</Text>
                    </View>

                    <View className="p-5">
                        <InputField 
                            label="Username"
                            placeholderTextColor="#A0A0A0"
                            placeholder="Enter your username" 
                            icon={icons.person} 
                            value={form.name} 
                            onChangeText={(value) => setForm({ ...form, name: value })}
                        />
                        <InputField 
                            label="Email"
                            placeholderTextColor="#A0A0A0" 
                            placeholder="Enter your email" 
                            icon={icons.email} 
                            value={form.email} 
                            editable={false} // Email should not be editable
                        />
                        <InputField 
                            label="DOB"
                            placeholderTextColor="#A0A0A0"
                            placeholder="MM-DD-YYYY" 
                            icon={icons.person} 
                            value={form.dob} 
                            onChangeText={(value) => setForm({ ...form, dob: value })}
                            keyboardType="number-pad"
                        />

                        <CustomButton title="Save Changes" onPress={handleSaveChanges} className="mt-6" />
                    </View>

                    <ReactNativeModal isVisible={showModal}>
                        <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                            <Image source={images.check} className="w-[110px] mx-auto my-5" />
                            <Text className='text-3xl font-JakartaBold text-center'>Profile Updated</Text>
                            <CustomButton 
                                title="OK" 
                                onPress={() => setShowModal(false)} 
                                className='mt-5' />
                        </View>
                    </ReactNativeModal>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default Profile;
