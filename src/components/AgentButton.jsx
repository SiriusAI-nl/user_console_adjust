import React from 'react';
import { useNavigate } from 'react-router-dom';

// This component can be used in your Layout component
// to navigate to the agent page when clicked
const AgentButton = () => {
  const navigate = useNavigate();

  const handleAgentClick = () => {
    navigate('/home/agent');
  };

  return (
    <div 
      className="cursor-pointer w-12 h-12 rounded-full bg-[#1a2436] hover:bg-[#2a3649] flex items-center justify-center border border-yellow-500"
      onClick={handleAgentClick}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-white"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </div>
  );
};

export default AgentButton;