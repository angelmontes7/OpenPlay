import React from 'react';
import '../../../App.css';
import HeroSection from '../../HeroSection';
import Cards from '../../Cards';
import Footer from '../../Footer';
import { useAuth } from '@clerk/clerk-react'; 
import { Navigate } from 'react-router-dom';

function Home () {
    const { isSignedIn } = useAuth(); // Get authentication status from Clerk

    // Redirect logic based on whether the user is signed in or not
    if (isSignedIn) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <>
            <HeroSection/>
            <Cards/>
            <Footer/>
        </>

    );
}

export default Home;