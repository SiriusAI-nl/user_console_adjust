import { useState } from "react";
import React from "react";
import Input from "../components/input";
import { FaEyeSlash } from "react-icons/fa";
import { CiUser } from "react-icons/ci";
import { FaEye } from "react-icons/fa";
import { CiLock } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";


export const Login = () => {
  const [showtext, setShowtext] =useState(false);

function handlePassword(){
    setShowtext(!showtext)
  }

  const navigate = useNavigate()

  return (
    <div className="w-full max-h-screen flex">
      <div
        className="w-full bg-white flex flex-col justify-center items-center md:w-[50%] lg:w-[40%]"
        id="leftside"
      >
        <div className="sm-max-screen flex items-center flex-col px-6 justify-center text-center">
          <div className="flex lg:justify-start justify-center items-center mb-[60px] mt-[60px] w-full">
            <img src="./images/Sirius-AI.png" alt="" />
          </div>
          <form onSubmit={(e) => {
            e.preventDefault()
            navigate("/home")
          }} id="form" className="w-full">
            <div className="flex flex-col items-center w-full">
              <h1 className="flex items-center justify-center  text-[#000000] font-Montserrat font-bold md:text-[32px] text-[24px] ">
                Welcome to Sirius AI 👋🏻
              </h1>
              <p className="text-[#666666] flex justify-center font-[400] text-[14px] md:text-[16px] font-Montserrat leading-relaxed mb-[35px]  lg:text-left lg:justify-start w-full">
                Please Log In Your Account
              </p>
              <div className="flex flex-col gap-8 w-full">
           <div id="inputOne" className="border border-1 border-[#34006114] w-full py-[12px] px-[16px]  rounded-[8px] flex gap-[15px] items-center"> 
           <CiUser className="text-2xl text-[#6E7079]" />
            <input type="text" placeholder="Username"  className="font-Montserrat text-[#ACACAC] text-[12px] w-full outline-none"/>
         </div> 
               <div id="inputTwo" className="border border-1 border-[#34006114] w-full py-[12px] px-[16px]  rounded-[8px] justify-between flex gap-[15px] items-center"><div className="flex items-center gap-[15px]"><CiLock className="text-2xl text-[#6E7079]"/>
               <input type={showtext? "text" :"password"} placeholder="password"  className="font-Montserrat text-[#ACACAC] text-[12px] w-full outline-none"/></div>
                
              <p onClick={handlePassword}>{showtext? <FaEye className="text-[#34006114]"/>:<FaEyeSlash className="text-[#34006114]"/>}</p> 
              
                </div>
              </div>
            </div>
            <div className="mt-[12px] flex justify-end items-end text-right w-full">
              <h1 className="text-[#340061] flex justify-end items-end font-[400] text-[12px] text-right font-Montserrat w-fit">
                Forgot Password?
              </h1>
            </div>
            <div className="w-full justify-center items-center mt-[30px]">
              {" "}
              <button className="bg-[#340061] px-4 w-full text-[#FFFFFF] font-Montserrat rounded-lg text-[16px] font-semibold flex items-center justify-center py-[13px] gap-2">
                Log in <img src="./public/images/arrow.svg" alt="" />{" "}
              </button>
            </div>
          </form>
          <div className="mt-[20px] flex justify-center items-center text-center">
            <h1 className="font-Montserrat font-[400] text-[#666666]">
              Don’t have an account?
              <Link to="/signup" className="font-Montserrat font-[400] text-black">
                {" "}
                Sign Up
              </Link>
            </h1>
          </div>
        </div>
      </div>

      <div
        className="hidden md:block lg:w-[60%] h-screen bg-cover bg-center bg-no-repeat md:w-[50%]"
        style={{ backgroundImage: "url('./images/hero.jpg')" }}
        id="rightSide"
      ></div>
    </div>
  );
};
