import React from 'react';

function Button({text,images}) {
  return (
   
    <Button className="rounded-lg font-montserrt font-semibold bg-[#340061] flex text-center justify-center items-center text-[#FFFFFF] ">{text} {images && <img src={images} alt=''/>} </Button>
    
  )
}

export default Button ;