import axios from 'axios';

const PDF_API_URL = import.meta.env.VITE_PDF_API_URL;

export const useFileUpload = (setMessages, setIsAIType, setError, setUploadFileBtn) => {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setMessages(prev => [...prev, {
      message: `Uploading file: ${file.name}`,
      sender: "user"
    }]);
    setIsAIType(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${PDF_API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success') {
        setMessages(prev => [...prev, {
          message: `PDF processed successfully. Created collection: ${response.data.collection_name} with ${response.data.pages_processed} pages.`,
          sender: 'AI'
        }]);
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Error uploading file');
      setMessages(prev => [...prev, {
        message: 'Error processing PDF. Please try again.',
        sender: 'AI'
      }]);
    } finally {
      setIsAIType(false);
      setUploadFileBtn(false);
    }
  };

  return handleFileUpload;
};