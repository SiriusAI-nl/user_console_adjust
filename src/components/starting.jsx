import React, { useState, useEffect } from "react";
import { SlClose } from "react-icons/sl";
import { TbWorldBolt } from "react-icons/tb";
import { Link } from "react-router-dom";
import axios from "axios";
const keyword_api_url = import.meta.env.VITE_API_URL;

const Starting = ({ isPlanning, setIsPlanning, isBtn }) => {
  const [loading, setLoading] = useState(true);
  const [keyWords, setKeyWords] = useState([]);

  const FetchKeyWords = async () => {
    try {
      setLoading(true);
      let response = await axios.get(`${keyword_api_url}/api/keyword_report`);
      console.log(response.data.keyword_report[0].keyword, "data");
      console.log(response.data.keyword_report[0].search_volume, "data");
      console.log(response.data.keyword_report[0].commercial_value, "data");
      setKeyWords(response.data.keyword_report);
      console.log(response.data.keyword_report);
      // setPlan(response.data); // Set the response data to the plans state
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    FetchKeyWords();
  }, []);

  return (
    <div className="h-full hidden md:flex py-[30px] px-[30px] flex-col gap-4 border-[1px] dark:border-white border-gray-700 hover:border-purple-500 rounded-[10px] bg-[#1F2937]">
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
        Conduct AI marketing research for benchmarking in 2025
      </p>

      <div className="flex flex-col max-h-[500px] overflow-y-auto">
        {loading
          ? // Skeleton Loader
            Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b dark:border-white border-[#34006133] pb-[6px] h-[45px] relative"
              >
                <div className="flex items-end gap-[12px]">
                  <div className="w-24 h-2 bg-[#d1d1d1] rounded animate-pulse"></div>
                </div>
              </div>
            ))
          : // Actual content
            keyWords?.map((keyword, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b dark:border-white border-gray-700 overflow-hidden hover:border-purple-500 p-[20px] h-[70px] relative"
              >
                {/* <div className="flex items-end gap-[12px]"> */}
                {/* <TbWorldBolt className="text-2xl dark:text-white text-[#A854F7]" /> */}
                {/* <Link
                  to="/"
                  className="font-Montserrat text-[16px] dark:text-white text-gray-300 hover:text-white font-[400]"
                >
                  click here
                </Link> */}
                {/* </div> */}
                <h1 className="font-Montserrat text-[16px] dark:text-white text-gray-300 font-[400] leading-[20px] py-[10px]">
                  {keyword.keyword}
                </h1>
              </div>
            ))}
      </div>
    </div>
  );
};

export default Starting;
