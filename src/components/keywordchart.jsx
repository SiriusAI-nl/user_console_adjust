import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const KeywordChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-[100%] h-90 flex justify-center items-center p-4 bg-[#1F2937] rounded-lg">
        <p className="text-white text-lg">No data available</p>
      </div>
    );
  }

  // Ensure unique data and filter the top 10 by search volume
  const uniqueData = Array.from(new Map(data.map((item) => [item.keyword, item])).values());

  // Sort by search volume and take the top 10
  const top10Data = uniqueData
    .sort((a, b) => b.search_volume - a.search_volume)
    .slice(0, 10);

  return (
    <div className="w-[100%] h-96 flex justify-center items-center bg-[#1F2937] rounded-lg">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={top10Data}
          margin={{
            top: 16,
            right: 16,
            bottom: 20
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="keyword"
            angle={-35}
            textAnchor="end"
            interval={0}
            height={80}
            tick={{
              fontSize: 11,
              fill: "#ffffff",
              dy: 25
            }}
          />
          <YAxis 
            tick={{ 
              fontSize: 11, 
              fill: "#ffffff" 
            }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "#374151",
              border: "none",
              color: "#ffffff"
            }}
          />
          <Legend 
            verticalAlign="top" 
            height={30}
          />
          <Bar
            dataKey="search_volume"
            fill="rgba(103, 58, 183, 0.6)"
            name="Search Volume"
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KeywordChart;