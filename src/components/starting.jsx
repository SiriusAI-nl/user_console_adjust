import React from 'react';
import { SlClose } from "react-icons/sl";
import { TbWorldBolt } from "react-icons/tb";
import { Link } from 'react-router-dom';



const Starting = ({isPlanning, setIsPlanning}) => {
  return (
    <>
   <div className={`h-full ${isPlanning ? "flex w-[60%]" : "hidden"} py-[30px] px-[30px] flex-col gap-4 border-[1px] border-[#340061] rounded-[10px] pb-[150px]`}>
    <div className='flex w-full mb-[20px] justify-between' >
        <h1 className='text-[#000000] font-Montserrat font-[400] text-[16px]'>Starting research</h1>
        <SlClose className='text-2xl text-[#340061] cursor-pointer' onClick={() => setIsPlanning(false)} />
    </div>
    <p className='text-[#6E7079] font-Montserrat text-[16px] font-[500] mb-[30px]'>Conduct Al marketing research for benchmarking in 2025</p>
    <div className='flex justify-between items-center  border-b border-[#34006133] pb-[11px]'>
   <div className='flex items-end gap-[12px]'> <TbWorldBolt className='text-2xl text-[#340061]'/>
          <Link to="/" className='font-Montserrat text-[16px] text-[#000000] font-[400]'> click here</Link >
          </div>
        <h1 className='font-Montserrat text-[16px] text-[#000000] font-[400]'>John Tomas</h1>
    </div>
    <div className='flex justify-between items-center  border-b border-[#34006133] pb-[11px]'>
   <div className='flex items-end gap-[12px]'> <TbWorldBolt  className='text-2xl text-[#340061]'/>
          <Link to="/" className='font-Montserrat text-[16px] text-[#000000] font-[400]'> click here</Link >
          </div>
        <h1 className='font-Montserrat text-[16px] text-[#000000] font-[400]'>John Tomas</h1>
    </div>
    <div className='flex justify-between items-center  border-b border-[#34006133] pb-[11px]'>
   <div className='flex items-end gap-[12px]'> <TbWorldBolt className='text-2xl text-[#340061]'/>
          <Link to="/" className='font-Montserrat text-[16px] text-[#000000] font-[400]'> click here</Link >
          </div>
        <h1 className='font-Montserrat text-[16px] text-[#000000] font-[400]'>John Tomas</h1>
    </div>
    <div className='flex justify-between items-center  border-b border-[#34006133] pb-[11px]'>
   <div className='flex items-end gap-[12px]'> <TbWorldBolt className='text-2xl text-[#340061]'/>
          <Link to="/" className='font-Montserrat text-[16px] text-[#000000] font-[400]'> click here</Link >
          </div>
        <h1 className='font-Montserrat text-[16px] text-[#000000] font-[400]'>John Tomas</h1>
    </div>
    <div className='flex justify-between items-center  border-b border-[#34006133] pb-[11px]'>
   <div className='flex items-end gap-[12px]'> <TbWorldBolt className='text-2xl text-[#340061]'/>
          <Link to="/" className='font-Montserrat text-[16px] text-[#000000] font-[400]'> click here</Link >
          </div>
        <h1 className='font-Montserrat text-[16px] text-[#000000] font-[400]'>John Tomas</h1>
    </div>
   </div>
    </>
  )
}

export default Starting;