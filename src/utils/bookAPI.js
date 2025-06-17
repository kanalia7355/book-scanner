// Google Books APIを使用してISBNから書籍情報を取得
export const fetchBookByISBN = async (isbn) => {
  try {
    // ISBNの正規化（ハイフンを除去）
    const normalizedISBN = isbn.replace(/-/g, '');
    
    // Google Books APIのエンドポイント
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${normalizedISBN}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const data = await response.json();
    
    if (data.totalItems === 0) {
      return null;
    }
    
    // 最初の結果を取得
    const book = data.items[0].volumeInfo;
    
    // APIのレスポンスを正規化
    return {
      title: book.title || '',
      author: book.authors ? book.authors.join(', ') : '',
      publisher: book.publisher || '',
      publishDate: book.publishedDate || '',
      pages: book.pageCount || null,
      description: book.description || '',
      category: book.categories ? book.categories.join(', ') : '',
      isbn: normalizedISBN,
      imageUrl: book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail || null,
      language: book.language || '',
    };
  } catch (error) {
    console.error('Error fetching book data:', error);
    return null;
  }
};

// 国立国会図書館APIを使用（日本の書籍向けのバックアップ）
export const fetchBookByISBNFromNDL = async (isbn) => {
  try {
    const normalizedISBN = isbn.replace(/-/g, '');
    const url = `https://iss.ndl.go.jp/api/opensearch?isbn=${normalizedISBN}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('NDL API request failed');
    }
    
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    const items = xmlDoc.getElementsByTagName('item');
    
    if (items.length === 0) {
      return null;
    }
    
    const item = items[0];
    
    const getElementText = (tagName) => {
      const element = item.getElementsByTagName(tagName)[0];
      return element ? element.textContent : '';
    };
    
    return {
      title: getElementText('title'),
      author: getElementText('author'),
      publisher: getElementText('dc:publisher'),
      publishDate: getElementText('pubDate'),
      isbn: normalizedISBN,
      description: getElementText('description'),
    };
  } catch (error) {
    console.error('Error fetching book from NDL:', error);
    return null;
  }
};

// JANコードで書籍情報を検索（openBDなどのAPI使用）
export const fetchBookByJAN = async (janCode) => {
  try {
    console.log('Fetching book info by JAN code:', janCode);
    
    // openBD APIを使用（日本の書籍流通データベース）
    const url = `https://api.openbd.jp/v1/get?isbn=${janCode}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log('openBD API request failed');
      return null;
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0 || !data[0]) {
      console.log('No book found for JAN code in openBD');
      return null;
    }
    
    const bookData = data[0];
    const summary = bookData.summary || {};
    const onix = bookData.onix || {};
    const descriptiveDetail = onix.DescriptiveDetail || {};
    
    console.log('openBD API response:', bookData);
    
    return {
      title: summary.title || '',
      author: summary.author || '',
      publisher: summary.publisher || '',
      publishDate: summary.pubdate || '',
      pages: summary.pages || null,
      description: summary.description || '',
      category: descriptiveDetail.Subject ? descriptiveDetail.Subject.map(s => s.SubjectHeadingText).join(', ') : '',
      isbn: summary.isbn || janCode,
      imageUrl: summary.cover || null,
      language: 'ja',
      source: 'openBD'
    };
  } catch (error) {
    console.error('Error fetching book data from openBD:', error);
    return null;
  }
};

// 楽天ブックスAPIでJANコード検索（バックアップ）
export const fetchBookByJANFromRakuten = async (janCode) => {
  try {
    console.log('Trying Rakuten Books API for JAN:', janCode);
    
    // 楽天ブックスAPIは無料だが、アプリケーションIDが必要
    // ここでは汎用的な検索として実装
    const searchQuery = encodeURIComponent(janCode);
    const url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&isbn=${searchQuery}&applicationId=1001`;
    
    // CORS制限があるため、実際の運用では proxy が必要
    // または環境変数で楽天のAPI KEYを設定
    console.log('Rakuten API would be called with URL:', url);
    
    // 現時点では null を返す（CORS制限のため）
    return null;
  } catch (error) {
    console.error('Error fetching book from Rakuten:', error);
    return null;
  }
};

// メイン関数：コードの種類を判定して適切なAPIを使用
export const fetchBookInfo = async (code) => {
  console.log('fetchBookInfo called with code:', code);
  
  // コードの種類を判定
  const isJAN = code.startsWith('192') || code.startsWith('198') || 
                code.startsWith('199') || code.startsWith('491');
  const isISBN = code.startsWith('978') || code.startsWith('979') || 
                 code.match(/^\d{10}$/);
  
  let bookInfo = null;
  
  if (isJAN) {
    console.log('Detected as JAN code, trying JAN-specific APIs');
    // JANコード用APIを試行
    bookInfo = await fetchBookByJAN(code);
    
    // JAN検索で見つからない場合、JSBNとしても試行
    if (!bookInfo) {
      console.log('JAN search failed, trying as ISBN');
      bookInfo = await fetchBookByISBN(code);
    }
  } else if (isISBN) {
    console.log('Detected as ISBN, trying ISBN-specific APIs');
    // ISBN用APIを試行
    bookInfo = await fetchBookByISBN(code);
  } else {
    console.log('Unknown code format, trying all APIs');
    // 不明な形式の場合、すべて試行
    bookInfo = await fetchBookByISBN(code);
    if (!bookInfo) {
      bookInfo = await fetchBookByJAN(code);
    }
  }
  
  // Google Books APIで見つからない場合、NDL APIを試す（ISBNの場合）
  if (!bookInfo && (isISBN || !isJAN)) {
    console.log('Trying NDL API as fallback');
    bookInfo = await fetchBookByISBNFromNDL(code);
  }
  
  console.log('Final book info result:', bookInfo);
  return bookInfo;
};