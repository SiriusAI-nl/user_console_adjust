import { useState } from "react";
import React from "react";
import Input from "../components/input";
import { FaEyeSlash } from "react-icons/fa";
import { CiUser } from "react-icons/ci";
import { FaEye } from "react-icons/fa";
import { CiLock } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const loginApi = import.meta.env.VITE_REGISTER_LOGIN_API;

export const Login = () => {
  const [showtext, setShowtext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
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
    navigate("/home");

    console.log(form);
    // try {
    //   setLoading(true);
    //   const response = await axios.post(`${loginApi}login`, form);
    //   localStorage.setItem("IsloggedIn", true);
    //   if (response.status === 200 || response.statusText === "OK") {
    //     toast.success("Login successful");

    //     setTimeout(() => {
    //       setForm({
    //         email: "",
    //         password: "",
    //       });
    //       navigate("/home");
    //     }, 2000);
    //   }
    // } catch (error) {
    //   alert("Login failed. Please try again.");
    //   setError(error.message);
    //   setLoading(false);
    // } finally {
    //   setLoading(false);
    // }
  };

  function handlePassword() {
    setShowtext(!showtext);
  }

  const navigate = useNavigate();

  return (
    <div className="w-full max-h-screen flex">
      <ToastContainer
        position="top-right"
        autoClose={2000}
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
        <div className="sm-max-screen flex items-center flex-col px-6 justify-center text-center">
          <div className="flex lg:justify-start justify-center items-center mb-[60px] mt-[60px] w-full">
            <img src="./images/Sirius-AI.png" alt="" />
          </div>
          <form onSubmit={handleSubmit} id="form" className="w-full">
            <div className="flex flex-col items-center w-full">
              <h1 className="flex items-center justify-center  text-[#FFFFFF] font-Montserrat font-bold md:text-[32px] text-[24px] ">
                Welcome to Sirius AI 👋🏻
              </h1>
              <p className="text-[#666666] flex justify-center font-[400] text-[14px] md:text-[16px] font-Montserrat leading-relaxed mb-[35px]  lg:text-left lg:justify-start w-full">
                Please Log In Your Account
              </p>
              <div className="flex flex-col gap-8 w-full">
                <div
                  id="inputOne"
                  className="border border-1 border-gray-700 hover:border-purple-500 w-full h-[44px] px-[16px] bg-[#1F2937]  rounded-[8px] flex gap-[15px] items-center"
                >
                  <CiUser className="text-2xl text-[#6E7079]" />
                  <input
                    type="text"
                    placeholder="Username"
                    name="email"
                    onChange={(e) => handleFields(e)}
                    value={form.email}
                    className="font-Montserrat text-[#ACACAC] text-[12px] w-full outline-none bg-[#1F2937]"
                  />
                </div>
                <div
                  id="inputTwo"
                  className="bg-[#1F2937] border border-gray-700 hover:border-purple-500 w-full h-[44px] px-[16px]  rounded-[8px] flex gap-[15px] items-center"
                >
                  <CiLock className="text-2xl text-[#6E7079]" />
                  <input
                    type={showtext ? "text" : "password"}
                    placeholder="password"
                    name="password"
                    onChange={(e) => handleFields(e)}
                    value={form.password}
                    className="font-Montserrat text-[#ACACAC] bg-[#1F2937] text-[12px] w-[100%] outline-none h-full"
                  />

                  <p onClick={handlePassword}>
                    {showtext ? (
                      <FaEye className="text-[#6E7079] w-fit" />
                    ) : (
                      <FaEyeSlash className="text-[#6E7079]" />
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-[12px] flex justify-end items-end text-right w-full">
              <h1 className="text-gray-300 flex justify-end items-end font-[400] text-[12px] text-right font-Montserrat w-fit">
                Forgot Password?
              </h1>
            </div>
            <div className="w-full justify-center items-center mt-[30px]">
              {" "}
              <button
                className="bg-purple-500 hover:bg-purple-600 px-4 w-full text-[#FFFFFF] font-Montserrat rounded-lg text-[16px] font-semibold flex items-center justify-center h-[52px] gap-2"
                type="submit"
              >
                Log in
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
              Don’t have an account?
              <Link
                to="/signup"
                className="font-Montserrat font-[400] text-gray-300 hover:text-white"
              >
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
