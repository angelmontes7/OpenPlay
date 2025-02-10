import { ScrollView, Text, View, Image, Alert, TouchableOpacity } from "react-native";
import { images, icons } from "@/constants";
import { useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import { ReactNativeModal } from "react-native-modal";
import * as ImagePicker from "expo-image-picker";

const Profile = () => {
    const { user } = useUser();
    const { signOut } = useAuth();
    const router = useRouter();

    const [profilePic, setProfilePic] = useState(user?.imageUrl || images.defaultProfile);
    const [showModal, setShowModal] = useState(false);
    const [activeSection, setActiveSection] = useState("profile"); // Track which section is active

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

    const renderContent = () => {
        switch (activeSection) {
            case "privacy":
                return <Text className="text-lg font-Jakarta p-4">Privacy Settings: Manage data sharing, account visibility, etc.</Text>;
            case "notifications":
                return <Text className="text-lg font-Jakarta p-4">Notification Settings: Adjust email, SMS, and push notifications.</Text>;
            case "support":
                return <Text className="text-lg font-Jakarta p-4">Support: Contact us for help or report an issue.</Text>;
            default:
                return (
                    <View className="mt-6 mx-6 bg-gray-100 p-4 rounded-lg">
                        {[
                            { title: "Wallet", route: "/wallet", isExternal: true },
                            { title: "Privacy", route: "privacy" },
                            { title: "Notifications", route: "notifications" },
                            { title: "Support", route: "support" },
                        ].map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => item.isExternal ? router.push(item.route as any) : setActiveSection(item.route)}
                                className="flex-row justify-between items-center py-3 border-b border-gray-300"
                            >
                                <Text className="text-black text-base">{item.title}</Text>
                                <Image source={icons.arrowDown} className="w-5 h-5" />
                            </TouchableOpacity>
                        ))}
                    </View>
                );
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4">
               {/* Back Button for Subsections */}
               {activeSection !== "profile" && (
                    <TouchableOpacity onPress={() => setActiveSection("profile")} className="flex-row items-center">
                        <Text className="text-black text-lg font-Jakarta">&lt; {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</Text>
                    </TouchableOpacity>
                )}
                {/* Username */}
                {activeSection === "profile" && <Text className="text-lg font-JakartaBold">{user?.username}</Text>}
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Profile Section (Only visible if activeSection is "profile") */}
                {activeSection === "profile" && (
                    <View className="items-center mt-5">
                        <TouchableOpacity onPress={pickImage}>
                            <Image source={{ uri: profilePic }} className="w-28 h-28 rounded-full border-2 border-gray-300" />
                        </TouchableOpacity>
                        <Text className="text-black text-lg font-JakartaSemiBold mt-2">{user?.fullName}</Text>
                        <Text className="text-gray-500 text-sm">Member since {user?.createdAt?.getFullYear()}</Text>
                    </View>
                )}

                {/* Dynamic Content for Sections */}
                {renderContent()}

                {/* Action Buttons */}
                <View className="mt-6 space-y-4 mx-auto w-3/4">
                    <CustomButton title="Save Changes" onPress={handleSaveChanges} />
                    <CustomButton
                        title="Log Out"
                        onPress={async () => {
                            try {
                                await signOut();
                                router.replace("/(auth)/sign-in");
                            } catch (error) {
                                Alert.alert("Error", "Failed to log out. Please try again.");
                            }
                        }}
                        className="bg-red-500"
                    />
                </View>

                <ReactNativeModal isVisible={showModal}>
                    <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                        <Image source={images.check} className="w-[110px] mx-auto my-5" />
                        <Text className="text-3xl font-JakartaBold text-center">Profile Updated</Text>
                        <CustomButton title="OK" onPress={() => setShowModal(false)} className="mt-5" />
                    </View>
                </ReactNativeModal>
            </ScrollView>
        </View>
    );
};

export default Profile;
