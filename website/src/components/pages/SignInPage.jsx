import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const SignInPage = () => {
  return (
    <div className="sign-in-container">
      <SignIn />
    </div>
  );
};

export default SignInPage;