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
  
  // JANコードが491で始まる場合（日本図書コード）
  if (janCode.startsWith('491')) {
    // 複数のパターンを試行
    
    // パターン1: 491 + 出版社コード(1桁) + ISBN-10の9桁 + JANチェックデジット
    // ISBN-10の9桁を抽出（4-12桁目）
    const isbn10Part1 = janCode.substring(4, 12); // 8桁
    console.log('Pattern 1 - ISBN-10 part (8 digits):', isbn10Part1);
    
    // 978プレフィックスでISBN-13を構築
    const isbn13Base1 = '978' + isbn10Part1; // 11桁
    console.log('Pattern 1 - ISBN-13 base (11 digits):', isbn13Base1);
    
    // チェックデジットを計算するために、足りない桁を推測
    // 日本の出版社コードを推測して試行
    for (let publisherDigit = 0; publisherDigit <= 9; publisherDigit++) {
      const isbn13Base = '978' + publisherDigit + isbn10Part1; // 12桁
      const checkDigit = calculateISBN13CheckDigit(isbn13Base);
      const isbn13 = isbn13Base + checkDigit;
      
      if (validateISBN13(isbn13)) {
        console.log('Pattern 1 success - Generated ISBN-13:', isbn13);
        return isbn13;
      }
    }
    
    // パターン2: より直接的な変換
    // JANコードの中間部分をISBNとして使用
    const isbn10Part2 = janCode.substring(3, 12); // 9桁
    console.log('Pattern 2 - ISBN-10 part (9 digits):', isbn10Part2);
    
    const isbn13Base2 = '978' + isbn10Part2; // 12桁
    const checkDigit2 = calculateISBN13CheckDigit(isbn13Base2);
    const isbn13_2 = isbn13Base2 + checkDigit2;
    
    console.log('Pattern 2 - Generated ISBN-13:', isbn13_2);
    
    if (validateISBN13(isbn13_2)) {
      console.log('Pattern 2 success');
      return isbn13_2;
    }
    
    // パターン3: JANコードの数字部分を直接使用してISBNを構築
    // 元のJANコードから491を除いた残りの10桁
    const remainingDigits = janCode.substring(3); // 10桁
    console.log('Pattern 3 - Remaining digits:', remainingDigits);
    
    // 978プレフィックス + 残りの9桁でISBN-13を構築
    const isbn13Base3 = '978' + remainingDigits.substring(0, 9); // 12桁
    const checkDigit3 = calculateISBN13CheckDigit(isbn13Base3);
    const isbn13_3 = isbn13Base3 + checkDigit3;
    
    console.log('Pattern 3 - Generated ISBN-13:', isbn13_3);
    
    if (validateISBN13(isbn13_3)) {
      console.log('Pattern 3 success');
      return isbn13_3;
    }
    
    console.log('All patterns failed for JAN code:', janCode);
  }
  
  // JANコードが192で始まる場合（雑誌コード）
  if (janCode.startsWith('192')) {
    console.log('Magazine JAN code detected, no ISBN conversion');
    return null;
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