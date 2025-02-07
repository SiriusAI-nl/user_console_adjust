import React, { useState, useEffect } from "react";
import { SlClose } from "react-icons/sl";
import axios from "axios";
const keyword_api_url = import.meta.env.VITE_API_URL;

const Starting = ({ isPlanning, setIsPlanning, isBtn }) => {
  const [loading, setLoading] = useState(true);
  const [keyWords, setKeyWords] = useState([]);
  const [geminiReport, setGeminiReport] = useState("");
  const [showGeminiReport, setShowGeminiReport] = useState(false);
  const [isResearching, setIsResearching] = useState(false);

  const FetchKeyWords = async () => {
    try {
      setLoading(true);
      // Add an 8-second delay before making the API call
      await new Promise((resolve) => setTimeout(resolve, 5000));
      let response = await axios.get(`${keyword_api_url}/api/keyword_report`);
      setKeyWords(response.data.keyword_report);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const FetchGeminiReport = async () => {
    try {
      setLoading(true);
      let response = await axios.get(`${keyword_api_url}/api/gemini_report`);
      setGeminiReport(response.data.report); // Assuming the response has a 'report' field
      setShowGeminiReport(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showGeminiReport && !isResearching) {
      FetchKeyWords();
    }
  }, [showGeminiReport, isResearching]);

  const handleStartResearch = () => {
    setIsResearching(true);
    setShowGeminiReport(false);
    setKeyWords([]);
    FetchGeminiReport();
  };

  return (
    <div className="h-full hidden md:flex py-[30px] px-[30px] flex-col gap-4 border-[1px] dark:border-white border-gray-700 hover:border-purple-500 rounded-[10px] bg-[#1F2937]">
      {/* Header */}
      <div className="flex w-full mb-[20px] justify-between">
        <h1 className="dark:text-white text-gray-300 font-Montserrat font-[400] text-[16px]">
          {isResearching
            ? "AI Marketing Research in Progress"
            : "Starting Research"}
        </h1>
        <SlClose
          className="text-2xl dark:text-white text-gray-300 cursor-pointer hover:text-purple-500"
          onClick={() => setIsPlanning(false)}
        />
      </div>

      {/* Description */}
      <p className="dark:text-white text-gray-300 font-Montserrat text-[16px] font-[500] mb-[30px]">
        {isResearching
          ? "Please wait while we fetch the Gemini Report for your AI marketing research."
          : "Conduct AI marketing research for benchmarking in 2025"}
      </p>

      {/* Content Area */}
      {isResearching ? (
        <div className="w-full h-[500px] p-[10px] dark:bg-[#2d3748] bg-white dark:text-white text-gray-700 rounded-[10px]">
          {loading ? (
            // Skeleton Loading Effect
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-4 bg-[#d1d1d1] dark:bg-[#4a5568] rounded animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <textarea
              className="w-full h-full p-[10px] dark:bg-[#2d3748] bg-white dark:text-white text-gray-700 rounded-[10px]"
              value={geminiReport}
              readOnly
            />
          )}
        </div>
      ) : showGeminiReport ? (
        <textarea
          className="w-full h-[500px] p-[10px] dark:bg-[#2d3748] bg-white dark:text-white text-gray-700 rounded-[10px]"
          value={geminiReport}
          readOnly
        />
      ) : (
        <div className="flex flex-col max-h-[500px] overflow-y-auto">
          {/* Table Headers */}
          <div className="flex justify-between items-center border-b dark:border-white border-gray-700 p-[10px] h-[50px] sticky top-0 bg-[#1F2937] z-10">
            <h1 className="font-Montserrat text-[14px] dark:text-white text-gray-300 font-[600] w-1/3 px-[10px]">
              Keyword
            </h1>
            <h1 className="font-Montserrat text-[14px] dark:text-white text-center text-gray-300 font-[600] w-1/3">
              Search Volume
            </h1>
            <h1 className="font-Montserrat text-[14px] dark:text-white text-center text-gray-300 font-[600] w-1/3">
              Commercial Value
            </h1>
          </div>

          {/* Table Rows */}
          {loading
            ? Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b dark:border-white border-[#34006133] p-[10px] h-[50px]"
                >
                  <div className="w-1/3 h-4 bg-[#d1d1d1] rounded animate-pulse"></div>
                  <div className="w-1/3 h-4 bg-[#d1d1d1] rounded animate-pulse"></div>
                  <div className="w-1/3 h-4 bg-[#d1d1d1] rounded animate-pulse"></div>
                </div>
              ))
            : keyWords?.map((keyword, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b dark:border-white border-gray-700 p-[20px] h-[70px] hover:bg-[#2d3748]"
                >
                  <h1 className="font-Montserrat text-[12px] dark:text-white text-gray-300 font-[400] w-1/3">
                    {keyword.keyword}
                  </h1>
                  <h1 className="font-Montserrat text-[12px] dark:text-white text-center text-gray-300 font-[400] w-1/3">
                    {keyword.search_volume.toLocaleString()}
                  </h1>
                  <h1 className="font-Montserrat text-[12px] dark:text-white text-center text-gray-300 font-[400] w-1/3">
                    {keyword.commercial_value.toLocaleString()}
                  </h1>
                </div>
              ))}
        </div>
      )}

      {/* Start Research Button */}
      <div>
        {!isResearching && (
          <button
            onClick={handleStartResearch}
            className="text-[#FFFFFF] dark:bg-[#3b82f5] bg-purple-500 hover:bg-purple-600 font-Montserrat font-semibold text-[12px] py-[09px] px-[20px] rounded-[8px]"
          >
            Start Research
          </button>
        )}
      </div>
    </div>
  );
};

export default Starting;
