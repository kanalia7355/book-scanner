// Google Cloud Vision API integration for barcode detection
import googleAuth from './googleAuth.js';

export const detectBarcodeWithVisionAPI = async (imageData) => {
  try {
    // OAuth2認証を取得
    const accessToken = await googleAuth.authenticate();
    if (!accessToken) {
      console.warn('Failed to authenticate with Google Cloud');
      return null;
    }

    const base64Image = imageData.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    
    const requestBody = {
      requests: [{
        image: {
          content: base64Image
        },
        features: [{
          type: 'TEXT_DETECTION',
          maxResults: 10
        }]
      }]
    };

    const response = await fetch(
      'https://vision.googleapis.com/v1/images:annotate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Vision API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.responses && data.responses[0]) {
      const annotations = data.responses[0].textAnnotations;
      if (annotations && annotations.length > 0) {
        const fullText = annotations[0].description;
        
        // Extract ISBN or JAN codes from detected text
        const codes = extractBarcodeCodes(fullText);
        return codes.length > 0 ? codes : null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Google Vision API error:', error);
    return null;
  }
};

// Extract ISBN and JAN codes from text
const extractBarcodeCodes = (text) => {
  const codes = [];
  
  // Remove spaces and normalize text
  const normalizedText = text.replace(/[\s-]/g, '');
  
  // ISBN-13 pattern (starts with 978 or 979)
  const isbn13Pattern = /(?:978|979)\d{10}/g;
  const isbn13Matches = normalizedText.match(isbn13Pattern);
  if (isbn13Matches) {
    codes.push(...isbn13Matches.map(code => ({ type: 'ISBN', code })));
  }
  
  // ISBN-10 pattern
  const isbn10Pattern = /\b\d{9}[\dX]\b/g;
  const isbn10Matches = normalizedText.match(isbn10Pattern);
  if (isbn10Matches) {
    codes.push(...isbn10Matches.map(code => ({ type: 'ISBN', code })));
  }
  
  // Japanese Book Code (JAN) pattern - starts with 491 or 192
  const janPattern = /(?:491|192)\d{10}/g;
  const janMatches = normalizedText.match(janPattern);
  if (janMatches) {
    codes.push(...janMatches.map(code => ({ type: 'JAN', code })));
  }
  
  return codes;
};

// Convert JAN code to ISBN
export const convertJANtoISBN = (janCode) => {
  // Japanese Book Code (JAN) to ISBN conversion
  if (!janCode || janCode.length !== 13) {
    return null;
  }
  
  // Remove JAN prefix and suffix
  if (janCode.startsWith('491')) {
    // Extract the middle 10 digits which usually contain the ISBN
    const isbnPart = janCode.substring(3, 13);
    
    // Try to reconstruct ISBN-13
    // Most Japanese books use 978 prefix
    const potentialISBN = '978' + isbnPart;
    
    // Validate ISBN checksum
    if (validateISBN13(potentialISBN)) {
      return potentialISBN;
    }
    
    // Try with 979 prefix for newer books
    const alternativeISBN = '979' + isbnPart;
    if (validateISBN13(alternativeISBN)) {
      return alternativeISBN;
    }
  }
  
  // For JAN codes starting with 192 (magazines/periodicals)
  if (janCode.startsWith('192')) {
    return null;
  }
  
  return null;
};

// Validate ISBN-13 checksum
const validateISBN13 = (isbn) => {
  if (!isbn || isbn.length !== 13) {
    return false;
  }
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(isbn[i]);
    if (isNaN(digit)) {
      return false;
    }
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(isbn[12]);
};

// Capture image from video stream for Vision API
export const captureImageFromVideo = (videoElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const context = canvas.getContext('2d');
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  return canvas.toDataURL('image/jpeg', 0.8);
};

// Enhanced barcode detection with fallback
export const enhancedBarcodeDetection = async (imageData) => {
  // Try Vision API first for better accuracy
  const visionResults = await detectBarcodeWithVisionAPI(imageData);
  
  if (visionResults && visionResults.length > 0) {
    // Process results and convert JAN to ISBN if needed
    const processedResults = [];
    
    for (const result of visionResults) {
      if (result.type === 'ISBN') {
        processedResults.push(result.code);
      } else if (result.type === 'JAN') {
        const isbn = convertJANtoISBN(result.code);
        if (isbn) {
          processedResults.push(isbn);
        }
      }
    }
    
    return processedResults.length > 0 ? processedResults[0] : null;
  }
  
  return null;
};