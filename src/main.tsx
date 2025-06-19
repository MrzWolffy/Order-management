import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { StatusPage } from './StatusPage.tsx';

createRoot(document.getElementById('root')!).render(

  <StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/status" element={<StatusPage />} />
        </Routes>
      </Router>
  </StrictMode>,
)
