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
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const wsRef = useRef(null); // Ref to store WebSocket instance

  // Fetch plans from the API
  const fetchPlans = async () => {
    setIsPlansLoading(true);
    try {
      let response = await axios.get(`${API_URL}/api/plan`);
      console.log(response, "data");
      // setPlans(response.data); // Uncomment if you have a plans state
    } catch (error) {
      setError("There was an issue with the API request. Please try again.");
    } finally {
      setIsPlansLoading(false);
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);

    ws.onopen = () => {
      console.log("WebSocket connection established.");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data, "data from websocket");
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: data.content, sender: "AI" },
      ]);
      setIsAIType(false); // AI has finished typing
      setIsSearchPlan(true);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection error. Please try again.");
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    wsRef.current = ws; // Store WebSocket instance in ref

    return () => {
      ws.close(); // Close WebSocket connection on unmount
    };
  }, []);

  // Fetch plans on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  // Scroll to the bottom of the chat window when messages update
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle sending a message
  const handleMessage = async () => {
    if (isType || !newtext.trim()) return;

    // Add user message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: newtext, sender: "user" },
    ]);
    setIsType(true);
    setNewtext("");
    setIsChatLoading(true);
    setIsAIType(true); // AI is typing

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send message through WebSocket
        wsRef.current.send(JSON.stringify({ message: newtext }));
      } else {
        setError("WebSocket is not connected.");
      }
    } catch (error) {
      setError("Failed to send message. Please try again.");
      console.error("WebSocket send error:", error);
    }
  };

  // Handle window resize for responsive UI
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMedium, setIsMedium] = useState(false);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    setIsMedium(windowWidth < 768);
  }, [windowWidth]);

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
              <h1 className="sm:text-[40px] text-[25px] font-[600] text-[#fafafa] flex">
                Welcome to
                <span className="text-purple-500">&nbsp;SiriusAI</span>
              </h1>
              <p className="mt-[5px] text-[16px] font-[600] text-[#6E7079]">
                Start a conversation to generate marketing research insights
              </p>
            </div>
          )}
          {isAIType && (
            <div className="flex justify-start my-2">
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center gap-x-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
          {isSearchPlan && (
            <EditSearch
              setIsPlanning={setIsPlanning}
              isPlanning={isPlanning}
              setMenuOpen={setMenuOpen}
              isPlansLoading={isPlansLoading}
            />
          )}
        </div>
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
                handleMessage();
              }
            }}
          ></textarea>
          <button
            type="submit"
            className={`flex justify-center items-center p-2 rounded-md transition-all duration-300 bg-transparent`}
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
