import React from 'react';
import './Services.css';

export default function Services() {
    const services = [
        {
            title: "Facility Booking",
            description: "Book sports facilities in real-time with location-based search and pricing details.",
            icon: "fa-solid fa-calendar-check",
        },
        {
            title: "Wager Challenges",
            description: "Create or join wager-based challenges with friends and compete for rewards.",
            icon: "fa-solid fa-trophy",
        },
        {
            title: "Sports Events",
            description: "Participate in or attend upcoming sports events and tournaments.",
            icon: "fa-solid fa-flag-checkered",
        },
        {
            title: "Personalized Training",
            description: "Book one-on-one or group training sessions with professional coaches.",
            icon: "fa-solid fa-dumbbell",
        },
        {
            title: "Community Engagement",
            description: "Join chat rooms, forums, and social media groups to connect with other sports enthusiasts.",
            icon: "fa-solid fa-users",
        },
        {
            title: "Equipment Rentals",
            description: "Rent sports equipment directly through the app for your next game or practice.",
            icon: "fa-solid fa-basketball-ball",
        },
        {
            title: "Rewards Program",
            description: "Earn points for bookings and wagers, and redeem them for discounts and exclusive perks.",
            icon: "fa-solid fa-gift",
        },
    ];

    return (
        <div className="services-page">
            <h1 className="services-title">Our Services</h1>
            <div className="services-container">
                {services.map((service, index) => (
                    <div key={index} className="service-card">
                        <i className={`service-icon ${service.icon}`}></i>
                        <h2>{service.title}</h2>
                        <p>{service.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}