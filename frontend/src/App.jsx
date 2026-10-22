import { useState, useRef, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import RecommendPage from './pages/RecommendPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import LoginPage from './pages/LoginPage';
import ArchitecturePage from './pages/ArchitecturePage';

export default function App() {
  const [user, setUser] = useState(null);
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
            />
          }
        >
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage addToast={addToast} />} />
          <Route path="recommend" element={<RecommendPage addToast={addToast} />} />
          <Route path="place/:id" element={<PlaceDetailPage addToast={addToast} />} />
          <Route path="architecture" element={<ArchitecturePage addToast={addToast} />} />
          <Route path="login" element={<LoginPage setUser={setUser} addToast={addToast} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
