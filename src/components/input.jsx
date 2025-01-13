import React from 'react';
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

function Input({leftIcon,rightIcon,placeholder,value,onChange, className,showPass}) {
  console.log(leftIcon,"left icon");
  return (
    <div className={`flex px-4 py-2 border-[1px] border-[#34006114] gap-4 rounded-lg w-full ${className}`}>
        {rightIcon}
        <input type= {showPass ?"text":"password"} placeholder={placeholder} value={value} className='flex h-full flex-1 outline-none font-Montserrat text-[12px] font-[400] text-[#ACACAC] py-[10px]' />
        <div onClick={() => {onChange()}}>
          {showPass ?<FaEye />:<FaEyeSlash />}
        </div>
        
        {/* {rightIcon && <img src={rightIcon} alt="" />} */}
       
 {/* {leftIcon && <img src={leftIcon} alt=" left icon"  className='flex justify-between'/>} */}
 

 
    </div>
  )
}

export default Input;