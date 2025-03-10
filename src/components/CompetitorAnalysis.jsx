import React from 'react';

const CompetitorAnalysisReport = ({ content, title, showDraft, setShowDraft, onClose }) => {
  return (
    <div className="h-full bg-[#1c1e26] overflow-y-auto">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <div className="flex space-x-2">
            <button
              className={`px-4 py-1 text-sm rounded-md ${
                showDraft ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
              onClick={() => setShowDraft(true)}
            >
              First Draft Report
            </button>
            <button
              className={`px-4 py-1 text-sm rounded-md ${
                !showDraft ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
              onClick={() => setShowDraft(false)}
            >
              Final Report
            </button>
            <button
              className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-1 text-sm rounded-md"
              onClick={() => {/* Add download functionality */}}
            >
              Download Report (Excel)
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {content ? (
            <div 
              className="bg-[#1c1e26] text-white"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} 
            />
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-400">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple HTML sanitizer
const sanitizeHtml = (html) => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '');
};

export default CompetitorAnalysisReport;

// Step 3: Update your MainPage.jsx

// 1. Import statements - add these
import { callN8nWebhook } from "@/services/webhookService";
import CompetitorAnalysisReport from "@/components/CompetitorAnalysisReport";

// 2. Add these state variables
const [reportContent, setReportContent] = useState(null);
const [reportTitle, setReportTitle] = useState("");
const [reportType, setReportType] = useState("");
const [showDraftReport, setShowDraftReport] = useState(true);

// 3. Update the handleMessage function with competitor analysis detection
// Update the relevant part of your existing handleMessage function:

const handleMessage = async () => {
  if (isType || !newtext.trim()) return;

  setMessages((prevMessages) => [
    ...prevMessages,
    { message: newtext, sender: "user" },
  ]);
  setIsType(true);
  setNewtext("");
  setIsChatLoading(true);
  setIsAIType(true);

  try {
    // Check if this is a competitor analysis request for beds/mattresses
    const lowerText = newtext.toLowerCase();
    
    // Keywords for competitor analysis on beds and mattresses
    const competitorKeywords = ['competitor', 'concurrentie', 'concurrenten', 'analyse', 'analysis'];
    const productKeywords = ['bed', 'bedden', 'matras', 'matrassen', 'mattress'];
    
    const hasCompetitorKeyword = competitorKeywords.some(keyword => lowerText.includes(keyword));
    const hasProductKeyword = productKeywords.some(keyword => lowerText.includes(keyword));
    
    // If it's a competitor analysis request for beds/mattresses, use n8n webhook
    if (hasCompetitorKeyword && hasProductKeyword) {
      try {
        // Add a message indicating we're generating the report
        setMessages(prev => [...prev, {
          message: "Ik start een concurrentieanalyse voor bedden en matrassen...",
          sender: "AI"
        }]);
        
        // Call the webhook
        const topic = "competitor_analysis";
        const result = await callN8nWebhook(topic, newtext);
        
        if (result.success) {
          // Store the report content and activate the right panel
          setReportContent(result.content);
          setReportTitle("Concurrentieanalyse van de Bedden- en Matrassenmarkt");
          setReportType("competitor_analysis");
          setShowDraftReport(true);
          
          // Notify the user that the report is ready
          setMessages(prev => [...prev, {
            message: "Je concurrentieanalyse is klaar. Je kunt het rapport aan de rechterkant bekijken.",
            sender: "AI"
          }]);
          
          // Show the right panel
          setIsPlanning(true);
          setIsSearchPlan(true);
        } else {
          setMessages(prev => [...prev, {
            message: result.message || "Er is een fout opgetreden bij het uitvoeren van de concurrentieanalyse.",
            sender: "AI"
          }]);
        }
      } catch (error) {
        console.error("n8n webhook error:", error);
        setMessages(prev => [...prev, {
          message: "Er is een fout opgetreden bij het uitvoeren van de concurrentieanalyse. Probeer het later nog eens.",
          sender: "AI"
        }]);
      }
    } else {
      // Regular message handling with WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ message: newtext }));
      } else {
        setError("WebSocket is not connected.");
        setMessages(prev => [...prev, {
          message: "Sorry, de verbinding is verbroken. Probeer het opnieuw.",
          sender: "AI"
        }]);
      }
    }
  } catch (error) {
    // Error handling...
  } finally {
    setIsType(false);
    setIsChatLoading(false);
    setIsAIType(false);
  }
};

// 4. Update the render section to include the report component
// Replace or update your existing AnimatePresence section:

{!isMedium && (
  <AnimatePresence className="md:flex hidden">
    {isPlanning && (
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "60%", opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {reportType === "competitor_analysis" ? (
          <CompetitorAnalysisReport 
            content={reportContent}
            title={reportTitle}
            showDraft={showDraftReport}
            setShowDraft={setShowDraftReport}
            onClose={() => setIsPlanning(false)}
          />
        ) : (
          <Starting isPlanning={isPlanning} setIsPlanning={setIsPlanning} />
        )}
      </motion.div>
    )}
  </AnimatePresence>
)}