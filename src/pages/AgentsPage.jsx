import React from 'react';
import { TrendingUp } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import CardGroup from "@/components/card";

function AgentPage() {
    // Sample agent data
    const agentData = {
        name: "Agent #1",
        status: "Active",
        response_time: "1.2s",
        accuracy: "94%",
        queries_handled: 2567,
        last_active: "3 minutes ago"
    };

    // Performance data for charts
    const performanceData = [
        { day: "Monday", queries: 156, resolved: 145 },
        { day: "Tuesday", queries: 178, resolved: 165 },
        { day: "Wednesday", queries: 210, resolved: 192 },
        { day: "Thursday", queries: 190, resolved: 180 },
        { day: "Friday", queries: 230, resolved: 215 },
        { day: "Saturday", queries: 120, resolved: 112 },
        { day: "Sunday", queries: 85, resolved: 82 },
    ];

    const chartConfig = {
        queries: {
            label: "Queries",
            color: "hsl(var(--chart-1))",
        },
        resolved: {
            label: "Resolved",
            color: "hsl(var(--chart-2))",
        },
    };

    // Quick action cards
    const actionCards = [
        {
            icon: "key1.svg",
            title: "Edit Agent",
            desc: "Modify agent settings",
            rightIcon: () => <TrendingUp className="text-gray-300" />
        },
        {
            icon: "people.svg",
            title: "Training Data",
            desc: "View & update training",
            rightIcon: () => <TrendingUp className="text-gray-300" />,
        },
        {
            icon: "slip.svg",
            title: "Response Templates",
            desc: "Manage response formats",
            rightIcon: () => <TrendingUp className="text-gray-300" />
        },
        {
            icon: "graph.svg",
            title: "Performance Analytics",
            desc: "Deep dive into metrics",
            rightIcon: () => <TrendingUp className="text-gray-300" />
        },
        {
            icon: "box.svg",
            title: "Knowledge Base",
            desc: "Update agent knowledge",
            rightIcon: () => <TrendingUp className="text-gray-300" />
        },
        {
            icon: "note.svg",
            title: "API Integration",
            desc: "Manage connections",
            rightIcon: () => <TrendingUp className="text-gray-300" />
        },
    ];

    return (
        <>
            <div id='main' className='max-w-full flex-col pr-[20px] lg:pr-[40px] pl-[20px] md:pl-[20px] lg:pl-[50px] py-8 item-center justify-between bg-[#030c1c]'>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-200 mb-2">{agentData.name}</h1>
                    <p className="text-gray-400">Manage your agent settings and view performance metrics</p>
                </div>
                
                {/* Upper Section with Stats and Chart */}
                <div id='uper-section' className='grid lg:grid-cols-2 gap-8 grid-cols-1 mb-6'>
                    {/* Agent Stats */}
                    <div className="w-full p-4 bg-[#1F2937] flex flex-col justify-between items-center rounded-[10px] h-[50vh] border border-gray-700 hover:border-purple-500">
                        <CardHeader className="w-full">
                            <CardTitle className="text-gray-300">Agent Statistics</CardTitle>
                        </CardHeader>
                        <div className="w-[100%] grid grid-cols-2 gap-4 h-full p-4">
                            <div className="bg-[#2a3649] rounded-lg p-4 flex flex-col justify-center items-center">
                                <p className="text-gray-400 text-sm">Status</p>
                                <h2 className="text-xl font-semibold text-green-500">{agentData.status}</h2>
                            </div>
                            <div className="bg-[#2a3649] rounded-lg p-4 flex flex-col justify-center items-center">
                                <p className="text-gray-400 text-sm">Response Time</p>
                                <h2 className="text-xl font-semibold text-gray-200">{agentData.response_time}</h2>
                            </div>
                            <div className="bg-[#2a3649] rounded-lg p-4 flex flex-col justify-center items-center">
                                <p className="text-gray-400 text-sm">Accuracy</p>
                                <h2 className="text-xl font-semibold text-purple-500">{agentData.accuracy}</h2>
                            </div>
                            <div className="bg-[#2a3649] rounded-lg p-4 flex flex-col justify-center items-center">
                                <p className="text-gray-400 text-sm">Queries Handled</p>
                                <h2 className="text-xl font-semibold text-gray-200">{agentData.queries_handled}</h2>
                            </div>
                            <div className="bg-[#2a3649] rounded-lg p-4 flex flex-col justify-center items-center col-span-2">
                                <p className="text-gray-400 text-sm">Last Active</p>
                                <h2 className="text-xl font-semibold text-gray-200">{agentData.last_active}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Performance Chart */}
                    <div>
                        <Card className="h-[50vh] shadow-none bg-[#1F2937] border border-gray-700 hover:border-purple-500">
                            <CardHeader>
                                <CardTitle className="text-gray-300">Weekly Performance</CardTitle>
                            </CardHeader>

                            <CardContent className="h-full">
                                <ChartContainer config={chartConfig} className="h-[88%] w-full">
                                    <BarChart accessibilityLayer data={performanceData} height="100%">
                                        <CartesianGrid vertical={false} />

                                        <XAxis
                                            dataKey="day"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                            tickFormatter={(value) => value.slice(0, 3)}
                                        />

                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dashed" />}
                                        />

                                        <Bar dataKey="queries" fill="#a854f7" radius={9} />
                                        <Bar dataKey="resolved" fill="#FFFFFF" radius={9} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Lower Section with Action Cards */}
                <div id='lower-section' className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full justify-between gap-[20px]'>
                    {
                        actionCards.map((card, index) => (
                            <CardGroup 
                                key={index} 
                                classMain="group" 
                                title={card.title} 
                                icon={`/images/${card.icon}`} 
                                desc={card.desc} 
                                className="font-Montserrat font-[400] mr-[40px] text-gray-300 group-hover:text-white" 
                                rightIcon={<card.rightIcon />} 
                                classIcon="text-3xl text-gray-300" 
                                titleclassName="text-gray-300 mt-[20px] mb-[6px] font-Montserrat text-[20px] font-[500] " 
                            />
                        ))
                    }
                </div>
            </div>
        </>
    );
}

export default AgentPage;