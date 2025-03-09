import React, { useState } from 'react';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';
import { TrendingUp } from "lucide-react";

function Agent() {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFilters, setSelectedFilters] = useState(['Agent']);
  const [activeTab, setActiveTab] = useState('community');

  // Filter categories
  const filterCategories = [
    'Agent', 'Basic', 'Chatbot', 'Customer Support', 'Documents QnA', 
    'Engineering', 'Extraction', 'Finance & Accounting', 'Human In Loop',
    'Image Generation', 'Interacting with API', 'Leads', 'Reflective Agent',
    'SQL', 'Summarization', 'Working with tables'
  ];

  // Agent templates data
  const agentTemplates = [
    {
      id: 1,
      title: 'Conversational Agent',
      description: 'A conversational agent designed to use tools and chat model to provide responses',
      tags: ['Agent', 'Chatbot'],
      features: ['+7 More']
    },
    {
      id: 2,
      title: 'OpenAI Assistant',
      description: 'OpenAI Assistant that has instructions and can leverage models, tools, and knowledge to respond to user queries',
      tags: ['Agent', 'API'],
      features: ['+1 More']
    },
    {
      id: 3,
      title: 'ReAct Agent',
      description: 'An agent that uses ReAct (Reason + Act) logic to decide what action to take',
      tags: ['Agent', 'Reflective Agent'],
      features: ['+2 More']
    },
    {
      id: 4,
      title: 'WebBrowser',
      description: 'Conversational Agent with ability to visit a website and extract information',
      tags: ['Agent', 'Extraction'],
      features: ['+3 More']
    }
  ];

  // Toggle filter selection
  const toggleFilter = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters([]);
  };

  // Filter agent templates based on selected filters
  const filteredTemplates = agentTemplates.filter(template => {
    if (selectedFilters.length === 0) return true;
    return template.tags.some(tag => selectedFilters.includes(tag));
  });

  return (
    <div className="w-full min-h-screen bg-[#030c1c] text-gray-200 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
        <p className="text-gray-400">Discover and deploy AI agent templates</p>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-1/2">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search Name/Description/Node | Ctrl + F"
            className="w-full bg-[#1F2937] text-gray-200 pl-10 pr-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-purple-500"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <select className="bg-[#1F2937] text-gray-200 px-4 py-2 rounded-md border border-gray-700 appearance-none pr-8 focus:outline-none focus:border-purple-500">
              <option>Tag</option>
              <option>Agent</option>
              <option>Chatbot</option>
              <option>API</option>
            </select>
            <div className="absolute right-3 top-3 pointer-events-none">
              <svg className="w-4 h-4 fill-current text-gray-400" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          
          <div className="relative w-full md:w-auto">
            <select className="bg-[#1F2937] text-gray-200 px-4 py-2 rounded-md border border-gray-700 appearance-none pr-8 focus:outline-none focus:border-purple-500">
              <option>Type</option>
              <option>Basic</option>
              <option>Advanced</option>
            </select>
            <div className="absolute right-3 top-3 pointer-events-none">
              <svg className="w-4 h-4 fill-current text-gray-400" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          
          <div className="relative w-full md:w-auto">
            <select className="bg-[#1F2937] text-gray-200 px-4 py-2 rounded-md border border-gray-700 appearance-none pr-8 focus:outline-none focus:border-purple-500">
              <option>Framework</option>
              <option>LangChain</option>
              <option>LlamaIndex</option>
            </select>
            <div className="absolute right-3 top-3 pointer-events-none">
              <svg className="w-4 h-4 fill-current text-gray-400" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          
          <button className="bg-[#1F2937] p-2 rounded-md border border-gray-700 hover:bg-[#2d3748]">
            <FiGrid className="text-blue-500" />
          </button>
          <button className="bg-[#1F2937] p-2 rounded-md border border-gray-700 hover:bg-[#2d3748]">
            <FiList className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 mb-6">
        <div className="flex gap-8">
          <button 
            className={`pb-2 ${activeTab === 'community' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('community')}
          >
            Community Templates
          </button>
          <button 
            className={`pb-2 ${activeTab === 'my' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('my')}
          >
            My Templates
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="mb-6 flex flex-wrap gap-3">
        {filterCategories.map((filter) => (
          <label 
            key={filter} 
            className="flex items-center"
          >
            <input
              type="checkbox"
              checked={selectedFilters.includes(filter)}
              onChange={() => toggleFilter(filter)}
              className="hidden"
            />
            <div 
              className={`px-3 py-1 rounded border cursor-pointer flex items-center gap-2 
                ${selectedFilters.includes(filter) 
                  ? 'bg-green-500 bg-opacity-20 border-green-500 text-white' 
                  : 'bg-transparent border-gray-700 text-gray-400'}`}
            >
              {selectedFilters.includes(filter) && (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
              {filter}
            </div>
          </label>
        ))}

        {selectedFilters.length > 0 && (
          <button 
            onClick={clearAllFilters}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Clear All
          </button>
        )}
      </div>

      {/* Agent cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-[#1F2937] rounded-lg border border-gray-700 hover:border-purple-500 p-6 transition-all">
            <h3 className="text-xl font-semibold mb-2">{template.title}</h3>
            <p className="text-gray-400 mb-4">{template.description}</p>
            <div className="flex items-center gap-2 mt-auto">
              <div className="bg-[#2a3649] p-2 rounded">
                <TrendingUp size={18} className="text-gray-300" />
              </div>
              <div className="bg-[#2a3649] p-2 rounded">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#9CA3AF"/>
                </svg>
              </div>
              <span className="text-gray-400">{template.features[0]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Agent;