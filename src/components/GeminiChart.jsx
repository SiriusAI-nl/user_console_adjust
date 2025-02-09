import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const KeywordChart = ({ data }) => {
  // Sort data by search_volume and take top 10 keywords
  const sortedData = [...data]
    .sort((a, b) => b.search_volume - a.search_volume)
    .slice(0, 10);

  return (
    <div className="mt-4">
      <h2 className="text-gray-300 font-semibold text-lg text-center mb-2">
        📊 Top 10 Keywords by Search Volume
      </h2>
      <div className="p-4 bg-[#2d3748] rounded-lg">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={sortedData} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="keyword"
              tick={{ fontSize: 12, fill: "#ffffff" }} // Make labels white
              interval={0} // Show all labels
              angle={-30} // Tilt labels for better fit
              textAnchor="end" // Align to the end for better spacing
            />
            <YAxis tick={{ fill: "#ffffff" }} />
            <Tooltip cursor={{ fill: "rgba(255,255,255,0.1)" }} />
            <Bar dataKey="search_volume" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default KeywordChart;
