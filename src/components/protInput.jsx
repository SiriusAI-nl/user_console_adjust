import React from 'react';
import { FaPaperPlane } from "react-icons/fa";


function PrompInput(){
  return (
<div>
    <div className="border-[1px] border-[#34006114] w-full flex items-center rounded-[10px] lg:pr-[16px] lg:pl-[35px] pt-[17px] pb-[18px] ">
      <input type="text" placeholder='Ask a follow-up question...' className='placeholder:font-Montserrat placeholder:text-[#6E7079] placeholder:text-[14px] placeholder:font-[500] w-full outline-none'/>
      <FaPaperPlane  className='text-2xl'/>

    </div>
</div>

  )
}

export default PrompInput;