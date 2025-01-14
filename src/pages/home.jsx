import React from 'react';
import Card from '../components/card';
import { IoKeyOutline } from "react-icons/io5";
import { LiaArrowRightSolid } from "react-icons/lia";
import { PiUsersThreeLight } from "react-icons/pi";
import { LuNotepadText } from "react-icons/lu";
import { BsBox } from "react-icons/bs";
import { VscGraphLeft } from "react-icons/vsc";
import { GrDocumentText } from "react-icons/gr";








function Home (){
    const cardArray = [
        {
            icon : IoKeyOutline,
            title: "Create an API key",
            desc:"Start integrating with our API",
            rightIcon:LiaArrowRightSolid 
        },
        {
            icon :PiUsersThreeLight ,
            title: "Invite your team",
            desc:"Collaborate with your team",
            rightIcon:LiaArrowRightSolid ,
 
        },
        {
            icon : LuNotepadText,
            title: "View invoices",
            desc:"Track your spending",
            rightIcon:LiaArrowRightSolid 
        },
        {
            icon :BsBox ,
            title: "View models",
            desc:"Compare models and costs",
            rightIcon:LiaArrowRightSolid 
        },
        {
            icon :VscGraphLeft ,
            title: "Track your usage",
            desc:"Deep dive into your usage",
            rightIcon:LiaArrowRightSolid 
        },
        {
            icon :GrDocumentText,
            title: "View our docs",
            desc:"Learn more about the API",
            rightIcon:LiaArrowRightSolid 
        },
    ]
  return (
    <>
    <div id='main' className='w-full flex-col pl-[60px] pr-[30px] item-center justify-between bg-gray-100'>
     <div id='uper-section'>
        </div> 
     <div id='lower-section' className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full justify-between gap-[20px]'>
        {
            cardArray.map((card, index) => (
                <Card key={index} classMain="" title={card.title} icon={<card.icon />}  desc="Learn more about the API" className="font-Montserrat font-[400] mr-[40px]" rightIcon={<card.rightIcon/>}classIcon="text-3xl" titleClass="mt-[20px] mb-[6px] font-Montserrat text-[20px] font-[500] "/>
            ))
        }
    </div>  

    </div>
    

    </>

  )
}


export default Home;
