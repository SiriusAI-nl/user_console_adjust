// src/services/webhookService.js

/**
 * Service to handle n8n webhook calls
 * This service handles sending data to the n8n webhook and processing HTML responses
 */
export const callN8nWebhook = async (topic, query) => {
  const url = 'https://n8n.siriusai.nl/webhook-test/pblog';
  
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
    
    // Get the response as text
    const responseText = await response.text();
    
    // The response is HTML, so let's extract useful content
    // Create a simulated JSON response
    return {
      success: true,
      message: "Concurrentieanalyse van de Bedden- en Matrassenmarkt",
      content: responseText,
      // Extract a simple version of the content for display in chat
      summary: extractSummaryFromHtml(responseText)
    };
  } catch (error) {
    console.error('Error calling n8n webhook:', error);
    return {
      success: false,
      message: "Kon geen verbinding maken met de analyse service. Probeer het later opnieuw.",
      error: error.message
    };
  }
};

/**
 * Extract a readable summary from the HTML content
 */
function extractSummaryFromHtml(html) {
  // Simple text extraction - you can enhance this as needed
  let text = html;
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Replace multiple spaces with a single space
  text = text.replace(/\s+/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&amp;/g, '&')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/&nbsp;/g, ' ');
  
  // Trim and limit length
  text = text.trim();
  
  // Extract key sections if possible
  const sections = [];
  
  // Try to find important keywords and extract surrounding content
  const keywords = [
    "Concurrentieanalyse", 
    "Belangrijke Trends", 
    "Duurzaamheid", 
    "Online Verkoop", 
    "Innovatie", 
    "Strategische Aanbevelingen"
  ];
  
  for (const keyword of keywords) {
    const index = text.indexOf(keyword);
    if (index !== -1) {
      // Extract a snippet around the keyword
      const start = Math.max(0, index - 30);
      const end = Math.min(text.length, index + 200);
      const snippet = text.substring(start, end).trim();
      sections.push(snippet);
    }
  }
  
  // If we found sections, join them
  if (sections.length > 0) {
    return sections.join("\n\n");
  }
  
  // Otherwise return a truncated version of the full text
  return text.substring(0, 500) + '...';
}