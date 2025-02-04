import React, { useState, useEffect } from "react";
import Input from "../components/input";
import { CiUser } from "react-icons/ci";
import { MdOutlineEmail } from "react-icons/md";
import { CiLock } from "react-icons/ci";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import CircularProgress from "@mui/material/CircularProgress";

const registerApi = import.meta.env.VITE_REGISTER_LOGIN_API;

const SignUp = () => {
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const handleFields = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(form);
    try {
      setLoading(true);
      const response = await axios.post(`${registerApi}register-user`, form);
      if (response.status === 200 || response.statusText === "OK") {
        toast.success("Registration successful");
        setForm({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
        });
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (error) {
      toast.error("Something went wrong . Please try again.");
      setError(error.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const showHandle = () => {
    setShow(!show);
  };
  return (
    <div className="w-full max-h-screen flex">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{
          fontSize: "12px",
        }}
      />
      <div
        className="w-full bg-[#030c1c] flex flex-col justify-center items-center md:w-[50%] lg:w-[40%]"
        id="leftside"
      >
        <div className="sm:max-screen flex items-center flex-col px-6 justify-center text-center lg:w-[80%]">
          <div className="flex lg:justify-start justify-center items-center mb-[25px] md:mb-[60px] mt-[40px] md:mt-[60px] ">
            <img src="./images/Sirius-AI.png" alt="" />
          </div>
          <form id="form" className="w-full" onSubmit={handleSubmit}>
            <div className="flex flex-col items-center w-full">
              <h1 className="w-full flex items-center justify-center  text-gray-300 font-Montserrat font-bold md:text-[32px] text-[24px] lg:justify-start ">
                Get Started 🙋‍♂️
              </h1>
              <p className="text-[#666666] flex justify-center font-[400] text-[14px] md:text-[16px] font-Montserrat leading-relaxed mb-[35px]  lg:text-left lg:justify-start w-full">
                Please Sign up Your Account
              </p>
              <div className="flex flex-col gap-4 w-full">
                <div
                  id="inputOne"
                  className="bg-[#1F2937] border border-1 border-gray-700 hover:border-purple-500 w-full h-[44px] px-[16px]  rounded-[8px] flex gap-[15px] items-center"
                >
                  <CiUser className="text-2xl text-[#ACACAC]" />
                  <input
                    type="text"
                    placeholder="First Name"
                    name="first_name"
                    onChange={handleFields}
                    value={form.first_name}
                    className="font-Montserrat text-[#ACACAC] text-[12px] w-full outline-none bg-[#1F2937]"
                  />
                </div>
                <div
                  id="inputwo"
                  className="bg-[#1F2937] border border-1 border-gray-700 hover:border-purple-500 w-full h-[44px] px-[16px]  rounded-[8px] flex gap-[15px] items-center"
                >
                  <CiUser className="text-2xl text-[#ACACAC]" />
                  <input
                    type="text"
                    placeholder="Last Name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleFields}
                    className="bg-[#1F2937]  font-Montserrat text-[#ACACAC] text-[12px] w-full outline-none"
                  />
                </div>
                <div
                  id="inputhree"
                  className="bg-[#1F2937] border border-1 border-gray-700 hover:border-purple-500 w-full h-[44px] px-[16px]  rounded-[8px] flex gap-[15px] items-center"
                >
                  <MdOutlineEmail className="text-2xl text-[#959292]" />
                  <input
                    required
                    pattern="^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                    type="text"
                    placeholder="Email Address"
                    value={form.email}
                    name="email"
                    onChange={handleFields}
                    className="bg-[#1F2937] font-Montserrat text-[#ACACAC] text-[12px] w-full outline-none"
                  />
                </div>
                <div
                  id="inputfour"
                  className="bg-[#1F2937] border border-gray-700 hover:border-purple-500 w-full h-[44px] px-[16px]  rounded-[8px] flex gap-[15px] items-center"
                >
                  <CiLock className="text-3xl text-[#ACACAC]" />
                  <input
                    type={show ? "text" : "password"}
                    placeholder="Create a Strong Password"
                    value={form.password}
                    name="password"
                    onChange={handleFields}
                    className=" bg-[#1F2937] font-Montserrat text-[#ACACAC] text-[12px] w-full outline-none"
                  />
                  <p onClick={showHandle}>
                    {show ? (
                      <FaEyeSlash className="text-[#ACACAC]" />
                    ) : (
                      <FaEye className="text-[#ACACAC]" />
                    )}
                  </p>
                </div>
              </div>
            </div>
            {/* <div className="mt-[12px] flex justify-end items-end text-right w-full"> 
          <h1 className="text-[#340061] flex justify-end items-end font-[400] text-[12px] text-right font-Montserrat w-fit">
            Forgot Password?
          </h1>
          </div> */}
            <div className="w-full justify-center items-center mt-[30px]">
              {" "}
              <button
                className="bg-purple-500 hover:bg-purple-600 px-4 w-full text-[#FFFFFF] font-Montserrat rounded-lg text-[16px] font-semibold flex items-center justify-center h-[52px] gap-2"
                type="submit"
              >
                Sign up{" "}
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : (
                  <img src="./public/images/arrow.svg" alt="" />
                )}{" "}
              </button>
            </div>
          </form>
          <div className="mt-[20px] flex justify-center items-center text-center">
            <h1 className="font-Montserrat font-[400] text-[#666666]">
              Already have an account?{" "}
              <Link
                to="/"
                className="font-Montserrat font-[400] text-gray-300 hover:text-white"
              >
                {" "}
                Login
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

export default SignUp;
