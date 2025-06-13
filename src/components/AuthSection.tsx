import googleLogo from "../assets/icons8-google.svg";

interface AuthSectionProps {
  isAuthorized: boolean;
  onAuthClick: () => void;
  onSignoutClick: () => void;
}

export function AuthSection({ isAuthorized, onAuthClick, onSignoutClick }: AuthSectionProps) {
  return (
    <div className="auth-section">
      {!isAuthorized ? (
        <button onClick={onAuthClick} className="auth-btn">
          <img src={googleLogo} className="logo" alt="Google logo" />
          Google Login
        </button>
      ) : (
        <button 
          onClick={onSignoutClick} 
          className="auth-btn" 
          style={{ backgroundColor: '#dc3545', color: 'white' }}
        >
          Logout
        </button>
      )}
    </div>
  );
}