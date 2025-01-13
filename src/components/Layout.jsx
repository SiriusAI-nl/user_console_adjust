import React from 'react'
import Sidebar from "./sidebar"
import { FaUserAlt } from "react-icons/fa";

const Layout = ({ children }) => {
    return (
        <div className='flex'>
            <Sidebar />
            <div className="flex-1">
                <div className='w-full bg-white flex justify-between items-center py-3 px-4 border-b pl-[60px] pr-[30px]'>
                    <div id='logo' className=' '>
                        <img src="./public/images/logo.png" alt="" className='object-cover w-fit' />
                    </div>
                    <div id='icon' className='border-[1px] border-[#34006114] p-3 rounded-full' ><FaUserAlt /></div>
                </div>
                {children}
            </div>
        </div>
    )
}

export default Layout