import React, { useState, useEffect } from "react";
import { MdStarBorder } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import axios from "axios";
import { TbWorldBolt } from "react-icons/tb";
import { Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

const EditSearch = ({ setIsPlanning, setMenuOpen, plan, isPlanning }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      setLoading(true);

      // Introduce an 8-second delay  
      let response = await axios.get(`${API_URL}/api/plan`);
      setPlans(response.data.plan);
      console.log(response.data.plan, "data");
      // setPlan(response.data); // Set the response data to the plans state
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // console.log(plans, "plans");
  return (
    <div
      id="main"
      className="px-[30px] md:px-[50px] dark:text-white text-gray-300 dark:bg-[#3D3D3D] bg-[#1F2937] border-[1px] border-gray-700 py-[30px]   w-fit rounded-[10px]   lg:px-[50px] overflow-hidden hover:border-purple-500"
    >
      <div className="flex  items-center gap-[10px] mb-[15px]">
        <MdStarBorder className="text-2xl text-purple-500 " />
        <p className="font-Montserrat text-[16px] font-[500]">
          Al marketing research for benchmarking in 2025
        </p>
      </div>

      {loading
        ? // Skeleton Loader
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex justify-between items-center w-[610px] border-b dark:border-white border-[#34006133] pb-[11px]"
            >
              <div className="flex items-end gap-[12px]">
                <div className="w-8 h-8 bg-[#d1d1d1] rounded-full animate-pulse"></div>
                <div className="w-24 h-4 bg-[#d1d1d1] rounded animate-pulse"></div>
              </div>
              <div className="w-24 h-4 bg-[#d1d1d1] rounded animate-pulse"></div>
            </div>
          ))
        : // Actual content
          plans?.map((plan, index) => (
            <div
              key={index}
              style={{ height: "60px" }}
              className="flex gap-[25px] items-center w-[610px]  border-b dark:border-white border-gray-700 hover:border-purple-500 pb-[11px]"
            >
              <div className="flex items-end gap-[12px]">
                <GoDotFill
                  className="text-2xl dark:text-white text-[#A854F7] align-top"
                  style={{
                    height: "16px", // Fixed height for the dot
                    width: "16px", // Fixed width for the dot
                    display: "block", // Ensure it behaves like a block element
                    margin: "0 auto", // Center it vertically in its container
                    lineHeight: "1.2", // Adjust line height for wrapping
                  }}
                />
                {/* <Link
                  to="/"
                  className="font-Montserrat text-[16px] dark:text-white text-gray-300 hover:text-white font-[400]"
                >
                  click here
                </Link> */}
                <h1
                  className="font-Montserrat text-[13px] text-white text-gray-300 font-[400]"
                  style={{
                    maxWidth: "490px", // Optional: limit the width for truncation
                    overflow: "hidden",
                    whiteSpace: "nowrap", // Keep text on one line
                    textOverflow: "ellipsis", // Show ellipsis if text is too long
                  }}
                >
                  {plan}
                </h1>
              </div>
            </div>
          ))}
      <p className="font-Montserrat text-[14px] font-normal pt-[20px]">
        Estimated completion time: 5 minutes
      </p>

      <div className=" flex-col flex md:flex-row mt-[35px] gap-[20px] sm:mt-[25px] ">
        <button className="text-[#FFFFFF] dark:bg-[#3b82f5] bg-purple-500 hover:bg-purple-600 font-Montserrat font-semibold text-[12px] py-[09px] px-[20px] rounded-[8px] ">
          Edit Plan
        </button>
        <button
          className="text-[#FFFFFF] dark:bg-[#3b82f5] bg-purple-500 hover:bg-purple-600 font-Montserrat font-semibold text-[12px] py-[09px] px-[20px] rounded-[8px]"
          onClick={() => {
            setIsPlanning(true);
            setMenuOpen(false);
          }}
        >
          {" "}
          Start research
        </button>
      </div>
    </div>
  );
};

export default EditSearch;
