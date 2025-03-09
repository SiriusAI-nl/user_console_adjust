import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import SearchBox from "@/components/searchBox";
import EditSearch from "@/components/editSearch";
import Message from "@/components/Message";
import Starting from "@/components/starting";
import { PiPaperPlaneTiltFill } from "react-icons/pi";
import { FaCircleStop } from "react-icons/fa6";
import axios from "axios";
import {
  FaFileExcel,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
  FaTextWidth,
} from "react-icons/fa";
import { callN8nWebhook } from "@/hooks/webhookService";



const MainPage = ({ setMenuOpen, setIsBtn }) => {
  // State declarations
  const [isPlanning, setIsPlanning] = useState(false);
  const [newtext, setNewtext] = useState("");
  const [isAIType, setIsAIType] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isSearchPlan, setIsSearchPlan] = useState(false);
  const [isType, setIsType] = useState(false);
  const [error, setError] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const [uploadFileBtn, setUploadFileBtn] = useState(false);
  
  // Refs and constants
  const API_URL = import.meta.env.VITE_API_URL;
  const PDF_API_URL = import.meta.env.VITE_PDF_API_URL;
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Toggle upload menu
  const toggleUploadMenu = () => {
    setUploadFileBtn(prev => !prev);
  };
  useEffect(() => {
    console.log('Environment Variables:');
    console.log('PDF API URL:', import.meta.env.VITE_PDF_API_URL);
    console.log('Main API URL:', import.meta.env.VITE_API_URL);
  }, []);

  // File upload handler
  // Update the handleFileUpload function
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  console.log('File selected:', {
    name: file.name,
    size: file.size,
    type: file.type
  });
  console.log('Using PDF API URL:', PDF_API_URL);

  // Update UI first
  setMessages(prev => [...prev, {
    message: `Uploading file: ${file.name}`,
    sender: "user"
  }]);
  setIsAIType(true);

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Add retry logic
    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      try {
        console.log(`Upload attempt ${attempt + 1} to: ${PDF_API_URL}/upload`);
        const response = await axios.post(`${PDF_API_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 300000, // 5 minute timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('Upload progress:', percentCompleted + '%');
          }
        });

        console.log('Upload response:', response.data);

        if (response.data.status === 'success') {
          success = true;
          setMessages(prev => [...prev, {
            message: `PDF processed successfully. Created collection: ${response.data.collection_name} with ${response.data.pages_processed} pages.`,
            sender: 'AI'
          }]);
        }
      } catch (retryError) {
        attempt++;
        if (attempt === maxRetries) throw retryError;
        console.log(`Upload attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }
  } catch (error) {
    console.error('Upload error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: `${PDF_API_URL}/upload`
    });
    
    const errorMessage = error.response?.data?.detail || error.message || 'Error uploading file';
    setError(errorMessage);
    setMessages(prev => [...prev, {
      message: `Error processing PDF: ${errorMessage}`,
      sender: 'AI'
    }]);
  } finally {
    setIsAIType(false);
    setUploadFileBtn(false);
  }
};

  // Message handler
  // Updated handleMessage function to properly handle HTML responses

const handleMessage = async () => {
  if (isType || !newtext.trim()) return;

  // Add message to UI immediately
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
        // Add a message indicating we're using the n8n workflow
        setMessages(prev => [...prev, {
          message: "Even geduld, ik start een concurrentieanalyse voor bedden en matrassen...",
          sender: "AI"
        }]);
        
        // Call the webhook
        const topic = "competitor_analysis";
        const result = await callN8nWebhook(topic, newtext);
        
        if (result.success) {
          // Display the summary in the chat
          setMessages(prev => [...prev, {
            message: result.message,
            sender: "AI"
          }]);
          
          // Add key findings as separate messages for better readability
          if (result.summary) {
            const paragraphs = result.summary.split("\n\n");
            
            // Add a small delay between messages for better user experience
            for (let i = 0; i < paragraphs.length; i++) {
              if (paragraphs[i].trim()) {
                setTimeout(() => {
                  setMessages(prev => [...prev, {
                    message: paragraphs[i],
                    sender: "AI"
                  }]);
                }, i * 300);
              }
            }
          }
          
          // Offer to show the full HTML if needed
          setTimeout(() => {
            setMessages(prev => [...prev, {
              message: "Wil je het volledige rapport bekijken? Ik kan je ook meer specifieke informatie geven over bepaalde aspecten.",
              sender: "AI"
            }]);
          }, (result.summary ? result.summary.split("\n\n").length : 0) * 300 + 300);
          
          setIsSearchPlan(true);
        } else {
          // Handle error
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
    setError("Failed to send message. Please try again.");
    console.error("Message handling error:", error);
    setMessages(prev => [...prev, {
      message: "Er is een fout opgetreden. Probeer het opnieuw.",
      sender: "AI"
    }]);
  } finally {
    setIsType(false);
    setIsChatLoading(false);
    setIsAIType(false);
  }
};
  // Fetch plans
  const fetchPlans = async () => {
    setIsPlansLoading(true);
    try {
      let response = await axios.get(`${API_URL}/api/plan`);
      console.log(response, "data");
    } catch (error) {
      setError("There was an issue with the API request. Please try again.");
    } finally {
      setIsPlansLoading(false);
    }
  };

  // WebSocket setup
  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);

    ws.onopen = () => {
      console.log("WebSocket connection established.");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data, "data from websocket");
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: data.content, sender: "AI" },
      ]);
      setIsAIType(false);
      setIsSearchPlan(true);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection error. Please try again.");
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    wsRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // Initial plans fetch
  useEffect(() => {
    fetchPlans();
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Window resize handling
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMedium, setIsMedium] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsMedium(windowWidth < 768);
  }, [windowWidth]);

  return (
    <div className="sm:static relative flex justify-center px-5 gap-x-5 h-[89vh]">
      <motion.div
        className={`flex flex-col justify-between ${
          isPlanning ? "w-[35%]" : "max-w-[713px]"
        } mx-auto w-full h-full`}
        animate={{ width: isPlanning && !isMedium ? "35%" : "100%" }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-5 w-full h-[90%] overflow-y-auto pt-[10px]">
          {messages.length ? (
            messages.map((arr, index) => (
              <Message key={index} sender={arr.sender} text={arr.message} />
            ))
          ) : (
            <div className="h-[60%] text-center w-full flex flex-col justify-center items-center mt-20">
              <h1 className="sm:text-[40px] text-[22px] font-[600] text-[#fafafa] flex">
                Welcome to
                <span className="text-purple-500">&nbsp;SiriusAI</span>
              </h1>
              <p className="mt-[5px] text-[16px] font-[600] text-[#6E7079]">
                Start a conversation to generate marketing research insights
              </p>
            </div>
          )}
          {isAIType && (
            <div className="flex justify-start my-2">
              <div className="bg-gray-700 p-2 rounded-lg">
                <div className="flex items-center gap-x-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
              <p className="text-white px-2">one moment please....</p>
            </div>
          )}
          <div ref={messagesEndRef} />
          {isSearchPlan && (
            <EditSearch
              setIsPlanning={setIsPlanning}
              isPlanning={isPlanning}
              setMenuOpen={setMenuOpen}
              isPlansLoading={isPlansLoading}
            />
          )}
        </div>
        <form
          className="relative sm:mb-0 mb-3 dark:bg-[#3D3D3D] bg-[#1F2937] border border-gray-700 hover:border-purple-500 w-full rounded-[10px] flex items-center gap-2 px-4 py-2 max-h-[57px] text-gray-300"
          onSubmit={(e) => {
            e.preventDefault();
            handleMessage();
          }}
        >
          <div
            className={`${
              uploadFileBtn ? "scale-y-100" : "scale-y-0"
            } transition-all duration-200 origin-bottom absolute bottom-16 left-0 mt-2 w-72 rounded-md bg-gray-800 p-1 shadow-lg ring-1 ring-black ring-opacity-5`}
          >
            <div className="py-1">
              <label
                htmlFor="txt"
                className="cursor-pointer flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-gray-700"
              >
                <div className="flex items-center gap-3">
                  <FaTextWidth className="h-4 w-4" />
                  Text
                </div>
              </label>
              <label
                htmlFor="worddoc"
                className="cursor-pointer flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-gray-700"
              >
                <FaFileWord className="h-4 w-4" />
                Word document
              </label>
              <label
                htmlFor="excel"
                className="cursor-pointer flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-gray-700"
              >
                <div className="flex items-center gap-3">
                  <FaFileExcel className="h-4 w-4" />
                  Excel 
                </div>
              </label>
              <label
                htmlFor="powerpoint"
                className="cursor-pointer flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-gray-700"
              >
                <FaFilePowerpoint className="h-4 w-4" />
                Powerpoint
              </label>
              <label
                htmlFor="pdf"
                className="cursor-pointer flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-gray-700"
              >
                <div className="flex items-center gap-3">
                  <FaFilePdf className="h-4 w-4" />
                  PDF
                </div>
                <input
  type="file"
  id="pdf"
  accept=".pdf"
  className="hidden"
  onClick={(e) => {
    // Reset the input value to ensure onChange fires even if same file is selected
    e.target.value = null;
  }}
  onChange={(e) => {
    console.log('File input change triggered');
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e);
    } else {
      console.log('No file selected');
    }
  }}
/>
              </label>
            </div>
          </div>
          <button
            type="button"
            className="rounded-full p-1 bg-transparent hover:bg-white/10"
            onClick={toggleUploadMenu}
          >
            <Plus />
          </button>
          <textarea
            type="text"
            placeholder="Ask a follow-up question..."
            className="resize-none flex-grow h-full p-2 border-none outline-none bg-transparent overflow-y-auto max-h-[200px] w-full"
            value={newtext}
            rows={1}
            onChange={(e) => setNewtext(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleMessage();
              }
            }}
          ></textarea>
          <button
            type="submit"
            className={`flex justify-center items-center p-2 rounded-md transition-all duration-300 bg-transparent`}
          >
            {isAIType ? (
              <FaCircleStop className="text-2xl" />
            ) : (
              <PiPaperPlaneTiltFill className="text-2xl text-gray-300" />
            )}
          </button>
        </form>
      </motion.div>
      {!isMedium && (
        <AnimatePresence className="md:flex hidden">
          {isPlanning && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "60%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Starting isPlanning={isPlanning} setIsPlanning={setIsPlanning} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default MainPage;