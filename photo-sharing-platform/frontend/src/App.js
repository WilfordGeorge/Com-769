import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Login from './components/common/Login';
import Register from './components/common/Register';
import Header from './components/common/Header';

// Creator components
import CreatorDashboard from './components/creator/CreatorDashboard';
import UploadPhoto from './components/creator/UploadPhoto';
import MyPhotos from './components/creator/MyPhotos';

// Consumer components
import ConsumerDashboard from './components/consumer/ConsumerDashboard';
import PhotoDetail from './components/consumer/PhotoDetail';

import './styles/App.css';

// Protected route wrapper
const ProtectedRoute = ({ children, requireRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main app routes
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

          {/* Creator routes */}
          <Route
            path="/creator"
            element={
              <ProtectedRoute requireRole="creator">
                <CreatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/upload"
            element={
              <ProtectedRoute requireRole="creator">
                <UploadPhoto />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/my-photos"
            element={
              <ProtectedRoute requireRole="creator">
                <MyPhotos />
              </ProtectedRoute>
            }
          />

          {/* Consumer routes */}
          <Route
            path="/consumer"
            element={
              <ProtectedRoute requireRole="consumer">
                <ConsumerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/photo/:id"
            element={
              <ProtectedRoute requireRole="consumer">
                <PhotoDetail />
              </ProtectedRoute>
            }
          />

          {/* Default redirect based on role */}
          <Route
            path="/"
            element={
              user ? (
                user.role === 'creator' ? (
                  <Navigate to="/creator" replace />
                ) : (
                  <Navigate to="/consumer" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* 404 */}
          <Route path="*" element={<div className="not-found">Page not found</div>} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
