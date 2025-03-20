import { generateTable, generateList } from './TableUtils';

// Function to parse API response and generate report HTML
export const processMarketingReport = (data) => {
  console.log("Raw data received in processMarketingReport:", data);
  
  if (!data) return null;
  
  try {
    // Special case for n8n response with nested text field containing JSON string
    if (Array.isArray(data) && data.length > 0 && data[0].keyword_analysis_report && data[0].keyword_analysis_report.text) {
      console.log("Found n8n response with nested text field");
      
      // Extract the text field (contains JSON as string with ```json markup)
      const textField = data[0].keyword_analysis_report.text;
      
      // Remove the markdown json code block markers
      const jsonString = textField
        .replace(/^```json\s*\n/, '')
        .replace(/\n```$/, '')
        .trim();
      
      try {
        // Parse the JSON string
        const parsedTextData = JSON.parse(jsonString);
        console.log("Successfully parsed text field JSON data");
        
        // Extract the report data
        if (parsedTextData.keyword_analysis_report) {
          // If HTML is directly available, use it
          if (parsedTextData.keyword_analysis_report.html) {
            console.log("Using HTML from text field JSON");
            return parsedTextData.keyword_analysis_report.html;
          }
          
          // Otherwise generate HTML from the structure
          const report = parsedTextData.keyword_analysis_report;
          const overview = report.market_overview || {};
          
          // For trend analysis, we need to handle the nested structure
          const trendAnalysis = report.trend_analysis || {};
          const yearlyTrends = trendAnalysis.yearly_trends || [];
          
          // For competitive positioning, use the Competitor Analysis array
          const competitivePositioning = report.competitive_positioning?.["Competitor Analysis"] || [];
          
          console.log("Generating HTML from text field JSON structure");
          return `
            <div style="padding:20px; font-family: Arial, sans-serif; color:#fff; background: linear-gradient(to right, #6e8efb, #a777e3);">
              <h1 style="text-align:center;">Swiss Sense Market Analysis</h1>
        
              <h2>Market Overview</h2>
              <p>Total Search Volume: ${overview.total_search_volume?.toLocaleString() || 'N/A'}</p>
              <p>Total Commercial Value: ${overview.total_commercial_value || 'N/A'}</p>
              ${generateTable('Segments Breakdown', overview.segment_breakdown || [], ['segment', 'search_volume', 'percentage', 'commercial_value'])}
        
              <h2>Branded vs Non-Branded Keywords</h2>
              ${generateList(report.branded_vs_non_branded || {})}
        
              <h2>Top 10 Keywords by Search Volume & Commercial Value</h2>
              ${generateTable('', report.top_10_keywords || [], ['keyword', 'search_volume', 'commercial_value'])}
        
              <h2>Trend Analysis - Yearly Trends</h2>
              ${generateTable('', yearlyTrends, ['segment', '2021', '2022', '2023', '2024', '2025_partial', 'yoy_change'])}
        
              <h2>Competitive Positioning</h2>
              ${generateTable('', competitivePositioning, ['Segment', 'Top Performer', 'Top Performer Exposure', 'SwissSense.nl Exposure', 'SwissSense.nl Marktaandeel (%)', 'Prestatiekloof'])}
        
              <h2>Growth Potential</h2>
              ${generateList(report.growth_potential || [])}
        
              <h2>Strategic Recommendations</h2>
              ${generateList(report.strategic_recommendations || [])}
        
              <h2>Data Limitations</h2>
              ${generateList(report.data_limitations || [])}
            </div>
          `;
        }
      } catch (e) {
        console.error("Error parsing text field JSON:", e);
      }
    }
    
    // Handle string data (JSON string)
    let parsedData = data;
    if (typeof data === 'string') {
      // Remove markdown code blocks if present
      const cleanData = data.replace(/```json\n?/g, '').replace(/```$/g, '').trim();
      try {
        parsedData = JSON.parse(cleanData);
        console.log("Successfully parsed string data");
      } catch (e) {
        console.error("Failed to parse JSON string:", e);
      }
    }
    
    // Handle array response format
    if (Array.isArray(parsedData) && parsedData[0]) {
      console.log("Processing array response format");
      const possibleOutputs = [
        parsedData[0].output,
        parsedData[0].data,
        parsedData[0].text,
        JSON.stringify(parsedData[0])
      ];
      
      for (let output of possibleOutputs) {
        if (!output) continue;
        
        // Handle string outputs
        if (typeof output === 'string') {
          try {
            // Strip markdown and try to parse
            const cleanOutput = output.replace(/```json\n?/g, '').replace(/```$/g, '').trim();
            parsedData = JSON.parse(cleanOutput);
            console.log("Successfully parsed output from array");
            break;
          } catch (e) {
            console.warn("Parse attempt failed for string output:", e);
          }
        } 
        // Handle already parsed object
        else if (typeof output === 'object') {
          parsedData = output;
          console.log("Using object output from array");
          break;
        }
      }
    }
    
    // Check for HTML structure in the response (new format)
    if (parsedData?.keyword_analysis_report?.html_report) {
      console.log("Found HTML report structure in response");
      
      // Extract sections
      const htmlReport = parsedData.keyword_analysis_report.html_report;
      
      // Check if the HTML report contains actual data or is empty
      if (htmlReport.full_report && 
          !htmlReport.full_report.includes("Total Search Volume: 0") && 
          !htmlReport.full_report.includes("No segment data available")) {
        console.log("Using full HTML report");
        return htmlReport.full_report;
      } else if (htmlReport.progressive_sections) {
        // Check if progressive sections contain actual data
        if (!htmlReport.progressive_sections.overview.includes("Total Search Volume: 0") && 
            !htmlReport.progressive_sections.segments.includes("No segment data available")) {
          console.log("Using progressive sections");
          const sections = htmlReport.progressive_sections;
          return `
            <div style="padding:20px; font-family: Arial, sans-serif; color:#fff; background: linear-gradient(to right, #6e8efb, #a777e3);">
              <h1 style="text-align:center;">Swiss Sense Market Analysis</h1>
              ${sections.overview || ''}
              ${sections.segments || ''}
              ${sections.keywords || ''}
              ${sections.competition || ''}
              ${sections.recommendations || ''}
            </div>
          `;
        } else {
          console.log("HTML report contains empty data, looking for alternative data sources");
        }
      }
    }
    
    // Check for HTML in the original content
    if (parsedData?.keyword_analysis_report?.html) {
      console.log("Using HTML from keyword_analysis_report");
      return parsedData.keyword_analysis_report.html;
    }
    
    // If no HTML report, generate one from the data structure
    const report = parsedData?.keyword_analysis_report;
    if (report) {
      console.log("Generating HTML from keyword_analysis_report structure");
      const overview = report.market_overview || {};
      
      // For trend analysis, check if it's nested
      let trendData = [];
      if (report.trend_analysis) {
        if (Array.isArray(report.trend_analysis)) {
          trendData = report.trend_analysis;
        } else if (report.trend_analysis.yearly_trends) {
          trendData = report.trend_analysis.yearly_trends;
        }
      }
      
      // For competitive positioning, handle both flat and nested structures
      let positioningData = [];
      if (report.competitive_positioning) {
        if (Array.isArray(report.competitive_positioning)) {
          positioningData = report.competitive_positioning;
        } else if (report.competitive_positioning["Competitor Analysis"]) {
          positioningData = report.competitive_positioning["Competitor Analysis"];
        }
      }
      
      return `
        <div style="padding:20px; font-family: Arial, sans-serif; color:#fff; background: linear-gradient(to right, #6e8efb, #a777e3);">
          <h1 style="text-align:center;">Swiss Sense Market Analysis</h1>
    
          <h2>Market Overview</h2>
          <p>Total Search Volume: ${overview.total_search_volume?.toLocaleString() || 'N/A'}</p>
          <p>Total Commercial Value: ${overview.total_commercial_value || 'N/A'}</p>
          ${generateTable('Segments Breakdown', overview.segment_breakdown || [], ['segment', 'search_volume', 'percentage', 'commercial_value'])}
    
          <h2>Branded vs Non-Branded Keywords</h2>
          ${generateList(report.branded_vs_non_branded || {})}
    
          <h2>Top 10 Keywords by Search Volume & Commercial Value</h2>
          ${generateTable('', report.top_10_keywords || [], ['keyword', 'search_volume', 'commercial_value'])}
    
          <h2>Trend Analysis</h2>
          ${generateTable('', trendData, ['segment', '2021', '2022', '2023', '2024', '2025_partial', 'yoy_change'])}
    
          <h2>Competitive Positioning</h2>
          ${generateTable('', positioningData, ['Segment', 'Top Performer', 'Top Performer Exposure', 'SwissSense.nl Exposure', 'SwissSense.nl Marktaandeel (%)', 'Prestatiekloof'])}
    
          <h2>Growth Potential</h2>
          ${generateList(report.growth_potential || [])}
    
          <h2>Strategic Recommendations</h2>
          ${generateList(report.strategic_recommendations || [])}
    
          <h2>Data Limitations</h2>
          ${generateList(report.data_limitations || [])}
        </div>
      `;
    }
    
    // Handle format with MARKET_ANALYSIS_REPORT structure
    if (parsedData?.MARKET_ANALYSIS_REPORT) {
      console.log("Generating HTML from MARKET_ANALYSIS_REPORT structure");
      const marketData = parsedData.MARKET_ANALYSIS_REPORT;
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
            ${typeof growthPotential === 'string' 
              ? growthPotential.split('\n').map(line => `<p>${line}</p>`).join('') 
              : Array.isArray(growthPotential)
                ? growthPotential.map(item => `<p>${item}</p>`).join('')
                : '<p>No growth potential data provided</p>'}
          </div>
          
          <h2>Strategic Recommendations</h2>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
            ${typeof recommendations === 'string' 
              ? recommendations.split('\n').map(line => `<p>${line}</p>`).join('') 
              : Array.isArray(recommendations) 
                ? recommendations.map(rec => `<p>${rec}</p>`).join('') 
                : '<p>No recommendations available</p>'}
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
    }
    
    // Fallback to showing the raw data for debugging
    console.log("Could not determine data format, showing debug view");
    return `
      <div style="padding:20px; font-family: Arial, sans-serif; color:#fff; background: linear-gradient(to right, #6e8efb, #a777e3);">
        <h1 style="text-align:center;">Swiss Sense Market Analysis</h1>
        <div style="text-align:center; padding:20px; background:rgba(255,255,255,0.1); border-radius:8px; margin-bottom:20px;">
          <p style="font-size:16px; margin-bottom:20px;">Could not determine the data format.</p>
          <p>The API returned data in an unexpected format. Check the console for more details.</p>
        </div>
        
        <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:8px; margin-top:20px;">
          <h3>Raw Data (First 500 chars)</h3>
          <pre style="color:#ddd; white-space:pre-wrap; font-size:12px; overflow:auto; max-height:200px;">${
            JSON.stringify(data).substring(0, 500) + (JSON.stringify(data).length > 500 ? '...' : '')
          }</pre>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error processing marketing report:", error);
    return `
      <div style="padding:20px; font-family: Arial, sans-serif; color:#fff; background: linear-gradient(to right, #6e8efb, #a777e3);">
        <h1 style="text-align:center;">Error Processing Report</h1>
        <div style="text-align:center; padding:40px 20px; background:rgba(255,255,255,0.1); border-radius:8px;">
          <p style="font-size:16px; margin-bottom:20px;">Error: ${error.message}</p>
          <p>Please check the console for more details.</p>
        </div>
      </div>
    `;
  }
};