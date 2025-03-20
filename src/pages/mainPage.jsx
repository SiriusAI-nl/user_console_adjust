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
  //import {MarketingReportRenderer} from '@/components/MarketingReportRenderer';
  //import { processMarketingReport } from '@/components/table-generator';
  import { generateTable, generateList } from '@/components/TableUtils';
  import { processMarketingReport } from '@/components/reportUtils';

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
              timeout: 10000000, // 5 minute timeout
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log('Upload progress:', percentCompleted + '%');
              }

              
            });
            const parsedData = response.data;
  setReportContent(generateSafeHtml(parsedData));
  setIsChatLoading(false);
  setIsAIType(false);

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
        console.error("Axios Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
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
    const generateSimplifiedTable = (data, columns) => {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return '<p>No data available.</p>';
      }
      
      let html = '<table style="width:100%; border-collapse:collapse; margin:10px 0; background:rgba(255,255,255,0.1); border-radius:4px;">';
      
      // Header
      html += '<tr>';
      columns.forEach(col => {
        html += `<th style="text-align:left; padding:8px; border-bottom:1px solid rgba(255,255,255,0.2);">${col.replace(/_/g, ' ')}</th>`;
      });
      html += '</tr>';
      
      // Data - limit rows for performance
      const maxRows = Math.min(data.length, 10);
      for (let i = 0; i < maxRows; i++) {
        html += '<tr>';
        columns.forEach(col => {
          html += `<td style="padding:8px;">${data[i][col] || 'N/A'}</td>`;
        });
        html += '</tr>';
      }
      
      html += '</table>';
      return html;
    };
    
    // Function to generate the complete report
    const generateCompleteReport = (report) => {
      if (!report) {
        return '<p>No report data available.</p>';
      }
      
      return `
        <div style="padding:20px; font-family: Arial, sans-serif; color:#fff; background: linear-gradient(to right, #6e8efb, #a777e3);">
          <h1>Swiss Sense Market Analysis</h1>
          
          <div style="display:flex; flex-direction:column; gap:20px;">
            <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:8px;">
              <h2>Market Overview</h2>
              <p>Total Search Volume: ${report?.market_overview?.total_search_volume || 'N/A'}</p>
              <p>Total Commercial Value: ${report?.market_overview?.total_commercial_value || 'N/A'}</p>
            </div>
            
            <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:8px;">
              <h2>Branded vs Non-Branded</h2>
              <ul>
                ${Object.entries(report?.branded_vs_non_branded || {}).map(([key, value]) => 
                  `<li>${key.replace(/_/g, ' ')}: ${value}</li>`
                ).join('')}
              </ul>
            </div>
          </div>
          
          <h2>Top 10 Keywords</h2>
          ${generateSimplifiedTable(report?.top_10_keywords || [], ['keyword', 'search_volume', 'commercial_value'])}
          
          <h2>Trend Analysis</h2>
          ${generateSimplifiedTable(report?.trend_analysis || [], ['segment', '2021', '2022', '2023', '2024', '2025 (partial)', 'YoY Change (explicitly latest available)'])}
          
          <h2>Competitive Positioning</h2>
          ${generateSimplifiedTable(report?.competitive_positioning || [], ['segment', 'top_performer', 'SwissSense.nl_marktaandeel', 'prestatiekloof'])}
          
          <h2>Growth Potential</h2>
          ${generateSimplifiedTable(report?.growth_potential || [], ['segment', 'current_volume', 'commercial_value', 'growth_potential'])}
          
          <h2>Strategic Recommendations</h2>
          <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:8px; margin:15px 0;">
            <ul>
              ${Array.isArray(report?.strategic_recommendations) 
                ? report.strategic_recommendations.map(rec => `<li>${rec}</li>`).join('') 
                : '<li>No recommendations available</li>'}
            </ul>
          </div>
          
          <h2>Data Limitations</h2>
          <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:8px; margin:15px 0;">
            <ul>
              ${Array.isArray(report?.data_limitations) 
                ? report.data_limitations.map(limit => `<li>${limit}</li>`).join('') 
                : '<li>No data limitations specified</li>'}
            </ul>
          </div>
        </div>
      `;
    };

    // Updated Message handler with n8n integration
    // Replace your current handleMessage function with this approach
    // Updated handleMessage function with direct processing (no processReportInChunks reference)
    // Updated handleMessage function with new report rendering approach
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
    // First, immediately show a placeholder report
    setReportTitle("Marketing Analysis");
    setReportType("marketing_analysis");
    setShowDraftReport(true);
    setIsPlanning(true);
    
    // Show a simple placeholder while loading
    setReportContent(`
      <div style="padding:20px; font-family: Arial, sans-serif; color:#fff; background: linear-gradient(to right, #6e8efb, #a777e3);">
        <h1 style="text-align:center;">Swiss Sense Market Analysis</h1>
        <div style="text-align:center; padding:40px 20px;">
          <p style="font-size:16px; margin-bottom:20px;">Analyzing marketing data for SwissSense...</p>
          <p>This may take a minute to complete. The report will appear here automatically.</p>
        </div>
      </div>
    `);

    // Notify user that analysis is underway
    setMessages(prev => [...prev, {
      message: "Je marketinganalyse wordt voorbereid. Een moment geduld alstublieft...",
      sender: "AI"
    }]);

    // Now make the actual API call
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
    // In handleMessage, after the API call
    console.log("API response type:", typeof response.data);
    console.log("API response structure:", Object.keys(response.data));
    console.log("API RESPONSE:", response.data);
    
    // Process the report data
    const reportHtml = processMarketingReport(response.data);
    
    // Update the report content with processed HTML
    setReportContent(reportHtml);

    // Notify user of completion
    setMessages(prev => [...prev, {
      message: "Je marketinganalyse is klaar. Je kunt het rapport aan de rechterkant bekijken.",
      sender: "AI"
    }]);
  } catch (error) {
    console.error("API Error:", error);
    
    // Display error in report
    setReportContent(`
      <div style="padding:20px; font-family: Arial, sans-serif; color:#fff; background: linear-gradient(to right, #6e8efb, #a777e3);">
        <h1 style="text-align:center;">Error Processing Report</h1>
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin-top: 20px;">
          <p><strong>Error Type:</strong> ${error.name}</p>
          <p><strong>Message:</strong> ${error.message}</p>
          <p><strong>Status:</strong> ${error.response?.status || 'Unknown'}</p>
        </div>
      </div>
    `);
    
    // Notify user of error
    setMessages(prev => [...prev, {
      message: `Er is een fout opgetreden bij het genereren van de analyse: ${error.message}`,
      sender: "AI"
    }]);
  } finally {
    setIsType(false);
    setIsChatLoading(false);
    setIsAIType(false);
  }
};


// Function to generate the complete report (called after initial sections are shown)

            
         
    //End of handleMessage function
    const downloadReportAsWord = () => {
      try {
        // Get the HTML content and sanitize it
        const cleanHtml = reportContent ? sanitizeHtml(reportContent) : '';
        
        // Add proper Word document styling
        const wordDocHtml = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                xmlns:w="urn:schemas-microsoft-com:office:word" 
                xmlns="http://www.w3.org/TR/REC-html40">
            <head>
              <meta charset="utf-8">
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <title>Swiss Sense Market Analysis</title>
              <!-- Word-specific styling -->
              <!--[if gte mso 9]>
              <xml>
                <w:WordDocument>
                  <w:View>Print</w:View>
                  <w:Zoom>100</w:Zoom>
                  <w:DoNotOptimizeForBrowser/>
                </w:WordDocument>
              </xml>
              <![endif]-->
              <style>
                /* Basic styling */
                body {
                  font-family: 'Calibri', sans-serif;
                  line-height: 1.5;
                  color: #333;
                  margin: 1cm;
                }
                h1 {
                  font-size: 18pt;
                  color: #2e3192;
                  text-align: center;
                  margin-bottom: 10pt;
                }
                h2 {
                  font-size: 14pt;
                  color: #2e3192;
                  margin-top: 12pt;
                  margin-bottom: 8pt;
                  border-bottom: 1pt solid #ddd;
                  padding-bottom: 4pt;
                }
                p {
                  margin-bottom: 8pt;
                }
                table {
                  border-collapse: collapse;
                  width: 100%;
                  margin-bottom: 10pt;
                }
                th {
                  background-color: #f2f2f2;
                  font-weight: bold;
                  text-align: left;
                  padding: 6pt;
                  border: 1pt solid #ddd;
                }
                td {
                  padding: 6pt;
                  border: 1pt solid #ddd;
                }
                tr:nth-child(even) {
                  background-color: #f9f9f9;
                }
                ul, ol {
                  margin-left: 20pt;
                  margin-bottom: 10pt;
                }
                li {
                  margin-bottom: 4pt;
                }
                /* Convert any background styles to Word-friendly formats */
                .segment-header {
                  background-color: #f0f0f0;
                  padding: 5pt;
                  font-weight: bold;
                }
                .segment-content {
                  padding: 5pt;
                  margin-bottom: 10pt;
                }
              </style>
            </head>
            <body>
              <!-- Clean up the HTML for Word - replace background gradients and colors -->
              ${cleanHtml
                .replace(/background:\s*linear-gradient[^;]+;/g, 'background-color: #ffffff;')
                .replace(/background-color:\s*rgba\([^)]+\)/g, 'background-color: #f8f8f8')
                .replace(/color:\s*#fff|color:\s*white|color:\s*#ffffff/gi, 'color: #333333')
                .replace(/<div style="background: rgba\(255, 255, 255, 0.1\);([^>]*)>/g, '<div class="segment-content" style="$1">')
                .replace(/<table[^>]*>/g, '<table border="1" cellspacing="0" cellpadding="5">')
              }
            </body>
          </html>
        `;
        
        // Create a Blob with the Word-formatted HTML content
        const blob = new Blob([wordDocHtml], { type: 'application/msword;charset=utf-8' });
        
        // Create a link element
        const link = document.createElement('a');
        
        // Set link attributes
        link.href = URL.createObjectURL(blob);
        link.download = 'Swiss_Sense_Market_Analysis.doc';
        
        // Append link to the body
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        console.log('Word document download triggered successfully');
      } catch (error) {
        console.error('Error downloading Word document:', error);
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
    const generateSafeHtml = (data) => {
      try {
        // Get the market analysis data from the response
        const marketData = data.MARKET_ANALYSIS_REPORT || {};
        
        // Extract the relevant sections
        const overview = marketData.MARKET_OVERVIEW || {};
        const segments = overview.Segment_Breakdown_Table?.rows || [];
        const keywordDistribution = marketData.BRANDED_VS_NON_BRANDED_KEYWORD_DISTRIBUTION || {};
        const topKeywords = marketData.TOP_10_KEYWORDS_BY_SEARCH_VOLUME_COMMERCIAL_VALUE?.rows || [];
        const competitivePositioning = marketData.COMPETITIVE_POSITIONING?.Competitor_Analysis || [];
        const growthPotential = marketData.GROWTH_POTENTIAL || "";
        const recommendations = marketData.STRATEGIC_RECOMMENDATIONS || "";
        const limitations = marketData.DATA_LIMITATIONS || [];
        
        return `
          <div style="color: #fff; padding: 20px; font-family: Arial, sans-serif; background: linear-gradient(to right, #6e8efb, #a777e3); border-radius: 10px;">
            <h1 style="text-align:center;">Swiss Sense Market Analysis</h1>
            
            <h2>Market Overview</h2>
            <p>Total Search Volume: ${overview["Total Search Volume"] || "N/A"}</p>
            <p>Total Commercial Value: ${overview["Total Commercial Value"] || "N/A"}</p>
            
            <table style="width:100%; color:white; border-collapse: collapse; margin: 20px 0;">
              <thead style="background:rgba(255,255,255,0.2);">
                <tr>
                  <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Segment</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Search Volume</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Percentage (%)</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Commercial Value (€)</th>
                </tr>
              </thead>
              <tbody>
                ${segments.map(segment => `
                  <tr style="background:rgba(255,255,255,0.05);">
                    <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${segment.Segment || "N/A"}</td>
                    <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${segment["Search Volume"] || "N/A"}</td>
                    <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${segment["Percentage (%)"] || "N/A"}</td>
                    <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${segment["Commercial Value (€)"] || "N/A"}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <h2>Branded vs. Non-Branded Keywords</h2>
            <ul>
              <li>Branded Keywords: ${keywordDistribution["Branded keywords count"] || "0"} (Volume: ${keywordDistribution["Branded keywords volume"] || "0"})</li>
              <li>Non-Branded Keywords: ${keywordDistribution["Non-branded keywords count"] || "0"} (Volume: ${keywordDistribution["Non-branded keywords volume"] || "0"})</li>
            </ul>
            
            <h2>Top 10 Keywords</h2>
            <table style="width:100%; color:white; border-collapse: collapse; margin: 20px 0;">
              <thead style="background:rgba(255,255,255,0.2);">
                <tr>
                  <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Keyword</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Search Volume</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Commercial Value (€)</th>
                </tr>
              </thead>
              <tbody>
                ${topKeywords.map(kw => `
                  <tr style="background:rgba(255,255,255,0.05);">
                    <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${kw.Keyword || "N/A"}</td>
                    <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${kw["Search Volume"] || "N/A"}</td>
                    <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${kw["Commercial Value (€)"] || "N/A"}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <h2>Competitive Positioning</h2>
            <table style="width:100%; color:white; border-collapse: collapse; margin: 20px 0;">
              <thead style="background:rgba(255,255,255,0.2);">
                <tr>
                  <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Segment</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Top Performer</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Top Performer Exposure</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">SwissSense.nl Exposure</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Swiss Sense Market Share (%)</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Performance Gap</th>
                </tr>
              </thead>
              <tbody>
                ${competitivePositioning.map(comp => `
                  <tr style="background:rgba(255,255,255,0.05);">
                    <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${comp.Segment || "N/A"}</td>
                    <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${comp["Top Performer"] || "N/A"}</td>
                    <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${comp["Top Performer Exposure"] || "N/A"}</td>
                    <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${comp["SwissSense.nl Exposure"] || "N/A"}</td>
                    <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${comp["SwissSense.nl Marktaandeel (%)"] || "N/A"}</td>
                    <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1);">${comp.Prestatiekloof || "N/A"}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <h2>Growth Potential</h2>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
              ${growthPotential.split('\n').map(line => `<p>${line}</p>`).join('')}
            </div>
            
            <h2>Strategic Recommendations</h2>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
              ${recommendations.split('\n').map(line => `<p>${line}</p>`).join('')}
            </div>
            
            <h2>Data Limitations</h2>
            <ul style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
              ${Array.isArray(limitations) 
                ? limitations.map(limit => `<li style="margin-bottom: 8px;">${limit.replace(/^- /, '')}</li>`).join('')
                : typeof limitations === 'string' 
                  ? limitations.split('\n').map(line => `<li style="margin-bottom: 8px;">${line.replace(/^- /, '')}</li>`).join('')
                  : '<li>No data limitations provided</li>'
              }
            </ul>
          </div>
        `;
      } catch (error) {
        console.error("HTML Generation Error:", error);
        return `
          <div style="color: white; padding: 20px;">
            <h1>Error Generating Report</h1>
            <p>An error occurred while generating the report: ${error.message}</p>
            <p>Please check the console for more details.</p>
          </div>
        `;
      }
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
            dangerouslySetInnerHTML={{ 
              __html: sanitizeHtml(ensureCompleteHtml(reportContent)) 
            }}
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