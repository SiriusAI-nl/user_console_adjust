  import React, { useEffect, useRef, useState } from "react";
  import { motion, AnimatePresence } from "framer-motion";
  import { Plus } from "lucide-react";
  import SearchBox from "@/components/searchBox";
  import EditSearch from "@/components/editSearch";
  import Message from "@/components/Message";
  import Starting from "@/components/starting";
  import { PiPaperPlaneTiltFill } from "react-icons/pi";
  import { FaCircleStop } from "react-icons/fa6";
  import DOMPurify from 'dompurify'; 
  import axios from "axios";
  import {
    FaFileExcel,
    FaFilePdf,
    FaFilePowerpoint,
    FaFileWord,
    FaTextWidth,
  } from "react-icons/fa";
  // Import the callN8nWebhook function
  import { callN8nWebhook } from "@/hooks/webhookService";

  const safeParseJson = (json) => {
    try {
      return JSON.parse(json);
    } catch (error) {
      console.error("JSON parse error:", error);
      return {};
    }
  };
  
  const sanitizeHtml = (html) => {
    return html ? DOMPurify.sanitize(html) : '';
  };
  // Add this helper function to your MainPage component
  const cleanJsxCode = (response) => {
    if (!response) return '';
    
    // Check if response contains JSON with action and action_input
    if (response.includes('"action":') && response.includes('"action_input":')) {
      try {
        // Try to extract the code from the action_input field
        const match = response.match(/"action_input":\s*"(.+?)(?:\\n)*"/s);
        if (match && match[1]) {
          // Get code and unescape string literals
          let code = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          
          // Remove any markdown code blocks
          code = code.replace(/```[a-z]*\n/g, '').replace(/```$/g, '');
          
          return code;
        }
      } catch (e) {
        console.error("Error parsing JSON response:", e);
      }
    }
    
    // Otherwise, apply normal cleaning
    let cleaned = response;
    
    // Remove markdown code blocks
    cleaned = cleaned.replace(/```[a-z]*\n/g, '').replace(/```$/g, '');
    
    // Remove LLM "thinking" patterns
    cleaned = cleaned.replace(/^(Thought:.+?Action:.+?Observation:.+?)(<html|<!DOCTYPE|import)/s, '$2');
    
    // Remove any JSON blobs
    cleaned = cleaned.replace(/\$JSON_BLOB\s*```json(.+?)```/gs, '');
    
    // Replace ***** with * (fix for multiplication)
    cleaned = cleaned.replace(/\*\*\*\*\*/g, '*');
    
    return cleaned;
  };

  function ensureCompleteHtml(html) {
    if (!html) return html;
    
    // Check if HTML might be truncated
    const isCompleteHtml = 
      html.includes('</div>') && 
      (html.match(/<div/g) || []).length <= (html.match(/<\/div>/g) || []).length;
    
    if (!isCompleteHtml) {
      console.warn("Potentially truncated or malformed HTML detected in report");
      
      // Fix common HTML issues
      let fixedContent = html;
      
      // Close any unclosed div tags
      const openDivs = (fixedContent.match(/<div/g) || []).length;
      const closeDivs = (fixedContent.match(/<\/div>/g) || []).length;
      
      if (openDivs > closeDivs) {
        // Add missing closing tags
        for (let i = 0; i < (openDivs - closeDivs); i++) {
          fixedContent += '</div>';
        }
        console.log("Added missing closing div tags");
      }
      
      return fixedContent;
    }
    
    return html;
  }

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
    
    // New state variables for competitor analysis report
    const [reportContent, setReportContent] = useState(null);
    const [reportTitle, setReportTitle] = useState("");
    const [reportType, setReportType] = useState("");
    const [showDraftReport, setShowDraftReport] = useState(true);
    
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

    useEffect(() => {
      if (reportContent) {
        const openDivs = (reportContent.match(/<div/g) || []).length;
        const closeDivs = (reportContent.match(/<\/div>/g) || []).length;
      
        if (openDivs > closeDivs) {
          // Use a ref to track if we've already fixed this content
          const fixedContent = reportContent + Array(openDivs - closeDivs).fill('</div>').join('');
          
          // Use functional update to prevent dependency loops
          setReportContent(prev => {
            // Only update if the content has changed
            if (prev !== fixedContent) {
              console.log("Fixed malformed HTML");
              return fixedContent;
            }
            return prev;
          });
        }
      }
    }, [reportContent]);
    


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

    // Updated Message handler with n8n integration
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
        const response = await axios({
          method: 'POST',
          url: 'https://n8n.gcp.siriusai.nl/webhook/market-master-2-ui',
          headers: { 'Content-Type': 'application/json' },
          data: { 
            query: { 
              topic: "marketing_analysis", 
              content: newtext 
            } 
          },
          timeout: 500000
        });
    
        // EXTENSIVE LOGGING
        console.log("FULL RESPONSE:", JSON.stringify(response, null, 2));
        console.log("RESPONSE DATA TYPE:", typeof response.data);
        console.log("RESPONSE DATA:", JSON.stringify(response.data, null, 2));
    
        // Extremely defensive parsing
        const parseData = (data) => {
          if (Array.isArray(data) && data[0]) {
            try {
              // Multiple attempts to parse
              const possibleOutputs = [
                data[0].output,
                data[0].data,
                JSON.stringify(data[0])
              ];
    
              for (let output of possibleOutputs) {
                if (!output) continue;
    
                // Remove markdown markers
                output = output
                  .replace(/```json\n?/g, '')
                  .replace(/```$/g, '')
                  .trim();
    
                try {
                  const parsed = JSON.parse(output);
                  console.log("SUCCESSFULLY PARSED:", parsed);
                  return parsed;
                } catch (parseError) {
                  console.warn("Parse attempt failed:", parseError);
                }
              }
            } catch (error) {
              console.error("Parsing Error:", error);
            }
          }
          return data;
        };
    
        const parsedData = parseData(response.data);
    
        // More detailed logging of parsed data
        console.log("PARSED DATA:", JSON.stringify(parsedData, null, 2));
    
        // Extremely defensive HTML generation
        const generateSafeHtml = (data) => {
          try {
            // Multiple paths to find relevant data
            const report = 
              data?.market_analysis_report || 
              data?.report || 
              data?.keyword_analysis_report || 
              data;
    
            const overview = 
              report?.keyword_analysis?.market_overview || 
              report?.market_overview || 
              {};
    
            const segments = 
              overview?.segment_breakdown || 
              overview?.segments || 
              [];
    
            return `
              <div style="color: #fff; padding: 20px; background: linear-gradient(to right, #6e8efb, #a777e3);">
                <h1>Market Analysis Report</h1>
                <p>Total Search Volume: ${overview.total_search_volume || 0}</p>
                <p>Total Commercial Value: ${overview.total_commercial_value || '€0'}</p>
                
                <h2>Segments</h2>
                <table style="width: 100%; color: white;">
                  <thead>
                    <tr>
                      <th>Segment</th>
                      <th>Search Volume</th>
                      <th>Percentage</th>
                      <th>Commercial Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${segments.map(segment => `
                      <tr>
                        <td>${segment.segment || segment.name || 'N/A'}</td>
                        <td>${segment.search_volume || 'N/A'}</td>
                        <td>${segment.percentage || 'N/A'}</td>
                        <td>${segment.commercial_value || 'N/A'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          } catch (error) {
            console.error("HTML Generation Error:", error);
            return `
              <div style="color: white;">
                <h1>Error Generating Report</h1>
                <p>${error.message}</p>
              </div>
            `;
          }
        };
    
        const htmlContent = generateSafeHtml(parsedData);
        
        setReportContent(htmlContent);
        setReportTitle("Marketing Analysis");
        setReportType("marketing_analysis");
        setShowDraftReport(true);
        setIsPlanning(true);
    
        // Notify user of completion
        setMessages(prev => [...prev, {
          message: "Je marketinganalyse is klaar. Je kunt het rapport aan de rechterkant bekijken.",
          sender: "AI"
        }]);
    
      } catch (error) {
        console.error("COMPLETE ERROR:", error);
        
        setReportContent(`
          <div style="color: white; padding: 20px;">
            <h1>Analyse mislukt</h1>
            <p><strong>Fouttype:</strong> ${error.name}</p>
            <p><strong>Foutmelding:</strong> ${error.message}</p>
            <p><strong>Status:</strong> ${error.response?.status || 'Onbekend'}</p>
          </div>
        `);
      } finally {
        setIsType(false);
        setIsChatLoading(false);
        setIsAIType(false);
      }
    };
            
         
    //End of handleMessage function
    const downloadReportAsWord = () => {
      try {
        // Get the HTML content (without tags that would cause issues)
        const cleanHtml = reportContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // Create a Blob with the HTML content
        const blob = new Blob([`
          <html>
            <head>
              <meta charset="utf-8">
              <title>Concurrentieanalyse van de Bedden- en Matrassenmarkt</title>
              <style>
                body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
                h1 { font-size: 24px; color: #333; margin-bottom: 20px; }
                h2 { font-size: 20px; color: #6b46c1; margin-top: 30px; margin-bottom: 15px; }
                h3 { font-size: 16px; font-weight: bold; margin-top: 20px; }
                p { margin-bottom: 12px; }
                ul { margin-left: 20px; }
                li { margin-bottom: 8px; }
                .box { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 15px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                tr:nth-child(even) { background-color: #f9f9f9; }
              </style>
            </head>
            <body>
              ${cleanHtml}
            </body>
          </html>
        `], { type: 'application/vnd.ms-word;charset=utf-8' });
        
        // Create a link element
        const link = document.createElement('a');
        
        // Set link attributes
        link.href = URL.createObjectURL(blob);
        link.download = 'Digital_Insights_Swiss_Sense.docx';
        
        // Append link to the body
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        console.log('Download triggered successfully');
      } catch (error) {
        console.error('Error downloading report:', error);
        alert('Er is een fout opgetreden bij het downloaden van het rapport. Probeer het later nog eens.');
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

    // Simple HTML sanitizer to prevent XSS
    const sanitizeHtml = (html) => {
      // This is a very basic sanitizer
      return html
        ? html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/g, '')
        : '';
    };
    const generateHtmlContent = (data) => {
      // Safely extract data with fallback
      const safeGet = (obj, path, defaultValue = 'Unavailable') => {
        return path.split('.').reduce((acc, part) => 
          acc && acc[part] !== undefined ? acc[part] : defaultValue, obj);
      };
  
      // Extract key data sections
      const keywordAnalysisReport = safeGet(data, 'keyword_analysis_report', {});
      const marketOverview = safeGet(keywordAnalysisReport, 'market_overview', {});
      const competitivePositioning = safeGet(keywordAnalysisReport, 'competitive_positioning', {});
      const trendAnalysis = safeGet(keywordAnalysisReport, 'trend_analysis', {});
      const growthPotential = safeGet(keywordAnalysisReport, 'growth_potential', {});
  
      // Extract specific values
      const totalSearchVolume = safeGet(marketOverview, 'total_search_volume', 'Unavailable');
      const totalCommercialValue = safeGet(marketOverview, 'total_commercial_value', 'Unavailable');
  
      // Segment breakdown
      const segmentBreakdown = safeGet(marketOverview, 'segment_breakdown_table.rows', []);
  
      return `
        <div style="color: #fff; padding: 20px; font-family: Arial, sans-serif; background: linear-gradient(to right, #6e8efb, #a777e3); border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
          <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">
            Marketing Analysis Report
          </h1>
          
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 10px;">Market Overview</h2>
            <p style="font-size: 14px; margin-bottom: 5px;">
              <strong>Total Search Volume:</strong> ${totalSearchVolume}
            </p>
            <p style="font-size: 14px; margin-bottom: 5px;">
              <strong>Total Commercial Value:</strong> ${totalCommercialValue}
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <thead style="background-color: rgba(255,255,255,0.1);">
                <tr style="font-weight: bold;">
                  <th style="padding: 10px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.3);">Segment</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.3);">Volume</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.3);">Value (€)</th>
                </tr>
              </thead>
              <tbody>
                ${segmentBreakdown.map(segment => `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">${segment.Segment || 'N/A'}</td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">${segment.Volume || 'N/A'}</td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">${segment['Value (€)'] || 'N/A'}</td>
                  </tr>
                `).join('') || `
                  <tr>
                    <td colspan="3" style="text-align: center; padding: 20px;">No segment data available</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      `;
    };

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
            {isSearchPlan && reportType !== "competitor_analysis" && (
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
    <AnimatePresence mode="sync" className="md:flex hidden">
      {isPlanning && (
        <motion.div
          key="planning-panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "60%", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {reportType === "competitor_analysis" || reportType === "marketing_analysis" ? (
            <div className="h-full bg-[#1c1e26] overflow-y-auto">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white">{reportTitle}</h2>
                  <div className="flex space-x-2">
                    <button
                      className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-1 text-sm rounded-md"
                      onClick={downloadReportAsWord}
                    >
                      Download Report (Word)
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto">
    {reportContent ? (
      <div 
        className="report-container bg-[#1c1e26] text-white p-4 rounded-lg"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(reportContent) }}
      />
    ) : (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Rapport wordt geladen...</p>
        </div>
      </div>
    )}
  </div>

              </div>
            </div>
          ) : (
            <Starting isPlanning={isPlanning} setIsPlanning={setIsPlanning} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )}
      </div>
    );
  };

  export default MainPage;