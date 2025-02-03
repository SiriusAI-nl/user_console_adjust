import React, { useState, useEffect } from "react";
import { SlClose } from "react-icons/sl";
import { TbWorldBolt } from "react-icons/tb";
import { Link } from "react-router-dom";
import axios from "axios";

const Starting = ({ isPlanning, setIsPlanning, isBtn }) => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchPlans = async () => {
    setLoading(true); // Start loading plans
    try {
      // Adding a delay of 10 seconds
      let response = await axios.get(`${API_URL}/api/plan`);
      console.log(response, "data");
      setPlans(response.data.plan); // Set the response data to the plans state
    } catch (error) {
      console.log(error, "data");
      // setLoading(false); // Stop loading plans
      // setError("There was an issue with the API request. Please try again.");
    } finally {
      setLoading(false); // Stop loading plans
    }
  };

  useEffect(() => {
    fetchPlans(); // Call the fetchPlans function when the component mounts
  }, []);

  // useEffect(() => {

  //   if (isPlanning) {
  //     setTimeout(() => {
  //       setLoading(false)
  //     }, 2000)
  //   } else {
  //     setLoading(true)
  //   }
  // }, [isPlanning])

  return (
    <div
      className={` h-full hidden md:flex py-[30px] px-[30px] flex-col gap-4 border-[1px] dark:border-white border-gray-700 hover:border-purple-500 rounded-[10px] pb-[80px] bg-[#1F2937]`}
    >
      <div className="flex w-full mb-[20px] justify-between">
        <h1 className="dark:text-white text-gray-300 font-Montserrat font-[400] text-[16px]">
          Starting research
        </h1>
        <SlClose
          className="text-2xl dark:text-white text-gray-300 cursor-pointer hover:text-purple-500"
          onClick={() => setIsPlanning(false)}
        />
      </div>
      <p className="dark:text-white text-gray-300 font-Montserrat text-[16px] font-[500] mb-[30px]">
        Conduct Al marketing research for benchmarking in 2025
      </p>

      {loading ? (
        // Skeleton Loader
        Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex justify-between items-center  border-b dark:border-white border-[#34006133] pb-[11px]"
          >
            <div className="flex items-end gap-[12px]">
              <div className="w-8 h-8 bg-[#d1d1d1] rounded-full animate-pulse"></div>
              <div className="w-24 h-4 bg-[#d1d1d1] rounded animate-pulse"></div>
            </div>
            <div className="w-24 h-4 bg-[#d1d1d1] rounded animate-pulse"></div>
          </div>
        ))
      ) : (
        // Actual content
        <div className="h-[300px] overflow-y-auto border-t border-b border-gray-700 dark:border-white">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="flex gap-[12px] items-center border-b dark:border-white border-gray-700 hover:border-purple-500 pb-[11px]"
            >
              <div className="flex items-end gap-[12px]">
                <TbWorldBolt className="text-2xl dark:text-white text-[#A854F7]" />
                {/* Uncomment this link if you need it */}
                {/* <Link to="/" className="font-Montserrat text-[16px] dark:text-white text-gray-300 hover:text-white font-[400]">click here</Link> */}
              </div>
              <h1 className="font-Montserrat text-[16px] dark:text-white text-gray-300 font-[400]">
                {plans[index]}
              </h1>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Starting;
