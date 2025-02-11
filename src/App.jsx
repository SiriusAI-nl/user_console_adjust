import './App.css';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import { Login } from './pages/login';
import Signup from './pages/signUp';
import MainPage from './pages/mainPage';
import Home from './pages/home';
import { useState } from 'react';

// ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  return isLoggedIn ? children : <Navigate to="/" />;
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBtn, setIsBtn] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Layout isBtn={isBtn} setIsBtn={setIsBtn} setMenuOpen={setMenuOpen} menuOpen={menuOpen}>
                <Outlet />
              </Layout>
            </ProtectedRoute>
          }
        >
          <Route index element={<MainPage isBtn={isBtn} setIsBtn={setIsBtn} setMenuOpen={setMenuOpen} />} />
          <Route path="main" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
