import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { callN8nWebhook } from '../services/webhookService';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectCompetitorAnalysisRequest = (text) => {
    // Check if the message is about competitor analysis for beds/mattresses
    const lowerText = text.toLowerCase();
    
    // Dutch keywords for competitor analysis on beds and mattresses
    const competitorKeywords = ['competitor', 'concurrentie', 'concurrenten', 'analyse', 'analysis'];
    const productKeywords = ['bed', 'bedden', 'matras', 'matrassen', 'mattress'];
    
    const hasCompetitorKeyword = competitorKeywords.some(keyword => lowerText.includes(keyword));
    const hasProductKeyword = productKeywords.some(keyword => lowerText.includes(keyword));
    
    return hasCompetitorKeyword && hasProductKeyword;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if this is a competitor analysis request for beds/mattresses
      if (detectCompetitorAnalysisRequest(inputValue)) {
        // Add a system message indicating the n8n workflow is being triggered
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: "Even geduld, ik start een concurrentieanalyse voor bedden en matrassen...",
          sender: 'system',
          timestamp: new Date().toISOString()
        }]);

        // Call the n8n webhook with the appropriate topic and query
        const topic = "competitor_analysis";
        const result = await callN8nWebhook(topic, inputValue);

        // Add response from n8n to the chat
        setMessages(prev => [...prev, {
          id: Date.now() + 2,
          text: result.message || "Hier is je concurrentieanalyse voor bedden en matrassen.",
          sender: 'agent',
          timestamp: new Date().toISOString(),
          attachmentUrl: result.reportUrl, // If n8n returns a report URL
          isReport: true
        }]);
      } else if (inputValue.toLowerCase().includes('zoekraport') || 
                (inputValue.toLowerCase().includes('zoek') && 
                (inputValue.toLowerCase().includes('bed') || inputValue.toLowerCase().includes('matras')))) {
        // Handle search report request
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: "Ik maak een zoekrapport over bedden en matrassen voor je...",
          sender: 'agent',
          timestamp: new Date().toISOString()
        }]);
        
        // Simulate a delay for the search report response
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now() + 2,
            text: "Hier is je zoekrapport over bedden en matrassen.",
            sender: 'agent',
            timestamp: new Date().toISOString(),
            isReport: true
          }]);
          setIsLoading(false);
        }, 2000);
      } else {
        // Normal message handling
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: "Ik kan je helpen met informatie over bedden en matrassen. Wil je een zoekrapport of een concurrentieanalyse?",
          sender: 'agent',
          timestamp: new Date().toISOString()
        }]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Er is een fout opgetreden bij het verwerken van je verzoek. Probeer het later nog eens.",
        sender: 'system',
        timestamp: new Date().toISOString(),
        isError: true
      }]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-purple-600 text-white'
                  : message.sender === 'system'
                  ? 'bg-gray-700 text-gray-200'
                  : 'bg-gray-800 text-white'
              } ${message.isError ? 'border-red-500 border' : ''}`}
            >
              <p>{message.text}</p>
              {message.isReport && (
                <div className="mt-2 p-2 bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-300">Rapport beschikbaar</p>
                  {message.attachmentUrl && (
                    <a 
                      href={message.attachmentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 underline text-sm mt-1 block"
                    >
                      Download rapport
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-3 max-w-xs md:max-w-md">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-700 p-4">
        <div className="flex">
          <textarea
            className="flex-1 bg-gray-800 text-white rounded-l-lg p-2 focus:outline-none resize-none"
            placeholder="Type je bericht..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-r-lg px-4 flex items-center justify-center"
            onClick={handleSendMessage}
            disabled={isLoading}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;