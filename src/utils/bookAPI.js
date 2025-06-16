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

// メイン関数：Google Books APIを試し、失敗したらNDL APIを試す
export const fetchBookInfo = async (isbn) => {
  let bookInfo = await fetchBookByISBN(isbn);
  
  // Google Books APIで見つからない場合、NDL APIを試す
  if (!bookInfo) {
    bookInfo = await fetchBookByISBNFromNDL(isbn);
  }
  
  return bookInfo;
};