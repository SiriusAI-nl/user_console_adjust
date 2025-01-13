import React from 'react';
import { MdStarBorder } from "react-icons/md";
import { GoDotFill } from "react-icons/go";





const EditSearch = () => {
  return (
    <div id='main' className='border-[1px] border-[#34006114] py-[30px] pl-[30px] w-fit rounded-[10px] pr-[105px] bg-[#FFFFFF]'>
    <div className='flex  items-center gap-[10px] mb-[15px]'>
    <MdStarBorder  className='text-2xl text-[#D6458D] '/>
<p className='text-[#000000] font-Montserrat text-[16px] font-[500]'>Al marketing research for benchmarking in 2025</p>
  </div>
  <div className='flex justify-center items-center gap-[17px] mb-[15px]'>
  <GoDotFill />
  <p className='text-[#6E7079] font-Montserrat font-[400] text-[14px] '>Find articles and case studies on Al-powered marketing campaigns from 2024</p></div>
  <div className='flex justify-center items-center gap-[17px] mb-[15px]'>
  <GoDotFill />
  <p className='text-[#6E7079] font-Montserrat font-[400] text-[14px]'>Find articles and case studies on Al-powered marketing campaigns from 2024</p></div>
  <div className='flex justify-center items-center gap-[17px]'>
  <GoDotFill />
  <p className='text-[#6E7079] font-Montserrat font-[400] text-[14px] mb-[15px]'>Find articles and case studies on Al-powered marketing campaigns from 2024</p></div>
  <p className='text-[#6E7079] font-Montserrat text-[14px] font-normal'>Estimated completion time: 5 minutes</p>

  <div className='flex mt-[35px] gap-[30px]'>
    <button className='text-[#FFFFFF] bg-[#340061] font-Montserrat font-semibold text-[16px] py-[11px] px-[25px] rounded-[8px]' >Edit Plan</button>
    <button className='text-[#FFFFFF] bg-[#340061] font-Montserrat font-semibold text-[16px] py-[11px] px-[25px] rounded-[8px]' > Start research</button>
    
  </div>

  </div>
  )
}

export default EditSearch;