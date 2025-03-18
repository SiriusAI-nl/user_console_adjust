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

const sanitizeHtml = (html) => {
  return html ? DOMPurify.sanitize(html) : '';
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
      // Check if this is a competitor analysis request for beds/mattresses
      const lowerText = newtext.toLowerCase();
      
      // Keywords for competitor analysis on beds and mattresses
      const competitorKeywords = ['competitor', 'concurrentie', 'concurrenten', 'analyse', 'analysis'];
      const productKeywords = [
        'bed', 'bedden', 'matras', 'matrassen', 'mattress',
        'slaap', 'slapen', 'slaapkamer'
      ];
  
      const marketingKeywords = [
        'marketing', 'branding', 'promotie', 'promotion', 'campagne', 
        'campaign', 'strategie', 'rapport'
      ];
    
      
      const hasCompetitorKeyword = competitorKeywords.some(keyword => lowerText.includes(keyword));
      const hasProductKeyword = productKeywords.some(keyword => lowerText.includes(keyword));
      const hasMarketingKeyword = marketingKeywords.some(keyword => lowerText.includes(keyword));
      
      // Use a simple check - either it contains "marketing" explicitly or we force it to use a topic
      const isExplicitMarketingRequest = lowerText.includes('marketing');
      //const shouldUseWebhook = (hasCompetitorKeyword && hasProductKeyword) || hasMarketingKeyword;
      const shouldUseWebhook = true;
      if (shouldUseWebhook) {
        console.log("Request analysis:", {
          text: newtext,
          lowerText,
          hasCompetitorKeyword,
          hasProductKeyword,
          hasMarketingKeyword,
          matchedMarketingKeywords: marketingKeywords.filter(kw => lowerText.includes(kw)),
          matchedProductKeywords: productKeywords.filter(kw => lowerText.includes(kw))
        });
        
        // If it's a marketing analysis request, use a direct API call instead of callN8nWebhook
        if (isExplicitMarketingRequest) {
          const analysisMessage = "Ik start een marketinganalyse...";
          const analysisReadyMessage = "Je marketinganalyse is klaar. Je kunt het rapport aan de rechterkant bekijken.";
          const defaultTitle = "Marketinganalyse Rapport";
            const reportTypeValue = "marketing_analysis";
          try {
            
            
            // Log that we're processing a marketing analysis with direct API call
            console.log("Processing MARKETING analysis request with direct API call");
            
            // Add a message indicating we're starting the analysis
            setMessages(prev => [...prev, {
              message: analysisMessage,
              sender: "AI"
            }]);
            // Show a loading report initially
            setReportContent(`
            <div style="color: #fff; padding: 20px;">
            <h1 style="font-size: 24px; margin-bottom: 20px;">${defaultTitle}</h1>
            <p>De marketinganalyse wordt gegenereerd...</p>
            <div style="display: flex; justify-content: center; margin: 30px 0;">
            <div style="width: 50px; height: 50px; border: 5px solid #333; border-radius: 50%; border-top-color: #60a5fa; animation: spin 1s linear infinite;"></div>
            </div>
            <style>
            @keyframes spin { to { transform: rotate(360deg); } }
            </style>
            </div>
            `);
            setReportTitle(defaultTitle);
            setReportType(reportTypeValue);
            setShowDraftReport(true);
            setIsPlanning(true);
            
            // Direct API call to the marketing webhook
            const response = await axios({
              method: 'POST',
              url: 'https://n8n.gcp.siriusai.nl/webhook/master_multi_agent',
              headers: {
                'Content-Type': 'application/json',
              },
              data: {
                query: {
                  topic: "marketing_analysis",
                  content: newtext
                }
              },
              timeout: 500000 // 2 minutes timeout
            });
            const checkStatus = async (jobId) => {
              const status = await axios.get(`${API_URL}/status/${jobId}`);
              if (status.data.complete) {
                // Now show the completion message
                setMessages(prev => [...prev, {
                  message: analysisReadyMessage,
                  sender: "AI"
                }]);
              } else {
                // Check again in a few seconds
                setTimeout(() => checkStatus(jobId), 3000);
              }
            };
            console.log("Marketing API response received");
            console.log("Response status:", response.status);
            console.log("Response type:", typeof response.data);
            console.log("RAW RESPONSE:", response);
            
            // Better content extraction logic
            console.log("Marketing API response received");
console.log("Response status:", response.status);
console.log("Response type:", typeof response.data);
// Replace the problematic content extraction code with this fixed version
// Starting around line 303-305

console.log("Marketing API response received");
console.log("Response status:", response.status);
console.log("Response type:", typeof response.data);


console.log("Marketing API response received");
console.log("Response status:", response.status);

// Log the complete raw response for debugging
console.log("RAW RESPONSE:", response);

// Define responseData and initialize with fallback content
const responseData = response.data;
let contentFound = false;
let htmlContent = `
  <div style="color: #fff; padding: 20px; font-family: Arial, sans-serif;">
    <h1 style="font-size: 24px; margin-bottom: 20px;">${defaultTitle}</h1>
    <div style="background-color: rgba(255, 0, 0, 0.1); padding: 16px; border-radius: 8px; border-left: 4px solid #ff5555; margin-bottom: 20px;">
      <h2 style="color: #ff5555; margin-top: 0;">Geen content gevonden</h2>
      <p>Er kon geen content worden opgehaald uit de API-respons. Probeer het later opnieuw.</p>
    </div>
  </div>
`;
console.log("Full response:", JSON.stringify(responseData, null, 2));

// Try all possible ways to extract content
try {
  if (Array.isArray(responseData) && responseData.length > 0) {
    console.log("Response is an array with", responseData.length, "items");
    
    // Check the first item for the output field
    const firstItem = responseData[0];
    if (firstItem && firstItem.output) {
      const outputText = firstItem.output;
      
      // Convert the markdown-like text to HTML
      htmlContent = `
        <div style="color: #fff; padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="font-size: 24px; margin-bottom: 20px;">${defaultTitle}</h1>
          <div style="background-color: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 16px; margin-bottom: 20px; line-height: 1.6;">
            ${formatContentToHtml(outputText)}
          </div>
        </div>
      `;
      contentFound = true;
      console.log("Extracted content from array[0].output");
    }
  }

  else if (responseData && responseData.output) {
    // Get the output text and replace newlines with <br> tags
    const outputText = responseData.output;
    
    // Format text into HTML with proper styling
    htmlContent = `
      <div style="color: #fff; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="font-size: 24px; margin-bottom: 20px;">${defaultTitle}</h1>
        <div style="background-color: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 16px; margin-bottom: 20px; line-height: 1.6;">
          ${formatContentToHtml(outputText)}
        </div>
      </div>
    `;
    contentFound = true;
    console.log("Extracted and formatted content from output field");
  }
  else if (typeof responseData === 'string') {
    // If the entire response is a string
    htmlContent = `
      <div style="color: #fff; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="font-size: 24px; margin-bottom: 20px;">${defaultTitle}</h1>
        <div style="background-color: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          ${responseData.replace(/\n/g, '<br>')}
        </div>
      </div>
    `;
    contentFound = true;
    console.log("Using direct response string");
  } 
  else if (responseData && typeof responseData === 'object') {
    console.log("Response keys:", Object.keys(responseData));
    
    // First, check for output which is what your n8n is returning
    if (responseData.output) {
      const outputText = responseData.output;
      htmlContent = `
        <div style="color: #fff; padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="font-size: 24px; margin-bottom: 20px;">${defaultTitle}</h1>
          <div style="background-color: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 16px; margin-bottom: 20px; line-height: 1.6; white-space: pre-wrap;">
            ${outputText}
          </div>
        </div>
      `;
      contentFound = true;
      console.log("Extracted content from output field");
    }
    
    // Then check for nested data or other fields if needed
    else {
      const possibleFields = ['html', 'text', 'output', 'content', 'result', 'data', 'message', 'response'];
      for (const field of possibleFields) {
        if (responseData[field]) {
          const fieldContent = responseData[field];
          const textContent = typeof fieldContent === 'string' ? fieldContent : JSON.stringify(fieldContent, null, 2);
          
          htmlContent = `
            <div style="color: #fff; padding: 20px; font-family: Arial, sans-serif;">
              <h1 style="font-size: 24px; margin-bottom: 20px;">${defaultTitle}</h1>
              <div style="background-color: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 16px; margin-bottom: 20px; line-height: 1.6; white-space: pre-wrap;">
                ${textContent.replace(/\n/g, '<br>')}
              </div>
            </div>
          `;
          contentFound = true;
          console.log(`Extracted content from ${field} field`);
          break;
        }
      }
    }
    
    // If nothing matched, but we have a valid response, show the raw data
    if (!contentFound && Object.keys(responseData).length > 0) {
      htmlContent = `
        <div style="color: #fff; padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="font-size: 24px; margin-bottom: 20px;">${defaultTitle}</h1>
          <div style="background-color: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 16px; margin-bottom: 20px; line-height: 1.6;">
            <h3>Ruwe API-gegevens:</h3>
            <pre style="white-space: pre-wrap; overflow-wrap: break-word;">${JSON.stringify(responseData, null, 2)}</pre>
          </div>
        </div>
      `;
      contentFound = true;
      console.log("Using raw response data");
    }
  }
} catch (extractionError) {
  console.error("Error during content extraction:", extractionError);
}
// Helper function to convert the markdown-like format to HTML
// Better HTML formatting function for the report
// Better HTML formatting function for the report
// Better HTML formatting function for the report
function formatContentToHtml(text) {
  if (!text) return '';
  
  let html = text;
  
  // Step 1: Extract sections by finding all bold headings
  const sections = [];
  const sectionRegex = /\*\*(.*?)\*\*/g;
  let match;
  let lastIndex = 0;
  
  // Find all section headings
  while ((match = sectionRegex.exec(html)) !== null) {
    const headingText = match[1];
    const startIndex = match.index;
    
    // If this isn't the first heading, add the previous section's content
    if (startIndex > lastIndex) {
      const prevHeadingEnd = lastIndex > 0 ? lastIndex + sections[sections.length - 1].heading.length + 4 : 0;
      const content = html.substring(prevHeadingEnd, startIndex).trim();
      
      if (sections.length > 0) {
        sections[sections.length - 1].content = content;
      }
    }
    
    sections.push({
      heading: headingText,
      content: '',
      index: startIndex
    });
    
    lastIndex = startIndex;
  }
  
  // Add the content for the last section
  if (sections.length > 0) {
    const lastSection = sections[sections.length - 1];
    const startIndex = lastSection.index + lastSection.heading.length + 4; // +4 for the '**' on both sides
    lastSection.content = html.substring(startIndex).trim();
  }
  
  // Step 2: Convert each section to properly formatted HTML
  let formattedHtml = '';
  
  for (const section of sections) {
    // Format the section heading (main sections vs subsections)
    let headingHtml = '';
    
    if (section.heading === 'Eindrapport: Online Strategie voor Swiss Sense' || 
        section.heading === 'Marketinganalyse Rapport') {
      // Main title
      headingHtml = `<h1 class="text-2xl font-bold text-white mb-4">${section.heading}</h1>`;
    } else {
      // Section heading
      headingHtml = `<h2 class="text-xl font-bold text-blue-400 mt-6 mb-3">${section.heading}</h2>`;
    }
    
    // Format the section content
    let contentHtml = section.content;
    
    // Format bullet points
    if (contentHtml.includes('*   ')) {
      // Start a list
      let listHtml = '<ul class="list-disc pl-6 space-y-2 my-3">';
      
      // Split by bullet points
      const listItems = contentHtml.split('*   ').filter(item => item.trim());
      
      for (const item of listItems) {
        // Clean up the list item and add it to the HTML
        const cleanItem = item.trim();
        listHtml += `<li>${cleanItem}</li>`;
      }
      
      // Close the list
      listHtml += '</ul>';
      
      // Replace the original bulleted text with the HTML list
      contentHtml = listHtml;
    } else {
      // For regular paragraphs, add spacing
      const paragraphs = contentHtml.split('\n\n');
      contentHtml = paragraphs.map(p => `<p class="mb-3">${p.replace(/\n/g, '<br>')}</p>`).join('');
    }
    
    // Add the formatted section to the output
    formattedHtml += headingHtml + contentHtml;
  }
  
  // If there are no sections (unusual case), just format the whole text
  if (sections.length === 0) {
    formattedHtml = `<p>${html.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
  }
  
  // Final formatting touches for specific sections
  formattedHtml = formattedHtml
    // Style market share data
    .replace(/Swiss Sense market share: ([\d.]+)%/g, 'Swiss Sense market share: <span class="text-green-400 font-bold">$1%</span>')
    // Highlight competitors
    .replace(/(Leading competitor:) ([^<]+)/g, '$1 <span class="text-yellow-300">$2</span>')
    // Format strong performers
    .replace(/(Swiss Sense is a strong performer)/g, '<span class="text-green-400">$1</span>')
    // Highlight exposure metrics
    .replace(/(Exposure: [\d,]+)/g, '<span class="text-gray-400">$1</span>');
  
  return `<div class="bg-gray-800 text-white p-4 rounded-lg">${formattedHtml}</div>`;
}

// To use this in your code:
if (Array.isArray(responseData) && responseData.length > 0) {
  console.log("Response is an array with", responseData.length, "items");
  
  // Check the first item for the output field
  const firstItem = responseData[0];
  if (firstItem && firstItem.output) {
    const outputText = firstItem.output;
    
    // Convert the markdown-like text to HTML with enhanced formatting
    htmlContent = formatContentToHtml(outputText);
    contentFound = true;
    console.log("Extracted and formatted content from array[0].output");
  }
}

// Set the report content
setReportContent(ensureCompleteHtml(htmlContent));

// Final check - if we still don't have content, set a clear error message
if (!contentFound) {
  console.warn("No content could be extracted from the response");
}

// Set the report content
setReportContent(ensureCompleteHtml(htmlContent));



// Log the final content
console.log("Final HTML content length:", htmlContent?.length || 0);
if (htmlContent?.length > 0) {
  console.log("HTML content preview:", htmlContent.substring(0, 200));
}

// Set report content once, after all processing is done
setReportContent(ensureCompleteHtml(htmlContent));
setReportTitle(defaultTitle);
setReportType(reportTypeValue);
setShowDraftReport(true);
setIsPlanning(true);

// Update the user message based on content found
setMessages(prev => [...prev, {
  message: contentFound ? 
    analysisReadyMessage : 
    "Er is een beperkt rapport gegenereerd. Je kunt het bekijken aan de rechterkant, maar probeer het later nog eens voor een vollediger resultaat.",
  sender: "AI"
}]);

            
          } catch (error) {
            console.error("Marketing API error:", error);
            // Create more informative error report
            const errorReport = `
              <div style="color: #fff; padding: 20px; font-family: Arial, sans-serif;">
                <h1 style="font-size: 24px; margin-bottom: 20px;">Marketinganalyse Rapport</h1>
                <div style="background: rgba(255, 0, 0, 0.1); padding: 16px; border-radius: 8px; border-left: 4px solid #ff0000; margin-bottom: 20px;">
                  <h2 style="margin-top: 0; color: #ff5555;">Er is een fout opgetreden</h2>
                  <p><strong>Fouttype:</strong> ${error.name || 'Unknown Error'}</p>
                  <p><strong>Foutmelding:</strong> ${error.message || 'Geen details beschikbaar'}</p>
                  <p><strong>Status:</strong> ${error.response?.status || 'N/A'}</p>
                </div>
                <div style="margin-top: 20px;">
                  <h3>Suggesties om het probleem op te lossen:</h3>
                  <ul style="list-style-type: disc; margin-left: 20px; line-height: 1.5;">
                    <li>Controleer je internetverbinding</li>
                    <li>Vernieuw de pagina en probeer het opnieuw</li>
                    <li>Als het probleem aanhoudt, probeer het later nog eens</li>
                  </ul>
                </div>
              </div>
            `;
            
            setReportContent(errorReport);
            setReportTitle(defaultTitle);
            setReportType(reportTypeValue);
            setShowDraftReport(true);
            setIsPlanning(true);
            
            setMessages(prev => [...prev, {
              message: "Er is een fout opgetreden bij het uitvoeren van de marketinganalyse. Je kunt de details bekijken in het rapport aan de rechterkant.",
              sender: "AI"
            }]);
          }
        } 
          
         else {
          // For competitor analysis, use the existing webhook function
          try {
            const analysisMessage = "Ik start een concurrentieanalyse voor bedden en matrassen...";
            const analysisReadyMessage = "Je concurrentieanalyse is klaar. Je kunt het rapport aan de rechterkant bekijken.";
            const defaultTitle = "Concurrentieanalyse van de Bedden- en Matrassenmarkt";
            const reportTypeValue = "competitor_analysis";
            
            // Log that we're processing a competitor analysis
            console.log("Processing COMPETITOR analysis request");
            
            // Add a message indicating we're using the n8n workflow
            setMessages(prev => [...prev, {
              message: analysisMessage,
              sender: "AI"
            }]);
            
            // Call the webhook and process the response
            const webhookResponse = await callN8nWebhook("competitor_analysis", newtext);
            console.log("Webhook response received:", webhookResponse);
              
            if (webhookResponse && webhookResponse.html) {
              // Use the HTML content from the webhook response
              setReportContent(webhookResponse.html);
              setReportTitle(webhookResponse.title || defaultTitle);
              setReportType(reportTypeValue);
              setShowDraftReport(true);
              
              // Set the planning state to true to show the right panel
              setIsPlanning(true);
              
              // Notify the user that the report is ready
              setMessages(prev => [...prev, {
                message: analysisReadyMessage,
                sender: "AI"
              }]);
            } else {
              console.error("Invalid webhook response format:", webhookResponse);
              // Fallback content in case the webhook doesn't return the expected format
              setReportContent(`
                <div style="color: #fff; padding: 20px;">
                  <h1 style="font-size: 24px; margin-bottom: 20px;">${defaultTitle}</h1>
                  <p>Er kon geen gedetailleerd rapport worden gegenereerd. Probeer het later opnieuw.</p>
                </div>
              `);
              setReportTitle(defaultTitle);
              setReportType(reportTypeValue);
              setShowDraftReport(true);
              setIsPlanning(true);
              
              // Notify the user about the issue
              setMessages(prev => [...prev, {
                message: "Er is een probleem opgetreden bij het genereren van de analyse, maar ik heb een eenvoudig rapport gemaakt dat je aan de rechterkant kunt bekijken.",
                sender: "AI"
              }]);
            }
          } catch (error) {
            console.error("n8n webhook error:", error);
            setMessages(prev => [...prev, {
              message: "Er is een fout opgetreden bij het uitvoeren van de analyse. Probeer het later nog eens.",
              sender: "AI"
            }]);
          }
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
      link.download = 'Concurrentieanalyse_Bedden_Matrassen.doc';
      
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