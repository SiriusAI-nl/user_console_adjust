import React from 'react'

const Message = ({sender, text}) => {
  return (
    <div className={`text-left dark:text-white text-[#3D3D3D] my-4 text-[14px] border max-w-[80%] w-fit dark:bg-[#3D3D3D] bg-white break-words p-3 ${sender == "ai" ? "mr-auto rounded-[10px]" :  "ml-auto rounded-tl-[20px] rounded-br-[20px] rounded-bl-[20px]"}`}>
  {text}
</div>

  )
}

export default Message