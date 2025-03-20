import React, { useEffect, useState } from 'react';
import { generateTable, generateList, parseReportData, processMarketingReport } from './table-generator';
import DOMPurify from 'dompurify';

const MarketingReportRenderer = ({ responseData, isLoading }) => {
  const [report, setReport] = useState({
    content: '',
    title: 'Marketing Analysis',
    isReady: false
  });
  
  // Process report data when it changes
  useEffect(() => {
    if (!responseData) {
      setReport({
        content: '',
        title: 'Marketing Analysis',
        isReady: false
      });
      return;
    }
    
    try {
      // First show loading state
      setReport(prev => ({
        ...prev,
        content: `
          <div style="padding:20px; font-family: Arial, sans-serif; color:#fff; background: linear-gradient(to right, #6e8efb, #a777e3);">
            <h1 style="text-align:center;">Swiss Sense Market Analysis</h1>
            <div style="text-align:center; padding:40px 20px;">
              <p style="font-size:16px; margin-bottom:20px;">Processing marketing data...</p>
              <p>The full report will appear here shortly.</p>
            </div>
          </div>
        `,
        isReady: false
      }));
      
      // Process the data with a slight delay to show loading state
      setTimeout(() => {
        const processedReport = processMarketingReport(responseData);
        
        setReport({
          content: processedReport.content,
          title: processedReport.title,
          isReady: true
        });
      }, 500);
    } catch (error) {
      console.error("Error rendering report:", error);
      setReport({
        content: `
          <div style="color: white; padding: 20px;">
            <h1>Error Processing Report</h1>
            <p><strong>Error:</strong> ${error.message}</p>
            <p>Please check the console for more details.</p>
          </div>
        `,
        title: 'Report Error',
        isReady: true
      });
    }
  }, [responseData]);
  
  // Function to sanitize HTML to prevent XSS
  const sanitizeHtml = (html) => {
    return html ? DOMPurify.sanitize(html) : '';
  };
  
  // Check if HTML may be truncated and fix it
  const ensureCompleteHtml = (html) => {
    if (!html) return html;
    
    // Check if HTML might be truncated
    const openDivs = (html.match(/<div/g) || []).length;
    const closeDivs = (html.match(/<\/div>/g) || []).length;
    
    if (openDivs > closeDivs) {
      // Add missing closing tags
      let fixedHtml = html;
      for (let i = 0; i < (openDivs - closeDivs); i++) {
        fixedHtml += '</div>';
      }
      console.log("Fixed potentially truncated HTML");
      return fixedHtml;
    }
    
    return html;
  };
  
  // Render the report
  return (
    <div className="report-container h-full flex flex-col">
      <div className="report-header flex justify-between items-center px-4 py-3 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">{report.title}</h2>
        {report.isReady && (
          <button className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-1 text-sm rounded-md">
            Download Report
          </button>
        )}
      </div>
      
      <div className="report-content flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Rapport wordt geladen...</p>
            </div>
          </div>
        ) : report.content ? (
          <div 
            className="report-html bg-[#1c1e26] text-white rounded-lg"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(ensureCompleteHtml(report.content)) }}
          />
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400">No report data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingReportRenderer;