import { ScrollView, Text, View, Image, Alert, TouchableOpacity, Switch, TextInput, Linking } from "react-native";
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
    const [activeSection, setActiveSection] = useState("profile"); //track which section is active
    const [isPrivate, setIsPrivate] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [smsNotifications, setsmsNotifications] = useState(false);
    const [socialNotifications, setsocialNotifications] = useState(false);
    const [gameNotifications, setgameNotifications] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [newPassword, setNewPassword] = useState("");
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

    const handlePasswordChange = () => {
        Alert.alert("Success", "Your password has been updated.");
    };

    const handleSaveChanges = () => {
        //Implement API call to update user profile!!!
        setShowModal(true);
        //Alert.alert("Success", "Your profile has been updated.");
    };

    const renderContent = () => {
        switch (activeSection) {
            case "privacy":
                return (
                    <View className="p-4">
                        <Text className="text-lg font-Jakarta p-4">Privacy Settings: Manage data sharing, account visibility, etc.</Text>;
                        <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                            <Text className="text-black text-base">Make Account Private</Text>
                            <Switch value={isPrivate} onValueChange={setIsPrivate} />
                        </View>
                        <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                            <Text className="text-black text-base">Location</Text>
                            <Switch value={locationEnabled} onValueChange={setLocationEnabled} />
                        </View>
                        <View className="py-3 border-b border-gray-300">
                            <Text className="text-black text-base">Username: {user?.username}</Text>
                        </View>
                        <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                            <Text className="text-black text-base">Password: {'****'}</Text>
                        </View>
                        <CustomButton title="Change Password" onPress={handlePasswordChange} className="mt-6 space-y-4 mx-auto w-3/4" />
                    </View>
                );
            case "notifications":
                return ( 
                    <View className="p-4">
                        <Text className="text-lg font-Jakarta p-4">Notification Settings: Adjust email, SMS, and push notifications.</Text>
                        <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                            <Text className="text-black text-base">Email Notifications</Text>
                            <Switch value={emailNotifications} onValueChange={setEmailNotifications} />
                        </View>
                        <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                            <Text className="text-black text-base">Push Notifications</Text>
                            <Switch value={pushNotifications} onValueChange={setPushNotifications} />
                        </View>
                        <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                            <Text className="text-black text-base">SMS Notifications</Text>
                            <Switch value={smsNotifications} onValueChange={setsmsNotifications} />
                        </View>
                        <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                            <Text className="text-black text-base">Social Notifications</Text>
                            <Switch value={socialNotifications} onValueChange={setsocialNotifications} />
                        </View>
                        <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                            <Text className="text-black text-base">Game Notifications</Text>
                            <Switch value={gameNotifications} onValueChange={setgameNotifications} />
                        </View>
                    </View>
                );
            case "support":
                return (
                    <View className="p-4">
                    <Text className="text-lg font-JakartaBold p-4">FAQs</Text>
                    {[
                        { question: "How do I reset my password?", answer: "Go to Settings > Privacy and click 'Change Password'." },
                        { question: "How can I contact support?", answer: "You can email us at support@openplay.com." },
                        { question: "Where can I find OpenPlay’s Terms of Service?", answer: "Check our website at www.openplay.com/terms." }
                    ].map((faq, index) => (
                        <View key={index} className="py-3 border-b border-gray-300">
                            <TouchableOpacity onPress={() => Alert.alert(faq.question, faq.answer)}>
                                <Text className="text-black text-base font-JakartaSemiBold">{faq.question}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                                <Text className="text-lg font-JakartaBold p-4 mt-4">Contact Us</Text>
                                <Text className="text-black text-base px-4">📩 support@openplay.com</Text>
                    
                                <Text className="text-lg font-JakartaBold p-4 mt-4">Socials</Text>
                                <View className="flex-row justify-around p-4">
                                    {[
                                        { name: "Instagram", icon: icons.instagram, link: "https://instagram.com/openplay" },
                                        { name: "Snapchat", icon: icons.snapchat, link: "https://snapchat.com/add/openplay" },
                                        { name: "Facebook", icon: icons.facebook, link: "https://facebook.com/openplay" }
                                    ].map((social, index) => (
                                        <TouchableOpacity key={index} onPress={() => Linking.openURL(social.link)}>
                                            <Image source={social.icon} className="w-10 h-10" />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                    
                                {/* Community Forum Section */}
                                <View className="p-4 mt-4">
                                    <CustomButton
                                        title="Join Community Forum"
                                        onPress={() => Linking.openURL("https://community.openplay.com")}
                                    />
                                </View>
                            </View>
                );
                
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
                        <Text className="text-black text-md font-JakartaSemiBold mt-2">{user?.primaryEmailAddress?.emailAddress}</Text>
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
                    <View className="bg-white px-7 py-3 rounded-3xl min-h-[300px]">
                        <Image source={images.check} className="w-[px] mx-auto my-2" />
                        <Text className="text-2xl font-JakartaBold text-center">Profile Updated</Text>
                        <CustomButton title="OK" onPress={() => setShowModal(false)} className="mt-5" />
                    </View>
                </ReactNativeModal>
            </ScrollView>
        </View>
    );
};

export default Profile;