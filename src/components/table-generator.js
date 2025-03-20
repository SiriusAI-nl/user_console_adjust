// Function to generate an HTML table from array data
const generateTable = (title, data, columns) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return '<p class="text-gray-300">No data available for this section.</p>';
    }
  
    let html = '<div class="mb-6">';
    
    // Add title if provided
    if (title) {
      html += `<h3 class="text-lg font-semibold mb-2 text-gray-200">${title}</h3>`;
    }
  
    html += '<div class="overflow-x-auto">';
    html += '<table class="w-full border-collapse bg-opacity-10 bg-white rounded-lg">';
    
    // Table header
    html += '<thead class="bg-white bg-opacity-10">';
    html += '<tr>';
    
    columns.forEach(col => {
      // Format column title
      const formattedCol = col.replace(/_/g, ' ')
                              .split(' ')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ');
      html += `<th class="px-4 py-2 text-left border-b border-gray-600 text-gray-200">${formattedCol}</th>`;
    });
    
    html += '</tr>';
    html += '</thead>';
    
    // Table body
    html += '<tbody>';
    
    data.forEach((row, rowIndex) => {
      html += `<tr class="${rowIndex % 2 === 0 ? 'bg-white bg-opacity-5' : ''}">`; // Alternating row colors
      
      columns.forEach(col => {
        // Handle various data types and formats
        let value = row[col];
        
        // Format values based on type
        if (typeof value === 'number') {
          // Format numbers with commas for thousands
          if (value > 999) {
            value = value.toLocaleString();
          }
        } else if (value === undefined || value === null) {
          value = 'N/A';
        } else if (typeof value === 'string' && value.startsWith('€')) {
          // Format Euro values consistently
          value = value;
        }
  
        html += `<td class="px-4 py-2 border-b border-gray-700 text-gray-300">${value}</td>`;
      });
      
      html += '</tr>';
    });
    
    html += '</tbody>';
    html += '</table>';
    html += '</div>';
    html += '</div>';
    
    return html;
  };
  
  // Function to generate a list from object or array
  const generateList = (data) => {
    if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
      return '<p class="text-gray-300">No data available for this section.</p>';
    }
  
    let html = '<div class="bg-white bg-opacity-5 p-4 rounded-lg mb-6">';
    html += '<ul class="list-disc pl-5 space-y-2">';
  
    if (Array.isArray(data)) {
      // Handle array of strings or objects
      data.forEach(item => {
        if (typeof item === 'string') {
          html += `<li class="text-gray-300">${item}</li>`;
        } else if (typeof item === 'object' && item !== null) {
          // For arrays of objects, display key-value pairs
          const itemText = Object.entries(item)
            .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
            .join(', ');
          html += `<li class="text-gray-300">${itemText}</li>`;
        }
      });
    } else if (typeof data === 'object' && data !== null) {
      // Handle object key-value pairs
      Object.entries(data).forEach(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
        html += `<li class="text-gray-300"><span class="font-medium">${formattedKey}:</span> ${value}</li>`;
      });
    }
  
    html += '</ul>';
    html += '</div>';
    
    return html;
  };
  
  // Function to generate a complete report 
  const generateCompleteReport = (report) => {
    if (!report) {
      return '<p class="text-center text-gray-300">No report data available.</p>';
    }
    
    const overview = report.market_overview || {};
    
    return `
      <div class="p-6 font-sans text-gray-100">
        <h1 class="text-2xl font-bold mb-6 text-center text-white">Swiss Sense Market Analysis</h1>
        
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4 pb-2 border-b border-gray-700">Market Overview</h2>
          <div class="bg-white bg-opacity-5 p-4 rounded-lg mb-4">
            <p class="mb-2"><span class="font-medium">Total Search Volume:</span> ${overview.total_search_volume?.toLocaleString() || 'N/A'}</p>
            <p><span class="font-medium">Total Commercial Value:</span> ${overview.total_commercial_value || 'N/A'}</p>
          </div>
          
          ${generateTable('Segment Breakdown', overview.segment_breakdown || [], ['segment', 'search_volume', 'percentage', 'commercial_value'])}
        </div>
        
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4 pb-2 border-b border-gray-700">Branded vs Non-Branded Keywords</h2>
          ${generateList(report.branded_vs_non_branded || {})}
        </div>
        
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4 pb-2 border-b border-gray-700">Top 10 Keywords by Search Volume & Commercial Value</h2>
          ${generateTable('', report.top_10_keywords || [], ['keyword', 'search_volume', 'commercial_value'])}
        </div>
        
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4 pb-2 border-b border-gray-700">Competitive Positioning</h2>
          ${generateTable('', report.competitive_positioning || [], ['segment', 'top_performer', 'top_performer_exposure', 'swiss_sense_exposure', 'swiss_sense_marktaandeel', 'prestatiekloof'])}
        </div>
        
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4 pb-2 border-b border-gray-700">Strategic Recommendations</h2>
          <div class="bg-white bg-opacity-5 p-4 rounded-lg">
            <h3 class="font-medium mb-2">Targeted Keywords Segments</h3>
            ${generateList(report.strategic_recommendations?.targeted_keywords_segments || [])}
            
            <h3 class="font-medium mb-2 mt-4">Recommended Content Actions</h3>
            ${generateList(report.strategic_recommendations?.recommended_content_actions || [])}
          </div>
        </div>
        
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4 pb-2 border-b border-gray-700">Data Limitations</h2>
          ${generateList(report.data_limitations || {})}
        </div>
      </div>
    `;
  };
  
  // Function to parse JSON data from various response formats
  const parseReportData = (data) => {
    if (!data) return null;
    
    try {
      // Handle string data (JSON string)
      if (typeof data === 'string') {
        // Remove markdown code blocks if present
        const cleanData = data.replace(/```json\n?/g, '').replace(/```$/g, '').trim();
        try {
          return JSON.parse(cleanData);
        } catch (e) {
          console.error("Failed to parse JSON string:", e);
        }
      }
      
      // Handle array response format
      if (Array.isArray(data) && data[0]) {
        const possibleOutputs = [
          data[0].output,
          data[0].data,
          data[0].text,
          data[0]
        ];
        
        for (let output of possibleOutputs) {
          if (!output) continue;
          
          // Handle string outputs
          if (typeof output === 'string') {
            // Strip markdown and try to parse
            const cleanOutput = output.replace(/```json\n?/g, '').replace(/```$/g, '').trim();
            try {
              return JSON.parse(cleanOutput);
            } catch (e) {
              console.warn("Parse attempt failed for string output:", e);
            }
          } 
          // Handle already parsed object
          else if (typeof output === 'object') {
            return output;
          }
        }
      }
      
      // Handle direct object response
      if (typeof data === 'object' && !Array.isArray(data)) {
        // Check for keyword_analysis_report structure
        if (data.keyword_analysis_report) {
          return data;
        }
        
        // Check for MARKET_ANALYSIS_REPORT structure
        if (data.MARKET_ANALYSIS_REPORT) {
          // Convert to expected format
          return {
            keyword_analysis_report: {
              market_overview: {
                total_search_volume: data.MARKET_ANALYSIS_REPORT.MARKET_OVERVIEW?.["Total Search Volume"],
                total_commercial_value: data.MARKET_ANALYSIS_REPORT.MARKET_OVERVIEW?.["Total Commercial Value"],
                segment_breakdown: data.MARKET_ANALYSIS_REPORT.MARKET_OVERVIEW?.Segment_Breakdown_Table?.rows || []
              },
              branded_vs_non_branded: data.MARKET_ANALYSIS_REPORT.BRANDED_VS_NON_BRANDED_KEYWORD_DISTRIBUTION || {},
              top_10_keywords: data.MARKET_ANALYSIS_REPORT.TOP_10_KEYWORDS_BY_SEARCH_VOLUME_COMMERCIAL_VALUE?.rows || [],
              competitive_positioning: data.MARKET_ANALYSIS_REPORT.COMPETITIVE_POSITIONING?.Competitor_Analysis || [],
              strategic_recommendations: {
                targeted_keywords_segments: data.MARKET_ANALYSIS_REPORT.STRATEGIC_RECOMMENDATIONS?.targeted_keywords_segments || [],
                recommended_content_actions: data.MARKET_ANALYSIS_REPORT.STRATEGIC_RECOMMENDATIONS?.recommended_content_actions || []
              },
              data_limitations: data.MARKET_ANALYSIS_REPORT.DATA_LIMITATIONS || []
            }
          };
        }
      }
      
      // Return original data if no parsing was successful
      return data;
    } catch (error) {
      console.error("Error parsing report data:", error);
      return null;
    }
  };
  
  // Modified handleMessage function to properly process the report
  const processMarketingReport = (responseData) => {
    try {
      // Parse the response data
      const parsedData = parseReportData(responseData);
      console.log("Parsed data:", parsedData);
      
      if (!parsedData) {
        return {
          content: "<p>Failed to parse the marketing report data.</p>",
          title: "Marketing Analysis Error"
        };
      }
      
      // Check for HTML report in the response
      if (parsedData?.keyword_analysis_report?.html_report) {
        const htmlReport = parsedData.keyword_analysis_report.html_report;
        
        // Return full HTML report if available
        if (htmlReport.full_report) {
          return {
            content: htmlReport.full_report,
            title: "Swiss Sense Market Analysis"
          };
        }
        
        // Combine progressive sections if full report not available
        if (htmlReport.progressive_sections) {
          const sections = htmlReport.progressive_sections;
          const combinedContent = `
            <div style="padding:20px; font-family: Arial, sans-serif; color:#fff; background: linear-gradient(to right, #6e8efb, #a777e3);">
              <h1 style="text-align:center;">Swiss Sense Market Analysis</h1>
              ${sections.overview || ''}
              ${sections.segments || ''}
              ${sections.keywords || ''}
              ${sections.competition || ''}
              ${sections.recommendations || ''}
            </div>
          `;
          
          return {
            content: combinedContent,
            title: "Swiss Sense Market Analysis"
          };
        }
      }
      
      // If no HTML report, generate one from the data structure
      const report = parsedData?.keyword_analysis_report;
      if (report) {
        return {
          content: generateCompleteReport(report),
          title: "Swiss Sense Market Analysis"
        };
      }
      
      // Fallback to a basic error message
      return {
        content: "<p>Could not generate the marketing report. Invalid data format.</p>",
        title: "Marketing Analysis Error"
      };
    } catch (error) {
      console.error("Error processing marketing report:", error);
      return {
        content: `<p>Error processing the marketing report: ${error.message}</p>`,
        title: "Marketing Analysis Error"
      };
    }
  };
  
  // Export the functions
  export { 
    generateTable, 
    generateList, 
    generateCompleteReport,
    parseReportData,
    processMarketingReport
  };