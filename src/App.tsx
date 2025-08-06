import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useShallow } from 'zustand/react/shallow'; // NEW: Use zustand's shallow comparison
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import EstimatesPage from './pages/EstimatesPage';
import ConsultationPage from './pages/ConsultationPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import ConsultantDashboardPage from './pages/ConsultantDashboardPage';
import ConsultantChatPage from './pages/ConsultantChatPage';
import NotFoundPage from './pages/NotFoundPage'; // NEW: Import NotFoundPage
import { useEffect, useState } from 'react';
import { connectSocket, disconnectSocket } from './services/chatAPI'; // NEW: Import socket functions

function App() {
  const { isAuthenticated, user } = useAuthStore(
    useShallow((state) => ({ isAuthenticated: state.isAuthenticated, user: state.user }))
  );
  
  // Use a local state to check if zustand has hydrated the store
  const [hasHydrated, setHasHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    // Listen for hydration state changes
    const unsub = useAuthStore.persist.onHydrate(() => setHasHydrated(false));
    const unsubFinish = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
    return () => {
      unsub();
      unsubFinish();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      // Disconnect socket when not authenticated (e.g. after manual logout)
      // Note: the store's logout action already calls this, but this is a safeguard
      disconnectSocket();
    }
  }, [isAuthenticated]);

  if (!hasHydrated) {
    // Show a loading screen until the store has finished hydrating
    return <div className="flex h-screen items-center justify-center text-lg">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Routes for authenticated users
  if (user?.role === 'CONSULTANT') {
    return (
      <Layout>
        <Routes>
          <Route path="/consultant-dashboard" element={<ConsultantDashboardPage />} />
          <Route path="/consultation" element={<ConsultationPage />} />
          <Route path="/chat/:consultationId" element={<ConsultantChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/estimates" element={<EstimatesPage />} />
        <Route path="/consultation" element={<ConsultationPage />} />
        <Route path="/chat/:consultationId" element={<ConsultantChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;