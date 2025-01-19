import React, { useEffect, useState } from 'react'
import Sidebar from "./sidebar"
import { FaBars, FaUserAlt } from "react-icons/fa";
import { BsFillGrid3X3GapFill } from 'react-icons/bs';
import { Link, useNavigate } from "react-router-dom"
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children, setMenuOpen, menuOpen ,isBtn, setIsBtn}) => {
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

    return (
        <div className='flex bg-gray-100 w-screen h-screen'>
            <AnimatePresence>
                {(menuOpen || !isBtn) && (
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Sidebar isBtn={isBtn} setMenuOpen={setMenuOpen} menuOpen={menuOpen} />
                    </motion.div>
                )}
            </AnimatePresence>
            {(isBtn && !menuOpen) && (
                <Button size="icon" className="border rounded-full bg-transparent text-[#340016] shadow-none mt-4 ml-2 fixed z-10" onClick={() => setMenuOpen(true)}>
                    <FaBars/>
                </Button>
            )}
            <div className="flex-1 dark:bg-[#18181c]">
                <div className='w-full dark:bg-[#18181c] bg-gray-100 flex justify-between items-center py-3 pl-[78px] sm:pr-[40px] pr-[2px]'>
                    <Link to="/home" id='logo' className=' '>
                        <img src="./images/logo.png" alt="" className='object-cover w-fit' />
                    </Link>
                    <div className="flex items-center gap-x-4">
                        <Link to={"/home/main"} className="text-xl"><BsFillGrid3X3GapFill className='text-[#D9D9D9]' /></Link>
                        <div id='icon' className='border-[1px] dark:border-white border-[#34006114] p-3 rounded-full' >
                            <FaUserAlt />
                        </div>
                    </div>
                </div>
                {children}
            </div>
        </div>
    )
}

export default Layout