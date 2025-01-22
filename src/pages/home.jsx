import React from 'react';
import { IoKeyOutline } from "react-icons/io5";
import { LiaArrowRightSolid } from "react-icons/lia";
import { PiUsersThreeLight } from "react-icons/pi";
import { LuNotepadText } from "react-icons/lu";
import { BsBox } from "react-icons/bs";
import { VscGraphLeft } from "react-icons/vsc";
import { GrDocumentText } from "react-icons/gr";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { TrendingUp } from "lucide-react"
import CardGroup from "@/components/card"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
    { month: "Ja`nuary", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
]
const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
    },
}

function Home() {
    const cardArray = [
        {
            icon: "key1.svg",
            title: "Create an API key",
            desc: "Start integrating with our API",
            rightIcon: LiaArrowRightSolid
        },
        {
            icon: "people.svg",
            title: "Invite your team",
            desc: "Collaborate with your team",
            rightIcon: LiaArrowRightSolid,

        },
        {
            icon: "slip.svg",
            title: "View invoices",
            desc: "Track your spending",
            rightIcon: LiaArrowRightSolid
        },
        {
            icon: "box.svg",
            title: "View models",
            desc: "Compare models and costs",
            rightIcon: LiaArrowRightSolid
        },
        {
            icon: "graph.svg",
            title: "Track your usage",
            desc: "Deep dive into your usage",
            rightIcon: LiaArrowRightSolid
        },
        {
            icon: "note.svg",
            title: "View our docs",
            desc: "Learn more about the API",
            rightIcon: LiaArrowRightSolid
        },
    ]
    return (
        <>
            <div id='main' className='max-w-full flex-col  pr-[20px] lg:pr-[40px] pl-[20px] md:pl-[20px]  lg:pl-[50px] py-8 item-center justify-between bg-[#030c1c] '>
                <div id='uper-section' className='grid lg:grid-cols-2 gap-8 grid-cols-1 mb-6'>
                    <div className="w-full p-4 bg-[#1F2937] flex flex-col justify-between items-center rounded-[10px] h-[50vh] border border-gray-700 hover:border-purple-500">
                        <div className="w-[100%] grid grid-cols-3 h-full justify-items-center">
                            <div className="flex flex-col items-center gap-y-[20px]">
                                <div className="relative md:w-[100px] md:h-[100px] w-[70px] h-[70px] m-[0,auto]">
                                    <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200 dark:text-neutral-700" stroke-width="3"></circle>
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-blue-600 dark:text-blue-500" stroke-width="0" stroke-dasharray="100" stroke-dashoffset="100" stroke-linecap="round"></circle>
                                    </svg>
                                </div>
                                <h1 className='md:text-[20px] sm:text-[18px] text-[14px] font-[600] w-full text-gray-300'>Invoice Usage cap</h1>
                                <div className="flex flex-col items-start w-full">
                                    <p className='text-gray-300 sm:text-[14px] text-[12px] font-[500]'>$00.0 total</p>
                                    <p className='text-gray-300 sm:text-[14px] text-[12px] font-[500]'>$00.0 remaining</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-y-[20px]">
                                <div className="relative md:w-[100px] md:h-[100px] w-[70px] h-[70px] m-[0,auto]">
                                    <svg className="size-full rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200 dark:text-neutral-700" stroke-width="3"></circle>
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-[#a854f7] dark:text-blue-500" stroke-width="3" stroke-dasharray="100" stroke-dashoffset="25" stroke-linecap="round"></circle>
                                    </svg>
                                </div>
                                <h1 className='md:text-[20px] sm:text-[18px] text-[14px] font-[600] w-full text-gray-300'>Prepaid credits</h1>
                                <div className="flex flex-col items-start w-full">
                                    <p className='text-gray-300 sm:text-[14px] text-[12px] font-[500]'>$00.0 total</p>
                                    <p className='text-gray-300 sm:text-[14px] text-[12px] font-[500]'>$00.0 remaining</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-y-[20px]">
                                <div className="relative md:w-[100px] md:h-[100px] w-[70px] h-[70px] m-[0,auto]">
                                    <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200 dark:text-neutral-700" stroke-width="3"></circle>
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-blue-600 dark:text-blue-500" stroke-width="0" stroke-dasharray="100" stroke-dashoffset="100" stroke-linecap="round"></circle>
                                    </svg>
                                </div>
                                <h1 className='md:text-[20px] sm:text-[18px] text-[14px] font-[600] w-full text-gray-300'>Free credits</h1>
                                <div className="flex flex-col items-start w-full">
                                    <p className='text-gray-300 sm:text-[14px] text-[12px] font-[500]'>$00.0 total</p>
                                    <p className='text-gray-300 sm:text-[14px] text-[12px] font-[500]'>$00.0 remaining</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Card className="h-[50vh] shadow-none bg-[#1F2937] border border-gray-700 hover:border-purple-500">
                            <CardHeader>
                                <CardTitle className="text-gray-300">Monthly Snapshot</CardTitle>
                            </CardHeader>

                            <CardContent className="h-full">
                                <ChartContainer config={chartConfig} className="h-[88%] w-full">
                                    <BarChart accessibilityLayer data={chartData} height="100%">
                                        <CartesianGrid vertical={false} />

                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                            tickFormatter={(value) => value.slice(0, 3)}
                                        />

                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dashed" />}
                                        />

                                        <Bar dataKey="desktop" fill="#a854f7" radius={9} />
                                        <Bar dataKey="mobile" fill="#FFFFFF" radius={9} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>

                </div>
                <div id='lower-section' className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full justify-between gap-[20px]'>
                    {
                        cardArray.map((card, index) => (
                            <CardGroup key={index} classMain="group" title={card.title} icon={`/images/${card.icon }`} desc="Learn more about the API" className="font-Montserrat font-[400] mr-[40px] text-gray-300 group-hover:text-white" rightIcon={<card.rightIcon />} classIcon="text-3xl text-gray-300" titleclassName="text-gray-300 mt-[20px] mb-[6px] font-Montserrat text-[20px] font-[500] " />
                        ))
                    }
                </div>

            </div>


        </>

    )
}


export default Home;
