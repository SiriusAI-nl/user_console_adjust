import './App.css';
import { BrowserRouter, Outlet, Route, RouterProvider, Routes, createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import {Login} from './pages/login';
import Signup from './pages/signUp';
import Card from './components/card';
import Home from './pages/home';
import EditSearch from './components/editSearch';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login/>} />
      <Route path='/signup' element={<Signup/>} />
      <Route path='/home' element={<Layout><Outlet/></Layout>}>
      <Route index element={<Home/>}/>
      <Route path='editsearch' element={<EditSearch/>}/>
      

      </Route>
    </Routes>
    </BrowserRouter>
  )

}

export default App
