import { icons } from "@/constants";
import { Tabs } from "expo-router";
import { View, Image, ImageSourcePropType, Animated } from "react-native";

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View className="relative items-center justify-center w-14 h-14">
      {/* Glow effect */}
      <Animated.View 
        className="absolute rounded-full bg-blue-400 w-12 h-12"
        style={{
          shadowColor: "#4FACFE",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
        }}
      />

      {/* Icon container */}
      <Animated.View
        className={`rounded-full w-11 h-11 items-center justify-center ${
          focused ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gray-800"
        }`}
      >
        <Image
          source={source}
          tintColor={focused ? "white" : "#9CA3AF"}
          resizeMode="contain"
          className="w-6 h-6"
        />
      </Animated.View>  
    </View>
  );


const Layout = () => (
  <Tabs
    screenOptions={{
      tabBarActiveTintColor: "white",
      tabBarInactiveTintColor: "#9CA3AF",
      tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: "rgba(17, 24, 39, 0.95)", // Dark background with opacity
        borderRadius: 30,
        overflow: "hidden",
        marginHorizontal: 20,
        marginBottom: 25,
        paddingTop: 15,
        height: 70,
        position: "absolute",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        borderColor: "rgba(99, 102, 241, 0.2)",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 0.9,
        shadowRadius: 15,
        elevation: 10,
        // Frosted glass effect for iOS
        backdropFilter: "blur(10px)",
      },
      headerShown: false,
    }}
  >
    <Tabs.Screen
      name="home"
      options={{
        title: "Home",
        tabBarIcon: ({focused}) => (
          <TabIcon focused={focused} source={icons.home} />
        ),
      }}
    />
    <Tabs.Screen
      name="chat"
      options={{
        title: "Chat",
        tabBarIcon: ({focused}) => (
          <TabIcon focused={focused} source={icons.chat} />
        ),
      }}
    />
    <Tabs.Screen
      name="wagers"
      options={{
        title: "Wager",
        tabBarIcon: ({focused}) => (
          <TabIcon focused={focused} source={icons.wager} />
        ),
      }}
    />
    <Tabs.Screen
      name="profile"
      options={{
        title: "Profile",
        tabBarIcon: ({focused}) => (
          <TabIcon focused={focused} source={icons.profile} />
        ),
      }}
    />
    </Tabs>
);

export default Layout;
