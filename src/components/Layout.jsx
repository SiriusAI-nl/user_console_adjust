import React from 'react'
import Sidebar from "./sidebar"
import { FaUserAlt } from "react-icons/fa";

const Layout = ({ children, setMenuOpen, menuOpen }) => {
    return (
        <div className='flex'>
            <Sidebar setMenuOpen={setMenuOpen} menuOpen={menuOpen} />
            <div className="flex-1 bg-gray-100">
                <div className='w-full bg-gray-100 flex justify-between items-center py-3 px-4  pl-[60px] pr-[30px]'>
                    <div id='logo' className=' '>
                        <img src="./images/logo.png" alt="" className='object-cover w-fit' />
                    </div>
                    <div id='icon' className='border-[1px] border-[#34006114] p-3 rounded-full' ><FaUserAlt /></div>
                </div>
                {children}
            </div>
        </div>
    )
}

export default Layout