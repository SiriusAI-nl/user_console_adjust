import './App.css';
import { BrowserRouter, Outlet, Route, RouterProvider, Routes, createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import {Login} from './pages/login';
import Signup from './pages/signUp';
import Card from './components/card';
import Home from './pages/home';
import EditSearch from './components/editSearch';
import MainPage from './pages/mainPage';
import Starting from './components/starting';
import { useState } from 'react';

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login/>} />
      <Route path='/signup' element={<Signup/>} />
      <Route path='/home' element={<Layout setMenuOpen={setMenuOpen} menuOpen={menuOpen}><Outlet/></Layout>}>
      <Route index element={<MainPage setMenuOpen={setMenuOpen}/>}/>
      <Route path='editsearch' element={<EditSearch/>}/>
      <Route path='starting' element={<Starting />}/>
      </Route>
    </Routes>
    </BrowserRouter>
  )

}

export default App
