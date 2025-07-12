import googleLogo from "../assets/icons8-google.svg";
import { useEffect } from "react";
import { clearJWT } from "../Api/sheetApi";
interface AuthSectionProps {
  isAuthorized: boolean;
  onAuthClick: () => void;
  onSignoutClick: () => void;
}

export function AuthSection({ isAuthorized, onAuthClick, onSignoutClick }: AuthSectionProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('jwt', token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSignout = () => {
    clearJWT();
    onSignoutClick();
  };

  return (
    <div className="auth-section">
      {!isAuthorized ? (
        <button onClick={onAuthClick} className="auth-btn">
          <img src={googleLogo} className="logo" alt="Google logo" />
          Google Login
        </button>
      ) : (
        <button 
          onClick={handleSignout} 
          className="auth-btn" 
          style={{ backgroundColor: '#dc3545', color: 'white' }}
        >
          Logout
        </button>
      )}
    </div>
  );
}