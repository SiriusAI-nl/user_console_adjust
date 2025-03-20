// Function to generate an HTML table from array data
const generateTable = (title, data, columns) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return '<p style="color: #ccc; font-style: italic;">No data available for this section.</p>';
    }
  
    let html = '<div style="margin-bottom: 20px;">';
    
    // Add title if provided
    if (title) {
      html += `<h3 style="font-size: 18px; font-weight: 600; margin-bottom: 10px; color: #eee;">${title}</h3>`;
    }
  
    html += '<div style="overflow-x: auto;">';
    html += '<table style="width: 100%; border-collapse: collapse; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">';
    
    // Table header
    html += '<thead style="background: rgba(255, 255, 255, 0.1);">';
    html += '<tr>';
    
    columns.forEach(col => {
      // Format column title
      const formattedCol = col.replace(/_/g, ' ')
                              .split(' ')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ');
      html += `<th style="padding: 8px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.2); color: #eee;">${formattedCol}</th>`;
    });
    
    html += '</tr>';
    html += '</thead>';
    
    // Table body
    html += '<tbody>';
    
    data.forEach((row, rowIndex) => {
      html += `<tr style="${rowIndex % 2 === 0 ? 'background: rgba(255, 255, 255, 0.03);' : ''}">`; // Alternating row colors
      
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
        }
  
        html += `<td style="padding: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: #ddd;">${value}</td>`;
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
      return '<p style="color: #ccc; font-style: italic;">No data available for this section.</p>';
    }
  
    let html = '<div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px;">';
    html += '<ul style="list-style-type: disc; padding-left: 20px; margin: 0;">';
  
    if (Array.isArray(data)) {
      // Handle array of strings or objects
      data.forEach(item => {
        if (typeof item === 'string') {
          html += `<li style="color: #ddd; margin-bottom: 8px;">${item}</li>`;
        } else if (typeof item === 'object' && item !== null) {
          // For arrays of objects, display key-value pairs
          const itemText = Object.entries(item)
            .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
            .join(', ');
          html += `<li style="color: #ddd; margin-bottom: 8px;">${itemText}</li>`;
        }
      });
    } else if (typeof data === 'object' && data !== null) {
      // Handle object key-value pairs
      Object.entries(data).forEach(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ')
                               .split(' ')
                               .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                               .join(' ');
        html += `<li style="color: #ddd; margin-bottom: 8px;"><span style="font-weight: 500;">${formattedKey}:</span> ${value}</li>`;
      });
    }
  
    html += '</ul>';
    html += '</div>';
    
    return html;
  };
  
  // Function to ensure HTML is complete (fix unclosed tags)
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
  
  // Export the functions
  export { generateTable, generateList, ensureCompleteHtml };