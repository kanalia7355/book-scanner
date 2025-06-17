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
  console.log('Converting JAN to ISBN:', janCode);
  
  if (!janCode || janCode.length !== 13) {
    console.log('Invalid JAN code length:', janCode?.length);
    return null;
  }
  
  // 日本図書コード（192, 198, 199, 491など）の処理
  const isJapaneseBookCode = janCode.startsWith('192') || 
                            janCode.startsWith('198') || 
                            janCode.startsWith('199') || 
                            janCode.startsWith('491');
  
  if (isJapaneseBookCode) {
    console.log('Japanese book code detected with prefix:', janCode.substring(0, 3));
    
    const prefix = janCode.substring(0, 3);
    
    // 日本図書コードの構造に基づいた変換パターン
    const conversionPatterns = [
      // パターン1: プレフィックス3桁を除いた残り10桁から9桁を抽出してISBN-13を構築
      () => {
        const digits = janCode.substring(3, 12); // 9桁
        console.log(`Pattern 1 (${prefix}) - Extracted 9 digits:`, digits);
        const isbn13Base = '978' + digits;
        const checkDigit = calculateISBN13CheckDigit(isbn13Base);
        return isbn13Base + checkDigit;
      },
      
      // パターン2: プレフィックス3桁 + 1桁を除いた残り9桁でISBN-13を構築
      () => {
        const digits = janCode.substring(4, 13); // 9桁
        console.log(`Pattern 2 (${prefix}) - Extracted 9 digits from position 4:`, digits);
        const isbn13Base = '978' + digits;
        const checkDigit = calculateISBN13CheckDigit(isbn13Base);
        return isbn13Base + checkDigit;
      },
      
      // パターン3: プレフィックス特別処理 - 192/198/199は異なる構造の可能性
      () => {
        if (prefix === '192' || prefix === '198' || prefix === '199') {
          // 192/198/199の場合の特別処理
          const digits = janCode.substring(3, 12); // 9桁
          console.log(`Pattern 3 (${prefix}) - Special handling for ${prefix}:`, digits);
          
          // 979プレフィックスも試行
          const isbn13Base979 = '979' + digits;
          const checkDigit979 = calculateISBN13CheckDigit(isbn13Base979);
          const isbn13_979 = isbn13Base979 + checkDigit979;
          
          if (validateISBN13(isbn13_979)) {
            return isbn13_979;
          }
          
          // 978プレフィックスでも試行
          const isbn13Base978 = '978' + digits;
          const checkDigit978 = calculateISBN13CheckDigit(isbn13Base978);
          return isbn13Base978 + checkDigit978;
        }
        return null;
      },
      
      // パターン4: 出版社コードを推測しながら変換
      () => {
        const baseDigits = janCode.substring(4, 12); // 8桁
        console.log(`Pattern 4 (${prefix}) - Base digits for publisher guessing:`, baseDigits);
        
        // 日本でよく使われる出版社コードを優先して試行
        const commonPublisherCodes = ['4', '0', '1', '2', '3', '5', '6', '7', '8', '9'];
        
        for (const pubCode of commonPublisherCodes) {
          const isbn13Base = '978' + pubCode + baseDigits;
          const checkDigit = calculateISBN13CheckDigit(isbn13Base);
          const isbn13 = isbn13Base + checkDigit;
          
          if (validateISBN13(isbn13)) {
            console.log(`Pattern 4 success with publisher code ${pubCode}`);
            return isbn13;
          }
        }
        return null;
      }
    ];
    
    // 各パターンを順番に試行
    for (let i = 0; i < conversionPatterns.length; i++) {
      try {
        const result = conversionPatterns[i]();
        if (result && validateISBN13(result)) {
          console.log(`Pattern ${i + 1} success - Generated ISBN-13:`, result);
          return result;
        } else if (result) {
          console.log(`Pattern ${i + 1} generated invalid ISBN:`, result);
        }
      } catch (error) {
        console.error(`Pattern ${i + 1} error:`, error);
      }
    }
    
    console.log(`All patterns failed for ${prefix} JAN code:`, janCode);
  }
  
  console.log('No conversion rule found for JAN code:', janCode);
  return null;
};

// ISBN-13チェックデジットを計算
const calculateISBN13CheckDigit = (isbn12) => {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(isbn12[i]);
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
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