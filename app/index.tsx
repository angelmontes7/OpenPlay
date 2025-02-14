import { Redirect } from "expo-router";
import { useAuth } from '@clerk/clerk-expo'

const Home = () => {
  
    const { isSignedIn } = useAuth()

    if (isSignedIn) {
      return <Redirect href={'/(root)/(tabs)/profile'} />
    }

    return <Redirect href={"/(auth)/welcome"} />;
        
};

export default Home;