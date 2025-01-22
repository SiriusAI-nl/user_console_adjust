import React from 'react'

const Message = ({sender, text}) => {
  return (
    <div className={`text-left dark:text-white text-gray-300 my-4 text-[14px] border border-gray-700 hover:border-purple-500 max-w-[80%] w-fit dark:bg-[#3D3D3D] bg-[#1F2937] break-words p-3 ${sender == "ai" ? "mr-auto rounded-[10px]" :  "ml-auto rounded-tl-[20px] rounded-br-[20px] rounded-bl-[20px]"}`}>
  {text}
</div>

  )
}

export default Message