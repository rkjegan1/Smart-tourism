import { useState, useRef, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import RecommendPage from './pages/RecommendPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import LoginPage from './pages/LoginPage';
import ArchitecturePage from './pages/ArchitecturePage';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const userEmail = user?.email?.trim().toLowerCase();
  const isArchitectureAdmin =
    userEmail === 'rkjegan5@gamil.com' || userEmail === 'rkjegan5@gmail.com';

  const [theme, setTheme] = useState(() => localStorage.getItem('smart-tourism-theme') || 'light');
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  /* ─── Toast helpers ─── */
  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    addToast('You have been signed out.', 'info');
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('smart-tourism-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <Layout
              user={user}
              onLogout={handleLogout}
              toasts={toasts}
              dismissToast={dismissToast}
              theme={theme}
              onThemeChange={setTheme}
              isArchitectureAdmin={isArchitectureAdmin}
            />
          }
        >
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage addToast={addToast} />} />
          <Route path="recommend" element={<RecommendPage addToast={addToast} isArchitectureAdmin={isArchitectureAdmin} />} />
          <Route path="place/:id" element={<PlaceDetailPage addToast={addToast} />} />
          <Route path="architecture" element={isArchitectureAdmin ? <ArchitecturePage addToast={addToast} /> : <Navigate to="/" replace />} />
          <Route path="login" element={<LoginPage setUser={setUser} addToast={addToast} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
