import React from 'react';
import ChatComponent from '../components/ChatComponent';

const ChatPage = () => {
  return (
    <div className="h-[calc(100vh-80px)] bg-gray-900">
      <div className="container mx-auto h-full px-4 py-6">
        <div className="bg-gray-800 rounded-lg shadow-lg h-full overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 border-b border-gray-700">
            <h1 className="text-xl font-semibold text-white">Bedden & Matrassen Chat</h1>
            <p className="text-gray-400 text-sm">Stel vragen over bedden en matrassen of vraag om een concurrentieanalyse</p>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <ChatComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;