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
    const publishingDetail = onix.PublishingDetail || {};
    const productSupply = onix.ProductSupply || {};
    
    console.log('openBD API response (summary):', summary);
    console.log('openBD API response (onix):', onix);
    
    // より詳細なデータ抽出を試行
    let title = summary.title || '';
    let author = summary.author || '';
    let publisher = summary.publisher || '';
    let publishDate = summary.pubdate || '';
    let description = summary.description || '';
    let pages = summary.pages || null;
    let imageUrl = summary.cover || null;
    
    // ONIXデータからも情報を取得
    if (descriptiveDetail.TitleDetail && descriptiveDetail.TitleDetail[0]) {
      const titleDetail = descriptiveDetail.TitleDetail[0].TitleElement;
      if (titleDetail && titleDetail[0] && !title) {
        title = titleDetail[0].TitleText || '';
      }
    }
    
    // 著者情報の詳細取得
    if (descriptiveDetail.Contributor && descriptiveDetail.Contributor.length > 0 && !author) {
      const contributors = descriptiveDetail.Contributor
        .filter(c => c.ContributorRole && ['A01', 'A02'].includes(c.ContributorRole[0]))
        .map(c => c.PersonName || c.PersonNameInverted || '')
        .filter(name => name);
      if (contributors.length > 0) {
        author = contributors.join(', ');
      }
    }
    
    // 出版社情報の詳細取得
    if (publishingDetail.Publisher && publishingDetail.Publisher.length > 0 && !publisher) {
      publisher = publishingDetail.Publisher[0].PublisherName || '';
    }
    
    // 出版日の詳細取得
    if (publishingDetail.PublishingDate && publishingDetail.PublishingDate.length > 0 && !publishDate) {
      publishDate = publishingDetail.PublishingDate[0].Date || '';
    }
    
    // ページ数の詳細取得
    if (descriptiveDetail.Extent && descriptiveDetail.Extent.length > 0 && !pages) {
      const pageExtent = descriptiveDetail.Extent.find(e => e.ExtentType && e.ExtentType[0] === '00');
      if (pageExtent && pageExtent.ExtentValue) {
        pages = parseInt(pageExtent.ExtentValue[0]) || null;
      }
    }
    
    // 説明文の詳細取得
    if (descriptiveDetail.TextContent && descriptiveDetail.TextContent.length > 0 && !description) {
      const textContent = descriptiveDetail.TextContent.find(t => t.TextType && ['02', '03'].includes(t.TextType[0]));
      if (textContent && textContent.Text) {
        description = textContent.Text[0] || '';
      }
    }
    
    // カテゴリ情報の詳細取得
    let category = '';
    if (descriptiveDetail.Subject && descriptiveDetail.Subject.length > 0) {
      const subjects = descriptiveDetail.Subject
        .map(s => s.SubjectHeadingText || s.SubjectCode || '')
        .filter(subject => subject);
      category = subjects.join(', ');
    }
    
    const result = {
      title: title || '不明',
      author: author || '不明',
      publisher: publisher || '不明',
      publishDate: publishDate || '',
      pages: pages,
      description: description || '',
      category: category || '',
      isbn: summary.isbn || janCode,
      imageUrl: imageUrl,
      language: 'ja',
      source: 'openBD'
    };
    
    console.log('Processed openBD result:', result);
    return result;
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