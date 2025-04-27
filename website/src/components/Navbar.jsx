import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { useAuth } from '@clerk/clerk-react';
import './Navbar.css';

function Navbar() {
  const { isSignedIn, signOut } = useAuth();
  const [click, setClick] = useState(false)
  const [button, setButton] = useState(true)

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const showButton = () => {
    if (window.innerWidth <=960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  useEffect(() => {
    showButton();
  }, []);

  window.addEventListener('resize', showButton);

  return (
    <>
        <nav className='navbar'>
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                    OpenPlay <i className='fab fa-typo3' />
                </Link>
                <div className='menu-icon' onClick={handleClick}>
                  <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
                </div>
                <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                  {isSignedIn ? (
                    <>
                      <li className="nav-item">
                        <Link to="/dashboard" className="nav-links" onClick={closeMobileMenu}>
                          Dashboard
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/transactions" className="nav-links" onClick={closeMobileMenu}>
                          Transactions
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/profile" className="nav-links" onClick={closeMobileMenu}>
                          Profile
                        </Link>
                      </li>
                      <li className="nav-item">
                        <button className="nav-links-mobile" onClick={() => signOut()}>
                          Sign Out
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="nav-item">
                        <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                          Home
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/services" className="nav-links" onClick={closeMobileMenu}>
                          Services
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/products" className="nav-links" onClick={closeMobileMenu}>
                          Products
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/sign-up" className="nav-links-mobile" onClick={closeMobileMenu}>
                          Sign Up
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
                {button && isSignedIn ? (
                  <button className="btn--outline" onClick={() => signOut()}>
                    Sign Out
                  </button>
                ) : (
                  button && (
                    <Link to="/sign-up">
                      <button className="btn--outline">Sign Up</button>
                    </Link>
                  )
                )}
            </div>
        </nav>
    
    
    </>
  )
}

export default Navbar