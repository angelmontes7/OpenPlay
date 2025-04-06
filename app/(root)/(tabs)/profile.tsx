import { ScrollView, Text, View, Image, Alert, TouchableOpacity, Switch, TextInput, Linking, KeyboardAvoidingView, Platform } from "react-native";
import { images, icons } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useUser, useAuth, getClerkInstance } from "@clerk/clerk-expo";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import { ReactNativeModal } from "react-native-modal";
import * as ImagePicker from "expo-image-picker";
import { UpdateUserPasswordParams } from "@clerk/types";
import { supabase } from "@/app/(api)/(cloud)/config/initSupabase";
import { fetchAPI } from "@/lib/fetch"

const getUserPreferences = async (clerkId) => {
    const res = await fetch(`/(api)/preferences?clerkId=${clerkId}`);
    if (!res.ok) throw new Error("Failed to fetch preferences");
    return res.json();
  };
  
  const updateUserPreferences = async (clerkId, prefs) => {
    const res = await fetch("/(api)/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clerkId, ...prefs }),
    });
    if (!res.ok) throw new Error("Failed to update preferences");
    return res.json();
  };

const Profile = () => {
    const { user } = useUser();
    const { signOut } = useAuth();
    const router = useRouter();
    const client = getClerkInstance();
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
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [errorpassword, setErrorPassword] = useState(false);
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] = useState(false);

    
    useEffect(() => {
        const fetchProfilePic = async () => {
            try {
                const response = await fetchAPI(`/(api)/update_profile_pic?clerkId=${user?.id}`, {
                    method: "GET",
                });
                if (response && response.profilePicUrl !== undefined) {
                    setProfilePic(response.profilePicUrl);
                }
            } catch (error) {
                console.error("Error fetching profile pic:", error);
            }
        };

        fetchProfilePic();
    }, [user?.id]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets[0]?.uri) {
            const uri = result.assets[0].uri;
            uploadImage(uri);
        } else {
            console.log('No image selected or result.assets[0].uri is undefined');
        }
    };

    const uploadImage = async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();
        const fileName = `public/${Date.now()}.jpg`;
        const { error } = await supabase
            .storage
            .from('profile-pics')
            .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: false });
        if (error) {
            console.error('Error uploading image: ', error);
        } else {
            const uploadedUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pics/${fileName}`;
            setProfilePic(uploadedUrl);
        }
    }

    const saveProfilePicUrl = async (url: string) => {
        try {
            const response = await fetch("/(api)/(database)/update_profile_pic", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clerkId: user?.id,
                    profilePicUrl: url,
                }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to save profile picture URL");
            }
    
            Alert.alert("Success", "Profile picture updated successfully.");
        } catch (error) {
            console.error("Error saving profile picture URL:", error);
            Alert.alert("Error", "Failed to save profile picture URL.");
        }
    };

    useEffect(() => {
        const fetchPreferences = async () => {
          if (!user?.id) return;
          try {
            const data = await getUserPreferences(user.id);
            setIsPrivate(data.is_private);
            setEmailNotifications(data.email_notifications);
            setPushNotifications(data.push_notifications);
            setLocationEnabled(data.location_enabled);
            setsmsNotifications(data.sms_notifications);
            setsocialNotifications(data.social_notifications);
            setgameNotifications(data.game_notifications);
          } catch (error) {
            console.error("Error loading preferences:", error);
          }
        };
        fetchPreferences();
      }, [user?.id]);
    
    const handlePreferenceToggle = (key: string, value: boolean) => {
        const newPrefs = {
          is_private: isPrivate,
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          location_enabled: locationEnabled,
          sms_notifications: smsNotifications,
          social_notifications: socialNotifications,
          game_notifications: gameNotifications,
          [key]: value,
        };
    
        updateUserPreferences(user?.id, newPrefs).catch((err) =>
          console.error("Failed to update preferences", err)
        );
    
        switch (key) {
          case "is_private":
            setIsPrivate(value);
            break;
          case "email_notifications":
            setEmailNotifications(value);
            break;
          case "push_notifications":
            setPushNotifications(value);
            break;
          case "location_enabled":
            setLocationEnabled(value);
            break;
          case "sms_notifications":
            setsmsNotifications(value);
            break;
          case "social_notifications":
            setsocialNotifications(value);
            break;
          case "game_notifications":
            setgameNotifications(value);
            break;
        }
      };

    const handlePasswordReset = async function updatePassword(newPassword: UpdateUserPasswordParams, confirmNewPassword: string) {
        const user = client.user;
        if (newPassword.newPassword !== confirmNewPassword) {
            setErrorPassword(true);
            Alert.alert("Error", "Passwords do not match.");
            return;
        }
        if (newPassword.newPassword.length < 8) {
            Alert.alert("Error", "Password must be at least 8 characters long.");
            return;
        }
        if (user && newPassword.newPassword === confirmNewPassword) {
            setErrorPassword(false);
            try {
                await user.updatePassword(newPassword);
                Alert.alert("Success", "Password updated successfully.");
                setIsChangingPassword(!isChangingPassword); // possibly stopping user from logging in
            } catch (error) {
                Alert.alert("Error", (error as any).message || "Something went wrong.");
            }
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case "privacy":
                return (
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                        <ScrollView className="p-4">
                            <Text className="text-lg font-Jakarta p-4">Privacy Settings: Manage data sharing, account visibility, etc.</Text>;
                            <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                                <Text className="text-black text-base">Location</Text>
                                <Switch value={locationEnabled} onValueChange={(val) => handlePreferenceToggle("location_enabled", val)} />
                            </View>
                            <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                                <Text className="text-black text-base">Username: {user?.username}</Text>
                            </View>
                            <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                                <Text className="text-black text-base">Email: {user?.primaryEmailAddress?.emailAddress}</Text>
                            </View>
                            <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                                <Text className="text-black text-base">Password: {'****'}</Text>
                            </View>
                            <CustomButton
                                title={isChangingPassword ? "Cancel" : "Change Password"}
                                onPress={() => setIsChangingPassword(!isChangingPassword)}
                                className="mt-6 space-y-4 mx-auto w-3/4"
                            />

                            {isChangingPassword && (
                                <>
                                    <ScrollView className="max-h-90">
                                        <View className="relative">
                                            <TextInput
                                                className="border border-gray-300 rounded p-2 mt-3"
                                                placeholder="Enter old password"
                                                secureTextEntry={!isOldPasswordVisible}
                                                value={oldPassword}
                                                onChangeText={setOldPassword}
                                            />
                                            <TouchableOpacity
                                                onPress={() => setIsOldPasswordVisible(!isOldPasswordVisible)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1">
                                                <Ionicons
                                                    name={isOldPasswordVisible ? "eye" : "eye-off"}
                                                    size={20}
                                                    color="gray"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View className="relative">
                                            <TextInput
                                                className={`border rounded p-2 mt-3 ${errorpassword ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="Enter new password"
                                                secureTextEntry={!isNewPasswordVisible}
                                                value={newPassword}
                                                onChangeText={(text) => {
                                                    setNewPassword(text)
                                                    setErrorPassword(false);
                                                }}
                                            />
                                            <TouchableOpacity
                                                onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1">
                                                <Ionicons
                                                    name={isNewPasswordVisible ? "eye" : "eye-off"}
                                                    size={20}
                                                    color="gray"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View className="relative">
                                            <TextInput
                                                className={`border rounded p-2 mt-3 ${errorpassword ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="Re-enter new password"
                                                secureTextEntry={!isConfirmNewPasswordVisible}
                                                value={confirmNewPassword}
                                                onChangeText={(text) => {
                                                    setConfirmNewPassword(text);
                                                    setErrorPassword(false);
                                                }}
                                            />
                                            <TouchableOpacity
                                                onPress={() => setIsConfirmNewPasswordVisible(!isConfirmNewPasswordVisible)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1">
                                                <Ionicons
                                                    name={isConfirmNewPasswordVisible ? "eye" : "eye-off"}
                                                    size={20}
                                                    color="gray"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        {errorpassword && <Text className="text-red-500 text-sm">Passwords do not match.</Text>}
                                        <CustomButton
                                            title="Submit New Password"
                                            onPress={() => handlePasswordReset({ newPassword, currentPassword: oldPassword }, confirmNewPassword)}
                                            className="mt-6 space-y-4 mx-auto w-3/4"
                                        />
                                    </ScrollView>
                                </>
                            )}

                        </ScrollView>
                    </KeyboardAvoidingView>
                );
            case "notifications":
                return (
                    <View className="p-4">
                        <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                            <Text className="text-black text-base">Email Notifications</Text>
                            <Switch value={emailNotifications} onValueChange={(val) => handlePreferenceToggle("email_notifications", val)} />
                        </View>
                        <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                            <Text className="text-black text-base">Push Notifications</Text>
                            <Switch value={pushNotifications} onValueChange={(val) => handlePreferenceToggle("push_notifications", val)} />
                        </View>
                        <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                            <Text className="text-black text-base">SMS Notifications</Text>
                            <Switch value={smsNotifications} onValueChange={(val) => handlePreferenceToggle("sms_notifications", val)} />
                        </View>
                        <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                            <Text className="text-black text-base">Social Notifications</Text>
                            <Switch value={socialNotifications} onValueChange={(val) => handlePreferenceToggle("social_notifications", val)} />
                        </View>
                        <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
                            <Text className="text-black text-base">Game Notifications</Text>
                            <Switch value={gameNotifications} onValueChange={(val) => handlePreferenceToggle("game_notifications", val)} />
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
                                { name: "Instagram", icon: icons.Instagram, link: "https://instagram.com/royalpaisa_" },
                                { name: "Snapchat", icon: icons.snapchat, link: "https://snapchat.com/add/openplay" },
                                { name: "Facebook", icon: icons.facebook, link: "https://facebook.com/openplay" }
                            ].map((social, index) => (
                                <TouchableOpacity key={index} onPress={() => Linking.openURL(social.link)}>
                                    <Image source={social.icon} className="w-10 h-10" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Community Forum Section */}
                        <View className="mt-6 space-y-4 mx-auto w-3/4">
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
                {activeSection === "profile" && <Text className="text-lg font-JakartaBold">OpenPlay</Text>}
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Profile Section (Only visible if activeSection is "profile") */}
                {activeSection === "profile" && (
                    <View className="items-center mt-5">
                        <TouchableOpacity onPress={pickImage}>
                            <Image source={{ uri: profilePic }} className="w-28 h-28 rounded-full border-2 border-gray-300" />
                        </TouchableOpacity>
                        <Text className="text-black text-md font-JakartaSemiBold mt-2">{user?.username}</Text>
                        <Text className="text-gray-500 text-sm">Member since {user?.createdAt?.getFullYear()}</Text>
                    </View>
                )}

                {/* Dynamic Content for Sections */}
                {renderContent()}

                {/* Action Buttons */}
                {activeSection === "profile" && (
                    <View className="mt-6 space-y-4 mx-auto w-3/4">
                        <CustomButton title="Save Changes" onPress={() => saveProfilePicUrl(profilePic)} />
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
                )}

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