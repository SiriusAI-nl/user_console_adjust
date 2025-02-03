import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBox from "@/components/searchBox";
import EditSearch from "@/components/editSearch";
import Message from "@/components/Message";
import Starting from "@/components/starting";
import { PiPaperPlaneTiltFill } from "react-icons/pi";
import { FaCircleStop } from "react-icons/fa6";
import axios from "axios";

const MainPage = ({ setMenuOpen, setIsBtn }) => {
  const [isPlanning, setIsPlanning] = useState(false);
  const [newtext, setNewtext] = useState("");
  const [isAIType, setIsAIType] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isSearchPlan, setIsSearchPlan] = useState(false);
  const [isType, setIsType] = useState(false);
  const [error, setError] = useState(null);
  // const [plans, setPlans] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false); // Track chatbot API loading
  const [isPlansLoading, setIsPlansLoading] = useState(false); // Track plans API loading
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchMessages = async () => {
    let { data } = await axios.get(`${API_URL}/api/chat`);
  };

  // // Function to fetch plans after 10 seconds
  // const fetchPlans = async () => {
  //   setIsPlansLoading(true); // Start loading plans
  //   try {
  //     // Adding a delay of 10 seconds
  //     await new Promise((resolve) => setTimeout(resolve, 10000));

  //     let response = await axios.get("http://127.0.0.1:8080/api/plan");
  //     console.log(response, "data");
  //     setPlans(response.data); // Set the response data to the plans state
  //   } catch (error) {
  //     setError("There was an issue with the API request. Please try again.");
  //   } finally {
  //     setIsPlansLoading(false); // Stop loading plans
  //   }
  // };

  // useEffect(() => {
  //   fetchPlans(); // Call the fetchPlans function when the component mounts
  // }, []);

  const messagesEndRef = useRef(null);

  const handleAIMessage = () => {
    setIsAIType(false);
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: "Hello! How can I help you?", sender: "ai" },
    ]);
    setIsSearchPlan(true);
  };

  const handleMessage = async () => {
    if (isType) return;
    if (newtext.trim() === "") return;
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: newtext, sender: "user" },
    ]);
    setIsAIType(true);
    setIsType(true);
    setNewtext("");
    setIsSearchPlan(true);
    setIsChatLoading(true); // Start loading chatbot response
    try {
      let response = await axios.post(`${API_URL}/api/chat`, {
        message: newtext,
      });
      setIsSearchPlan(true);
      fetchPlans(); // Fetch plans after chatbot API call
    } catch (error) {
      setError("There was an issue with the API request. Please try again.");
      console.log(error, "data");
    } finally {
      setIsChatLoading(false); // Stop loading chatbot response
      setIsAIType(false);
      setIsType(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isPlanning]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMedium, setIsMedium] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (windowWidth < 768) {
      setIsMedium(true);
    } else {
      setIsMedium(false);
    }
  }, [windowWidth, setMenuOpen]);


  console.log(API_URL,"API_URL");

  return (
    <div className="sm:static relative flex justify-center px-5 gap-x-5 h-[89vh]">
      <motion.div
        className={`flex flex-col justify-between ${
          isPlanning ? "w-[35%]" : "max-w-[713px]"
        } mx-auto w-full h-full`}
        animate={{ width: isPlanning && !isMedium ? "35%" : "100%" }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-5 w-full h-[90%] overflow-y-auto pt-[10px]">
          {messages.length ? (
            messages.map((arr, index) => (
              <Message key={index} sender={arr.sender} text={arr.message} />
            ))
          ) : (
            <div className="h-[60%] text-center w-full flex flex-col justify-center items-center mt-20">
              <h1 className="sm:text-[40px] text-[25px] font-[600] text-[#fafafa] flex ">
                Welcome to
                <span className="text-purple-500">&nbsp;SiriusAI</span>
              </h1>
              <p className="mt-[5px] text-[16px] font-[600] text-[#6E7079]">
                Start a conversation to generate marketing research insights
              </p>
            </div>
          )}
          {isMedium && (
            <AnimatePresence>
              {isPlanning && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Starting
                    isPlanning={isPlanning}
                    setIsPlanning={setIsPlanning}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
          {isAIType && (
            <div
              className={`w-[80px] h-[20px] typing flex items-center gap-x-1 rounded-[10px] my-4 text-[14px] border border-gray-700 hover:border-purple-500 bg-[#1F2937] break-words p-2 text-left mr-auto`}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          {isSearchPlan && (
            <EditSearch
              setIsPlanning={setIsPlanning}
              setMenuOpen={setMenuOpen}
              // plans={plans}
              isPlansLoading={isPlansLoading}
            />
          )}
        </div>
        {error && (
          <div className="error-message text-red-500 bg-red-100 p-2 rounded-md my-3">
            {error}
          </div>
        )}

        <form
          className="sm:mb-0 mb-3 dark:bg-[#3D3D3D] bg-[#1F2937] border border-gray-700 hover:border-purple-500 w-full rounded-[10px] flex items-center gap-2 px-4 py-2 max-h-[57px] text-gray-300"
          onSubmit={(e) => {
            e.preventDefault();
            handleMessage();
          }}
        >
          <textarea
            type="text"
            placeholder="Ask a follow-up question..."
            className="resize-none flex-grow h-full p-2 border-none outline-none bg-transparent overflow-y-auto max-h-[200px] w-full"
            value={newtext}
            rows={1}
            onChange={(e) => setNewtext(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleMessage(e);
              }
            }}
          ></textarea>
          <button
            type="submit"
            className={`flex justify-center items-center p-2 rounded-md transition-all duration-300 ${
              !newtext.trim()
                ? "text-gray-400 cursor-default"
                : "text-[#340061] hover:bg-[#1F2937] active:bg-[#E9D5FF]"
            } bg-transparent`}
            onClick={() => {
              if (isAIType) {
                handleMessage();
              } else {
                setIsAIType(false);
              }
            }}
            disabled={isType || !newtext.trim()}
          >
            {isAIType ? (
              <FaCircleStop className="text-2xl" />
            ) : (
              <PiPaperPlaneTiltFill className="text-2xl text-gray-300" />
            )}
          </button>
        </form>
      </motion.div>
      {!isMedium && (
        <AnimatePresence className="md:flex hidden">
          {isPlanning && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "60%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Starting isPlanning={isPlanning} setIsPlanning={setIsPlanning} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default MainPage;