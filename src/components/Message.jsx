import React from 'react'

const Message = ({sender, text}) => {
  return (
    <div className={`my-4 text-[14px] border max-w-[80%] w-fit bg-white break-words p-2 ${sender == "ai" ? "text-left mr-auto rounded-[10px]" :  "text-right ml-auto rounded-tl-[20px] rounded-br-[20px] rounded-bl-[20px]"}`}>
  {text}
</div>

  )
}

export default Message