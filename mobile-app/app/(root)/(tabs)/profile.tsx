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

import { fetchAPI } from "@/lib/fetch"
//import { LinearGradient } from "expo-linear-gradient";

const getUserPreferences = async (clerkId) => {
  const data = await fetchAPI(`/api/database/preferences?clerkId=${clerkId}`);
  return data;
};

const updateUserPreferences = async (clerkId, prefs) => {
  const data = await fetchAPI("/api/database/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ clerkId, ...prefs }),
  });

  return data;
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
                const response = await fetchAPI(`/api/database/profile-pic?clerkId=${user?.id}`, {
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
            const response = await fetchAPI("/api/database/profile-pic", {
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
        if (!user?.id) {
          console.error("User ID is missing");
          return;
        }
    
        try {
          const data = await getUserPreferences(user.id);
    
          // Ensure all fields are present in the response
          setIsPrivate(data.is_private ?? false);
          setEmailNotifications(data.email_notifications ?? true);
          setPushNotifications(data.push_notifications ?? false);
          setLocationEnabled(data.location_enabled ?? false);
          setsmsNotifications(data.sms_notifications ?? false);
          setsocialNotifications(data.social_notifications ?? false);
          setgameNotifications(data.game_notifications ?? false);
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
      <ScrollView className="px-4 py-6 bg-gray-900">
        <View className="bg-gray-800/80 border border-gray-700 rounded-2xl p-4 shadow-md shadow-blue-500/10 backdrop-blur-md mb-6">
          <Text className="text-white text-lg font-bold mb-3">Privacy Settings</Text>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-base">Location</Text>
            <Switch
              value={locationEnabled}
              onValueChange={(val) => handlePreferenceToggle("location_enabled", val)}
              thumbColor={locationEnabled ? "#3B82F6" : "#6B7280"}
              trackColor={{ false: "#4B5563", true: "#2563EB" }}
            />
          </View>

          <View className="mb-3">
            <Text className="text-blue-400 text-xs mb-1">Username</Text>
            <Text className="text-white text-base">{user?.username}</Text>
          </View>
          <View className="mb-3">
            <Text className="text-blue-400 text-xs mb-1">Email</Text>
            <Text className="text-white text-base">{user?.primaryEmailAddress?.emailAddress}</Text>
          </View>
          <View>
            <Text className="text-blue-400 text-xs mb-1">Password</Text>
            <Text className="text-white text-base">****</Text>
          </View>

          <CustomButton
            title={isChangingPassword ? "Cancel" : "Change Password"}
            onPress={() => setIsChangingPassword(!isChangingPassword)}
            className="mt-6"
          />
        </View>

        {isChangingPassword && (
          <View className="bg-gray-800/80 border border-gray-700 rounded-2xl p-4 shadow-md shadow-purple-500/10 backdrop-blur-md">
            <Text className="text-white text-lg font-bold mb-3">Update Password</Text>

            <View className="relative mb-4">
              <TextInput
                className="bg-gray-700 text-white p-3 rounded-lg"
                placeholder="Enter old password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!isOldPasswordVisible}
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <TouchableOpacity
                onPress={() => setIsOldPasswordVisible(!isOldPasswordVisible)}
                className="absolute right-3 top-4"
              >
                <Ionicons
                  name={isOldPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            <View className="relative mb-4">
              <TextInput
                className={`p-3 rounded-lg ${errorpassword ? 'bg-red-600/20 border border-red-500' : 'bg-gray-700'}`}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!isNewPasswordVisible}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setErrorPassword(false);
                }}
              />
              <TouchableOpacity
                onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                className="absolute right-3 top-4"
              >
                <Ionicons
                  name={isNewPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            <View className="relative mb-4">
              <TextInput
                className={`p-3 rounded-lg ${errorpassword ? 'bg-red-600/20 border border-red-500' : 'bg-gray-700'}`}
                placeholder="Re-enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!isConfirmNewPasswordVisible}
                value={confirmNewPassword}
                onChangeText={(text) => {
                  setConfirmNewPassword(text);
                  setErrorPassword(false);
                }}
              />
              <TouchableOpacity
                onPress={() => setIsConfirmNewPasswordVisible(!isConfirmNewPasswordVisible)}
                className="absolute right-3 top-4"
              >
                <Ionicons
                  name={isConfirmNewPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {errorpassword && (
              <Text className="text-red-400 text-sm mb-4">
                Passwords do not match.
              </Text>
            )}

            <CustomButton
              title="Submit New Password"
              onPress={() =>
                handlePasswordReset({ newPassword, currentPassword: oldPassword }, confirmNewPassword)
              }
              className="mt-2"
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  case "notifications":
    return (
      <ScrollView className="px-4 py-6 bg-gray-900">
        <View className="bg-gray-800/80 border border-gray-700 rounded-2xl p-5 shadow-md shadow-purple-500/10 backdrop-blur-md">
          <Text className="text-white text-lg font-bold mb-5">Notification Preferences</Text>
  
          {[
            { label: "Email Notifications", value: emailNotifications, key: "email_notifications" },
            { label: "Push Notifications", value: pushNotifications, key: "push_notifications" },
            { label: "SMS Notifications", value: smsNotifications, key: "sms_notifications" },
            { label: "Social Notifications", value: socialNotifications, key: "social_notifications" },
            { label: "Game Notifications", value: gameNotifications, key: "game_notifications" },
          ].map(({ label, value, key }) => (
            <View
              key={key}
              className="flex-row justify-between items-center mb-4 border-b border-gray-700 pb-3"
            >
              <Text className="text-white text-base">{label}</Text>
              <Switch
                value={value}
                onValueChange={(val) => handlePreferenceToggle(key, val)}
                thumbColor={value ? "#3B82F6" : "#6B7280"}
                trackColor={{ false: "#4B5563", true: "#2563EB" }}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    );
  
    case "support":
        return (
          <ScrollView className="p-4 space-y-6 bg-gray-900">
            {/* FAQs Section */}
            <View className="bg-gray-800/90 backdrop-blur-md rounded-2xl border border-gray-700/50 p-4">
              <Text className="text-white text-xl font-bold mb-4">FAQs</Text>
              {[
                { question: "How do I reset my password?", answer: "Go to Settings > Privacy and click 'Change Password'." },
                { question: "How can I contact support?", answer: "You can email us at support@openplay.com." },
                { question: "Where can I find OpenPlay’s Terms of Service?", answer: "Check our website at www.openplay.com/terms." }
              ].map((faq, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => Alert.alert(faq.question, faq.answer)}
                  className="mb-4"
                >
                  <View className="bg-gray-700/60 p-3 rounded-xl">
                    <Text className="text-white font-semibold text-base">{faq.question}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
      
            {/* Contact Us */}
            <View className="bg-gray-800/90 backdrop-blur-md rounded-2xl border border-gray-700/50 p-4">
              <Text className="text-white text-xl font-bold mb-3">Contact Us</Text>
              <Text className="text-blue-400 text-base">📩 support@openplay.com</Text>
            </View>
      
            {/* Socials Section */}
            <View className="bg-gray-800/90 backdrop-blur-md rounded-2xl border border-gray-700/50 p-4">
              <Text className="text-white text-xl font-bold mb-3">Socials</Text>
              <View className="flex-row justify-around items-center mt-2">
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
            </View>
      
            {/* Community Forum Button */}
            <View className="items-center mt-4">
              <CustomButton
                title="Join Community Forum"
                onPress={() => Linking.openURL("https://community.openplay.com")}
                className="w-full"
              />
            </View>
          </ScrollView>
        );
      
        default:
            return (
                <View className="mt-6 mx-6 bg-gray-800/90 backdrop-blur-md p-4 rounded-2xl border border-gray-700/50 shadow-md shadow-blue-900/10">
                    {[
                        { title: "Wallet", route: "/wallet", isExternal: true },
                        { title: "Privacy", route: "privacy" },
                        { title: "Notifications", route: "notifications" },
                        { title: "Support", route: "support" },
                    ].map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => item.isExternal ? router.push(item.route as any) : setActiveSection(item.route)}
                            className="flex-row justify-between items-center py-4 border-b border-gray-700"
                        >
                            <Text className="text-white text-base font-medium">{item.title}</Text>
                            <Image source={icons.arrowDown} className="w-5 h-5" />
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }
    };

    return (
        <View className="flex-1 bg-gray-900 pt-12">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4">
                {/* Back Button for Subsections */}
                {activeSection !== "profile" && (
                    <TouchableOpacity onPress={() => setActiveSection("profile")} className="flex-row items-center">
                        <Text className="text-white text-lg font-Jakarta">&lt; {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</Text>
                    </TouchableOpacity>
                )}
                {/* Username */}
                <View className="items-center justify-center w-full">
                {activeSection === "profile" && <Text className="text-white text-2xl font-JakartaBold">OpenPlay</Text>}
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Profile Section (Only visible if activeSection is "profile") */}
                {activeSection === "profile" && (
                    <View className="items-center mt-5">
                        <TouchableOpacity onPress={pickImage}>
                            <Image source={{ uri: profilePic }} className="w-28 h-28 rounded-full border-2 border-gray-300" />
                        </TouchableOpacity>
                        <Text className="text-white text-md font-JakartaSemiBold mt-2">{user?.username}</Text>
                        <Text className="text-gray-400 text-sm">Member since {user?.createdAt?.getFullYear()}</Text>
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