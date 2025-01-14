import React, { useEffect, useState } from "react";
import SearchBox from "@/components/searchBox";
import EditSearch from "@/components/editSearch";
import Message from "@/components/Message";
import Starting from "@/components/starting";
import { FaPaperPlane } from "react-icons/fa";

const MainPage = ({setMenuOpen}) => {
  const [isPlanning, setIsPlanning] = useState(false);
  const [newtext, setNewtext] = useState("");
  const [isAIType, setIsAIType] = useState(false);
  const [messages, setMessages] = useState([
    { message: "Hi", sender: "user" },
    { message: "Hello! How’s it going?", sender: "ai" },
    { message: "I need some Help", sender: "user" },
    { message: "Of course! What do you need help with?", sender: "ai" },
  ]);

  const [quotes, setQuotes] = useState([])
  const handleAIMessage = () => {
    fetch("https://dummyjson.com/quotes")
      .then((res) => res.json())
      .then((res) => {
        setIsAIType(false);
        setQuotes(res?.quotes);
      });
    const randomNumber = Math.ceil(Math.random() * 20);
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: quotes[randomNumber]?.quote ? quotes[randomNumber]?.quote : "W.salam How can i Help you", sender: "ai" },
    ]);
  };

  function handleMessage() {
    if (newtext.trim() === "") return;
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: newtext, sender: "user" },
    ]);
    setIsAIType(true);
    setTimeout(handleAIMessage, 1000);
    setNewtext("");
  }

  return (
    <div className="flex justify-center px-5 gap-x-5 h-[89vh] ">
      <div
        className={`flex flex-col justify-between ${
          isPlanning ? "w-[35%]" : "max-w-[713px]"
        } mx-auto w-full h-full`}
      >
        <div className="mb-5 w-full h-[90%] overflow-y-auto">
          {messages.map((arr, index) => (
            <Message key={index} sender={arr.sender} text={arr.message} />
          ))}
          {isAIType && (
            <div
              className={`w-[80px] h-[20px] typing flex items-center gap-x-1 rounded-[10px] my-4 text-[14px] border bg-white break-words p-2 text-left mr-auto rounded-[10px]"}`}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <SearchBox />
          <EditSearch setMenuOpen={setMenuOpen} setIsPlanning={setIsPlanning} />
        </div>
        <div className="bg-white w-full rounded-lg flex items-center justify-between h-[57px] pl-2 pr-5">
          <input
            type="text"
            placeholder="Ask a follow-up question..."
            className="flex-1 h-full px-3 border-none outline-none"
            value={newtext}
            onChange={(e) => setNewtext(e.target.value)}
          />
          <button className="w-[18px] h-[18px]" onClick={handleMessage}>
            <FaPaperPlane className="text-2xl h-full border-none" />
          </button>
        </div>
      </div>
      <Starting isPlanning={isPlanning} setIsPlanning={setIsPlanning} />
    </div>
  );
};

export default MainPage;
