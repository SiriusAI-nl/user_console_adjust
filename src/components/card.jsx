import React from 'react';


const Card = ({icon,title,desc,className,rightIcon,titleClass,classIcon,classMain}) => {
  return (
    <div>

        <div className={`w-[100%] group trasition-2 gap grid border-[1px] border-[#34006114] px-[52px] py-[28px] md:flex md:flex-col rounded-[10px] hover:bg-[#340061] hover:text-[white] ${classMain}`}>
            <div className={classIcon}>{icon}</div>
            <h1 className={titleClass}>{title}</h1>
        < div className='flex justify-between items-center w-[100%]'>   <p className={className}>{desc}</p>
      <div className=' border-[1px] border-[#34006114] rounded-full p-2 group-hover:border-[white] flex' >  {rightIcon}</div>
            </div>

        </div>
    </div>
  )
}

export default Card;