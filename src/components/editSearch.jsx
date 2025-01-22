import React from 'react';
import { MdStarBorder } from "react-icons/md";
import { GoDotFill } from "react-icons/go";





const EditSearch = ({ setIsPlanning, setMenuOpen }) => {
  return (
    <div id='main' className='px-[30px] md:px-[50px] dark:text-white text-gray-300 dark:bg-[#3D3D3D] bg-[#1F2937] border-[1px] border-gray-700 py-[30px]   w-fit rounded-[10px]   lg:pr-[105px] overflow-hidden hover:border-purple-500'>
      <div className='flex  items-center gap-[10px] mb-[15px]'>
        <MdStarBorder className='text-2xl text-purple-500 ' />
        <p className='font-Montserrat text-[16px] font-[500]'>Al marketing research for benchmarking in 2025</p>
      </div>
      <div className='flex justify-center items-center gap-[17px] mb-[15px]'>
        <GoDotFill className='text-purple-500'/>
        <p className='font-Montserrat font-[400] text-[14px] '>Find articles and case studies on Al-powered marketing campaigns from 2024</p></div>
      <div className='flex justify-center items-center gap-[17px] mb-[15px]'>
        <GoDotFill className='text-purple-500'/>
        <p className='font-Montserrat font-[400] text-[14px]'>Find articles and case studies on Al-powered marketing campaigns from 2024</p></div>
      <div className='flex justify-center items-center gap-[17px]'>
        <GoDotFill className='text-purple-500'/>
        <p className='font-Montserrat font-[400] text-[14px] mb-[15px]'>Find articles and case studies on Al-powered marketing campaigns from 2024</p></div>
      <p className='font-Montserrat text-[14px] font-normal'>Estimated completion time: 5 minutes</p>

      <div className=' flex-col flex md:flex-row mt-[35px] gap-[20px] sm:mt-[25px] '>
        <button className='text-[#FFFFFF] dark:bg-[#3b82f5] bg-purple-500 hover:bg-purple-600 font-Montserrat font-semibold text-[12px] py-[09px] px-[20px] rounded-[8px] '>Edit Plan</button>
        <button className='text-[#FFFFFF] dark:bg-[#3b82f5] bg-purple-500 hover:bg-purple-600 font-Montserrat font-semibold text-[12px] py-[09px] px-[20px] rounded-[8px]' onClick={() => {
          setIsPlanning(true)
          setMenuOpen(false)
        }} > Start research</button>

      </div>

    </div>
  )
}

export default EditSearch;