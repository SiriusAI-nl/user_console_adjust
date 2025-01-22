import React from 'react';


const Card = ({icon,title,desc,className,rightIcon,titleClass,classIcon,classMain}) => {
  return (
    <div>

        <div className={`${classMain}group bg-[#1F2937] w-[100%] group trasition-2 gap grid border-[1px] border-gray-700 hover:border-purple-500 px-[30px] lg:px-[50px] py-[28px] md:flex md:flex-col rounded-[10px] hover:text-[white] text-gray-300`}>
        <img src={icon} className={`w-[30px] h-[30px] ease-in-out invert grayscale brightness-50 mb-[20px] text-gray-300`}/>
           
            <h1 className={titleClass}>{title}</h1>
        < div className='flex justify-between items-center w-[100%] mt-[6px] text-gray-300 hover:text-white'>   <p className={className}>{desc}</p>
      <div className=' border-[1px] border-gray-300 rounded-full p-2 group-hover:border-[white] flex cursor-pointer' >  {rightIcon}</div>
            </div>

        </div>
    </div>
  )
}

export default Card;
