import * as SecureStore from 'expo-secure-store'
import { TokenCache } from '@clerk/clerk-expo/dist/cache'
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import { fetchAPI } from './fetch';
import * as Linking from "expo-linking";
import * as WebBrowser from 'expo-web-browser';
export const createTokenCache = (): TokenCache => {
    return {
      getToken: async (key: string) => {
        try {
          const item = await SecureStore.getItemAsync(key)
          if (item) {
            console.log(`${key} was used 🔐 \n`)
          } else {
            console.log('No values stored under key: ' + key)
          }
          return item
        } catch (error) {
          console.error('secure store get item error: ', error)
          await SecureStore.deleteItemAsync(key)
          return null
        }
      },
      saveToken: (key: string, token: string) => {
        return SecureStore.setItemAsync(key, token)
      },
    }
  }

export const googleOAuth = async (startOAuthFlow: any) => {
  try {
    const response = await startOAuthFlow({
      redirectUrl: Linking.createURL("/(root)/(tabs)/home"),
    });

    const { createdSessionId, setActive, signUp, signIn } = response;
    
    // If the session is already created, activate it
    if (createdSessionId) {
      await setActive({ session: createdSessionId });
      return {
        success: true,
        code: "session_exists",
        message: "You have successfully signed in with Google",
      };
    }

    if (signUp && signUp.status === "missing_requirements") {
      console.log("Completing missing signup fields...");

      const username = `user_${Math.floor(Math.random() * 1000000)}`;
      const updatedSignUp = await signUp.update({ username });

      if (updatedSignUp.createdUserId) {
        await fetchAPI("/api/database/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: updatedSignUp.username, 
            email: updatedSignUp.emailAddress, 
            clerkId: updatedSignUp.createdUserId, 
          }),
        });
      }

      try {
        const response = await fetchAPI("/api/stripe/connected-account", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                clerkId: updatedSignUp.createdUserId,
                email: updatedSignUp.emailAddress,
            }),
        });

        if (response.onboardingLink) {
        // Open the Stripe onboarding link using Expo's WebBrowser
            await WebBrowser.openBrowserAsync(response.onboardingLink);
        }
      } catch (error) {
          console.error('Error creating connected account', error);
      }

      if (updatedSignUp.createdSessionId) {
        await setActive({ session: updatedSignUp.createdSessionId });
        return {
          success: true,
          code: "session_exists",
          message: "You have successfully signed in with Google",
        };
      } else {
        return {
          success: false,
          message: "Failed to complete signup. Please try again.",
        };
      }
    }

    return {
      success: false,
      message: "An error occurred while signing in with Google",
    };
  } catch (err: any) {
    console.error("Google OAuth Error:", err);
    return {
      success: false,
      code: err.code || "unknown_error",
      message: err?.errors?.[0]?.longMessage || "An error occurred while signing in",
    };
  }
};
