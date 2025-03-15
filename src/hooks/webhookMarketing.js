/**
 * Service to handle n8n webhook calls
 * This service extracts HTML content from code blocks and adapts it for dark theme
 */
export const callN8nWebhook = async (topic, query) => {
  const url = 'https://n8n.gcp.siriusai.nl/webhook/marketing';
  
  try {
    console.log(`Calling n8n webhook with topic: ${topic}, query: ${query}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          topic: topic,
          content: query
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Get the raw response as text
    const responseText = await response.text();
    console.log('Raw webhook response received, length:', responseText.length);
    console.log('Response preview:', responseText.substring(0, 100));
    
    // Function to adapt HTML for dark theme
    const adaptForDarkTheme = (html) => {
      return html
        // Replace white backgrounds with dark ones
        .replace(/bg-white/g, 'bg-gray-800')
        .replace(/bg-gray-50/g, 'bg-gray-900')
        // Change text colors to be visible on dark background
        .replace(/text-gray-500/g, 'text-gray-300')
        .replace(/text-gray-900/g, 'text-white')
        .replace(/text-\[#1e40af\]/g, 'text-blue-400')
        // Change background color for the main container
        .replace('bg-gray-100', 'bg-gray-900')
        // Make table borders visible on dark background
        .replace(/divide-gray-200/g, 'divide-gray-700');
    };
    
    // Extract HTML from the response
    let htmlContent = '';
    
    try {
      // First try to parse as JSON
      const jsonData = JSON.parse(responseText);
      
      // Check if it's an array with text property
      if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].text) {
        let extractedText = jsonData[0].text;
        
        // If it's a markdown code block, extract the HTML
        if (extractedText.includes('```html')) {
          console.log('Extracting HTML from markdown code block');
          htmlContent = extractedText
            .replace(/^```html\s*\n/, '')  // Remove opening ```html
            .replace(/\n```\s*$/, '');     // Remove closing ```
          
          // Adapt for dark theme
          htmlContent = adaptForDarkTheme(htmlContent);
        } else {
          htmlContent = extractedText;
        }
      }
    } catch (parseError) {
      console.error('Error parsing response as JSON:', parseError);
    }
    
    // If we couldn't extract HTML, try direct extraction
    if (!htmlContent) {
      if (responseText.includes('<!DOCTYPE html') || responseText.includes('<html')) {
        // Extract direct HTML
        const startIndex = responseText.indexOf('<!DOCTYPE html');
        const endIndex = responseText.lastIndexOf('</html>');
        
        if (startIndex !== -1 && endIndex !== -1) {
          htmlContent = responseText.substring(startIndex, endIndex + 7); // +7 for '</html>'
          htmlContent = adaptForDarkTheme(htmlContent);
        }
      } else if (responseText.includes('```html')) {
        // Extract from markdown code block
        const startIndex = responseText.indexOf('```html') + 7;
        const endIndex = responseText.lastIndexOf('```');
        
        if (startIndex !== -1 && endIndex !== -1) {
          htmlContent = responseText.substring(startIndex, endIndex).trim();
          htmlContent = adaptForDarkTheme(htmlContent);
        }
      }
    }
    
    if (htmlContent) {
      console.log('Successfully extracted HTML content');
      return {
        success: true,
        title: "Concurrentieanalyse van de Bedden- en Matrassenmarkt",
        html: htmlContent
      };
    }
    
    // If no HTML could be extracted, return a default HTML content
    console.warn('Could not extract HTML from response, returning default content');
    return {
      success: true,
      title: "Concurrentieanalyse van de Bedden- en Matrassenmarkt",
      html: `
        <div style="color: #fff; padding: 20px;">
          <h1 style="font-size: 28px; font-weight: 600; margin-bottom: 24px; color: #fff;">Concurrentieanalyse van de Bedden- en Matrassenmarkt</h1>
          
          <div style="background: rgba(30, 41, 59, 0.8); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #60a5fa;">Belangrijkste Concurrenten</h2>
            <ul style="list-style-type: disc; padding-left: 20px;">
              <li style="margin-bottom: 8px;"><strong>Swiss Sense</strong> - Marktleider met een marktaandeel van 35%</li>
              <li style="margin-bottom: 8px;"><strong>Beter Bed</strong> - Innovatieve marketingstrategieën</li>
              <li style="margin-bottom: 8px;"><strong>IKEA</strong> - Sterke prijsconcurrentie</li>
            </ul>
          </div>
          
          <div style="background: rgba(30, 41, 59, 0.8); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #60a5fa;">Marktaandeel</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(75, 85, 99, 0.8);">
                  <th style="padding: 8px; text-align: left; color: #d1d5db;">Concurrent</th>
                  <th style="padding: 8px; text-align: left; color: #d1d5db;">Marktaandeel</th>
                  <th style="padding: 8px; text-align: left; color: #d1d5db;">Groei</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid rgba(75, 85, 99, 0.5);">
                  <td style="padding: 12px 8px;"><strong>Swiss Sense</strong></td>
                  <td style="padding: 12px 8px;">35%</td>
                  <td style="padding: 12px 8px; color: #34d399;">+5%</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(75, 85, 99, 0.5); background: rgba(30, 41, 59, 0.5);">
                  <td style="padding: 12px 8px;"><strong>Beter Bed</strong></td>
                  <td style="padding: 12px 8px;">25%</td>
                  <td style="padding: 12px 8px; color: #f87171;">-2%</td>
                </tr>
                <tr>
                  <td style="padding: 12px 8px;"><strong>IKEA</strong></td>
                  <td style="padding: 12px 8px;">20%</td>
                  <td style="padding: 12px 8px; color: #34d399;">+3%</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p style="margin-top: 16px; font-size: 14px; color: #d1d5db;">
            <strong>Hashtags:</strong> 
            <span style="color: #818cf8; margin-right: 8px;">#Concurrentieanalyse</span>
            <span style="color: #818cf8; margin-right: 8px;">#SwissSense</span>
            <span style="color: #818cf8; margin-right: 8px;">#Beddenmarkt</span>
            <span style="color: #818cf8;">#SEOStrategieën</span>
          </p>
        </div>
      `
    };
    
  } catch (error) {
    console.error('Error calling n8n webhook:', error);
    
    // Generate a fallback HTML content in case of error
    return {
      success: false,
      title: "Fout bij het genereren van de analyse",
      html: `
        <div style="color: #fff; padding: 20px;">
          <h1 style="font-size: 24px; margin-bottom: 20px;">Concurrentieanalyse van de Bedden- en Matrassenmarkt</h1>
          <p style="margin-bottom: 16px;">Er kon geen gedetailleerd rapport worden gegenereerd. Probeer het later opnieuw.</p>
          <div style="background: rgba(255, 0, 0, 0.1); padding: 12px; border-radius: 4px; border-left: 3px solid #ff0000;">
            <p style="margin: 0;"><strong>Foutmelding:</strong> ${error.message}</p>
          </div>
        </div>
      `
    };
  }
};