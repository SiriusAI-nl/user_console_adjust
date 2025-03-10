// src/hooks/webhookService.js

/**
 * Service to handle n8n webhook calls
 * This service handles sending data to the n8n webhook and processing HTML responses
 */
export const callN8nWebhook = async (topic, query) => {
  const url = 'https://n8n.siriusai.nl/webhook/pblog';
  
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
    
    // Get the response as text since it's HTML
    const responseText = await response.text();
    console.log('Webhook response received');
    
    return {
      success: true,
      message: "Concurrentieanalyse van de Bedden- en Matrassenmarkt",
      content: responseText
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