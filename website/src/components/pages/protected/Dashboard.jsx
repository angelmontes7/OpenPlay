import React from 'react';
import '../../../App.css';
import { useAuth } from '@clerk/clerk-react'; 
import { Navigate } from 'react-router-dom'; 

function Dashboard() {
    const { isSignedIn } = useAuth(); // Get authentication status from Clerk

    // If the user is not signed in, redirect them to the sign-in page
    if (!isSignedIn) {
        return <Navigate to="/sign-in" />;
    }

    return (
        <div>
            <h1>Welcome to your Dashboard!</h1>
            
        </div>
    );
}

export default Dashboard;
