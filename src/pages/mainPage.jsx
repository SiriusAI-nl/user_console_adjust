import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import SearchBox from "@/components/searchBox";
import EditSearch from "@/components/editSearch";
import Message from "@/components/Message";
import Starting from "@/components/starting";
import { PiPaperPlaneTiltFill } from "react-icons/pi";
import { FaCircleStop } from "react-icons/fa6";

const MainPage = ({ setMenuOpen, setIsBtn }) => {
  const [isPlanning, setIsPlanning] = useState(false);
  const [newtext, setNewtext] = useState("");
  const [isAIType, setIsAIType] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isSearchPlan, setIsSearchPlan] = useState(false)

  const messagesEndRef = useRef(null);

  const handleAIMessage = () => {
    setIsAIType(false);
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: "Hello! How can I help you?", sender: "ai" },
    ]);
    setIsSearchPlan(true)
  };

  const handleMessage = () => {
    if (newtext.trim() === "") return;
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: newtext, sender: "user" },
    ]);
    setIsAIType(true);
    setTimeout(handleAIMessage, 1000);
    setNewtext("");
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="sm:static relative flex justify-center px-5 gap-x-5 h-[89vh]">
      <motion.div
        className={`flex flex-col justify-between ${
          isPlanning ? "w-[35%]" : "max-w-[713px]"
        } mx-auto w-full h-full`}
        animate={{ width: isPlanning ? "35%" : "100%" }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-5 w-full h-[90%] overflow-y-auto">
          {messages.length ? (
            messages.map((arr, index) => (
              <Message key={index} sender={arr.sender} text={arr.message} />
            ))
          ) : (
            <div className="h-[60%] text-center w-full flex flex-col justify-center items-center mt-20">
              <h1 className="sm:text-[40px] text-[25px] font-[600] text-black">
                Welcome to SiriusAI
              </h1>
              <p className="mt-[5px] text-[16px] font-[600] text-[#6E7079]">
                Start a conversation to generate marketing research insights
              </p>
            </div>
          )}
          {isSearchPlan && <EditSearch setIsPlanning={setIsPlanning} setMenuOpen={setMenuOpen}/>}
          <div ref={messagesEndRef} />
          {isAIType && (
            <div
              className={`w-[80px] h-[20px] typing flex items-center gap-x-1 rounded-[10px] my-4 text-[14px] border bg-white break-words p-2 text-left mr-auto`}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
        <div className="sm:mb-0 mb-3 dark:bg-[#3D3D3D] bg-white w-full rounded-[10px] flex items-center gap-2 px-4 py-2 max-h-[57px]">
          <textarea
            type="text"
            placeholder="Ask a follow-up question..."
            className="resize-none flex-grow h-full p-2 border-none outline-none bg-transparent overflow-y-auto max-h-[200px] w-full"
            value={newtext}
            rows={1}
            onChange={(e) => setNewtext(e.target.value)}
          ></textarea>
          <button
            className={`flex justify-center items-center p-2 rounded-md transition-all duration-300 ${
              !newtext.trim()
                ? "text-gray-400 cursor-default"
                : "text-[#340061] hover:bg-[#F3E8FF] active:bg-[#E9D5FF]"
            } bg-transparent`}
            onClick={handleMessage}
            disabled={!newtext.trim()}
          >
            {isAIType ? (
              <FaCircleStop className="text-2xl" />
            ) : (
              <PiPaperPlaneTiltFill className="text-2xl" />
            )}
          </button>
        </div>
      </motion.div>
      <AnimatePresence>
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
    </div>
  );
};

export default MainPage;
