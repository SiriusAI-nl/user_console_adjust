import React from 'react'
import Sidebar from "./sidebar"
import { FaUserAlt } from "react-icons/fa";
import { BsFillGrid3X3GapFill } from 'react-icons/bs';
import {Link, useNavigate} from "react-router-dom"

const Layout = ({ children, setMenuOpen, menuOpen }) => {
    const navigate = useNavigate()
    return (
        <div className='flex'>
            <Sidebar setMenuOpen={setMenuOpen} menuOpen={menuOpen} />
            <div className="flex-1 dark:bg-[#18181c] bg-gray-100">
                <div className='w-full dark:bg-[#18181c] bg-gray-100 flex justify-between items-center py-3 pl-[78px] pr-[40px]'>
                    <div id='logo' className=' ' onClick={() => navigate("/home")}>
                        <img src="./images/logo.png" alt="" className='object-cover w-fit' />
                    </div>
                    <div className="flex items-center gap-x-4">
                        <Link to={"/home/main"} className="text-xl"><BsFillGrid3X3GapFill className='text-[#D9D9D9]'/></Link>
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