import React, { useState } from "react";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import "./AuthStyles.css";

export default function AuthContainer() {
  const [isSignup, setIsSignup] = useState(false);

  const toggleMode = () => setIsSignup(!isSignup);

  return (
    <div className={`container ${isSignup ? "signup-mode" : ""}`}>      
      <LoginPage toggle={toggleMode} />
      <SignupPage toggle={toggleMode} />
      <div className="image-box"></div>
    </div>
  );
}
