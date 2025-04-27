import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './Products.css';

export default function Products() {
    const apps = [
        {
            name: "OpenPlay",
            description: "Experience OpenPlay on your favorite device",
            appStoreUrl: "https://apps.apple.com/",
            googlePlayUrl: "https://play.google.com/store", 
        },
        {
            name: "RandomApp",
            description: "Discover RandomApp for all your random needs",
            appStoreUrl: "https://apps.apple.com/",
            googlePlayUrl: "https://play.google.com/store",
        },
    ];

    return (
        <div className="products-page">
            {apps.map((app, index) => (
                <div key={index} className="products-card">
                    <div className="products-header">
                        <h1>Download {app.name}</h1>
                        <p>{app.description}</p>
                    </div>
                    
                    <div className="products-content">
                        <div className="download-section">
                            <h2>Scan & Download</h2>
                            <p>Scan the QR code with your phone's camera to download directly from your platform's store.</p>
                            
                            <div className="qr-container">
                                <div className="qr-item">
                                    <div className="qr-frame">
                                        <QRCodeCanvas
                                            value={app.appStoreUrl}
                                            size={160}
                                            bgColor="#ffffff"
                                            fgColor="#000000"
                                            level="H"
                                        />
                                    </div>
                                    <div className="store-badge">
                                        <i className="fa-brands fa-apple"></i>
                                        <span>App Store</span>
                                    </div>
                                </div>
                                
                                <div className="qr-item">
                                    <div className="qr-frame">
                                        <QRCodeCanvas
                                            value={app.googlePlayUrl}
                                            size={160}
                                            bgColor="#ffffff"
                                            fgColor="#000000"
                                            level="H"
                                        />
                                    </div>
                                    <div className="store-badge">
                                        <i className="fa-brands fa-google-play"></i>
                                        <span>Google Play</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="direct-download">
                            <h2>Direct Download Links</h2>
                            <p>Prefer to download directly? Use these links:</p>
                            <div className="download-buttons">
                                <a href={app.appStoreUrl} target="_blank" rel="noopener noreferrer" className="download-button apple">
                                    Download for iOS
                                </a>
                                <a href={app.googlePlayUrl} target="_blank" rel="noopener noreferrer" className="download-button google">
                                    Download for Android
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="products-footer">
                        <p>For help with installation, visit our <a href="#">support page</a></p>
                    </div>
                </div>
            ))}
        </div>
    );
}