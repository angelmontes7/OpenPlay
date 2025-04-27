import React from 'react'
import '../App.css';
import { Button } from './Button';
import './HeroSection.css';
import { Link } from 'react-router-dom';

function HeroSection() {
    return (
        <div className='hero-container'>
            <video src="/videos/video-1.mp4" autoPlay loop muted />
            <h1>WAGER AGAINST FRIENDS</h1>
            <p>Sign up now to find nearest sports facilities</p>
            <div className='hero-btns'>
                <Link to="/sign-up">
                    <Button className='btns' buttonStyle='btn--outline'  buttonSize='btn-large'>
                        GET STARTED
                    </Button>
                </Link>
                <Button className='btns' buttonStyle='btn--primary'  buttonSize='btn-large'>
                    WATCH TRAILER <i className='far fa-play-circle' />
                </Button>
            </div>
        </div>
    );
}

export default HeroSection;