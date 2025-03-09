import React, { useEffect, useState } from 'react'
import Sidebar from "./sidebar"
import { FaBars, FaUserAlt } from "react-icons/fa";
import { BsFillGrid3X3GapFill } from 'react-icons/bs';
import { Link, useNavigate } from "react-router-dom"
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children, setMenuOpen, menuOpen, isBtn, setIsBtn }) => {
    const navigate = useNavigate()
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (windowWidth < 768) {
            setIsBtn(true)
        } else {
            setIsBtn(false)
        }
    }, [windowWidth, setMenuOpen]);

    // New function to handle agent navigation
    const handleAgentClick = () => {
        navigate('/home/agent');
    };

    return (
        <div className='flex bg-[black] w-screen h-screen'>
            <AnimatePresence>
                {(menuOpen || !isBtn) && (
                    <motion.div
                        initial={{ x: -300, height: "100vh", zIndex: 10 }}
                        animate={{ x: 0, height: "100vh", zIndex: 10 }}
                        exit={{ x: -300, height: "100vh", zIndex: 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Sidebar isBtn={isBtn} setMenuOpen={setMenuOpen} menuOpen={menuOpen} />
                    </motion.div>
                )}
            </AnimatePresence>
            {(isBtn && !menuOpen) && (
                <Button size="icon" className="border hover:border-[#a854f7]  rounded-full bg-transparent text-white shadow-none mt-4 ml-2 fixed z-10" onClick={() => setMenuOpen(true)}>
                    <FaBars />
                </Button>
            )}
            <div className="flex-1 dark:bg-[#18181c]">
                <div className='md:static fixed z-[2] w-full dark:bg-[#18181c] bg-[#1F2937] flex justify-between items-center py-3 pl-[78px] sm:pr-[40px] pr-[2px]'>
                    <Link to="/home" id='logo' className=' '>
                        <img src="/images/logo.png" alt="" className='object-cover w-fit z-[3]' />
                    </Link>
                    <div className="flex items-center gap-x-4">
                        {/* Agent icon with yellow border (highlighted) */}
                        <div 
                            id='agent-icon' 
                            className='border-[1px] border-yellow-500 p-3 rounded-full cursor-pointer hover:bg-[#2a3649]'
                            onClick={handleAgentClick}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="text-white"
                            >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        
                        {/* User icon */}
                        <div id='icon' className='border-[1px] dark:border-white border-[#34006114] p-3 rounded-full mr-2' >
                            <FaUserAlt className='cursor-pointer text-white' />
                        </div>
                    </div>
                </div>
                <div className="md:pt-0 pt-12">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Layout