import React from 'react'

const Message = ({ sender, text }) => {
  return (
    <div
      className={`flex ${
        sender === "user" ? "justify-end" : "justify-start"
      } my-2`}
    >
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          sender === "user"
            ? "bg-purple-500 text-white"
            : "bg-gray-700 text-white"
        }`}
      >
        {text}
      </div>
    </div>
  );
};
export default Message