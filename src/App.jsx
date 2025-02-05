import './App.css';
import { BrowserRouter, Outlet, Route, RouterProvider, Routes, createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import { Login } from './pages/login';
import Signup from './pages/signUp';
import Card from './components/card';
import EditSearch from './components/editSearch';
import MainPage from './pages/mainPage';
import Starting from './components/starting';
import Home from './pages/home';
import { useState } from 'react';
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
      const [isBtn, setIsBtn] = useState(false)
  return (
    <BrowserRouter>
      {/* <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme"> */}
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/home' element={<Layout isBtn={isBtn} setIsBtn={setIsBtn} setMenuOpen={setMenuOpen} menuOpen={menuOpen}><Outlet /></Layout>}>
            <Route index element={<MainPage isBtn={isBtn} setIsBtn={setIsBtn} setMenuOpen={setMenuOpen} />} />
            <Route path="main" element={<Home/>} />
          </Route>
        </Routes>
      {/* </ThemeProvider> */}
    </BrowserRouter>
  )

}

export default App
