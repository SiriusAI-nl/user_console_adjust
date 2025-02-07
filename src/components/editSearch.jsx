import React, { useState, useEffect } from "react";
import { MdStarBorder } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const EditSearch = ({ setIsPlanning, setMenuOpen }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false); // Toggle to show all plans

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/plan`);
      setPlans(response.data.plan);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div
      id="main"
      className="px-[30px] md:px-[50px] dark:text-white text-gray-300 dark:bg-[#3D3D3D] bg-[#1F2937] border-[1px] border-gray-700 py-[30px] w-fit rounded-[10px] lg:px-[50px] overflow-hidden hover:border-purple-500"
    >
      <div className="flex items-center gap-[10px] mb-[15px]">
        <MdStarBorder className="text-2xl text-purple-500" />
        <p className="font-Montserrat text-[16px] font-[500]">
          AI Marketing Research for Benchmarking in 2025
        </p>
      </div>

      {loading ? (
        // Skeleton Loader
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
      ) : (
        <div
          className={`transition-all duration-300 overflow-hidden ${
            showAll && "h-[300px]" // Show 4 plans initially (approx. 300px height)
          }`}
          style={{
            maxHeight: "400px",
            overflowY: showAll ? "auto" : "hidden",
          }}
        >
          {plans.map((plan, index) => (
            <div
              key={index}
              className="flex gap-[25px] items-center w-[610px] border-b dark:border-white border-gray-700 hover:border-purple-500 pb-[11px]"
            >
              <div className="flex items-center gap-[12px]">
                <GoDotFill
                  className="text-2xl dark:text-white text-[#A854F7] flex align-center"
                  style={{
                    height: "16px",
                    width: "16px",
                    display: "block",
                    margin: "0 auto",
                    // padding: "10px 0",
                  }}
                />
                <h1
                  className="font-Montserrat text-[13px] text-gray-300 font-[400] h-[30px] py-[10px] flex align-center"
                  style={{
                    maxWidth: "500px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {plan}
                </h1>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && plans?.length > 4 && (
        <button
          className="text-white mt-4 py-1 px-2 rounded-md"
          style={{
            backgroundColor: "#A854F7",
            fontSize: "12px",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: "500",
          }}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show More" : "Show Less"}
        </button>
      )}

      <p className="font-Montserrat text-[14px] font-normal pt-[20px]">
        Estimated completion time: 5 minutes
      </p>

      <div className="flex-col flex md:flex-row mt-[35px] gap-[20px] sm:mt-[25px]">
        <button className="text-[#FFFFFF] dark:bg-[#3b82f5] bg-purple-500 hover:bg-purple-600 font-Montserrat font-semibold text-[12px] py-[09px] px-[20px] rounded-[8px]">
          Edit Plan
        </button>
        <button
          className="text-[#FFFFFF] dark:bg-[#3b82f5] bg-purple-500 hover:bg-purple-600 font-Montserrat font-semibold text-[12px] py-[09px] px-[20px] rounded-[8px]"
          onClick={() => {
            setIsPlanning(true);
            setMenuOpen(false);
          }}
        >
          Show Keyword Report
        </button>
      </div>
    </div>
  );
};

export default EditSearch;
