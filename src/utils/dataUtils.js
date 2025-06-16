// データのエクスポート機能
export const exportBooks = (books, format = 'json') => {
  if (format === 'json') {
    return exportAsJSON(books);
  } else if (format === 'csv') {
    return exportAsCSV(books);
  }
  throw new Error('Unsupported format');
};

// JSONファイルとしてエクスポート
const exportAsJSON = (books) => {
  const dataStr = JSON.stringify(books, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `books_export_${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(link.href);
};

// CSVファイルとしてエクスポート
const exportAsCSV = (books) => {
  if (books.length === 0) {
    throw new Error('エクスポートするデータがありません');
  }

  // CSVヘッダー
  const headers = [
    'タイトル',
    '著者',
    'ISBN',
    '出版社',
    '出版日',
    'ページ数',
    'カテゴリー',
    '説明',
    '登録日',
    '更新日'
  ];

  // CSVデータ行
  const csvRows = books.map(book => [
    escapeCSVField(book.title || ''),
    escapeCSVField(book.author || ''),
    escapeCSVField(book.isbn || ''),
    escapeCSVField(book.publisher || ''),
    escapeCSVField(book.publishDate || ''),
    book.pages || '',
    escapeCSVField(book.category || ''),
    escapeCSVField(book.description || ''),
    new Date(book.addedAt).toLocaleDateString('ja-JP'),
    book.updatedAt ? new Date(book.updatedAt).toLocaleDateString('ja-JP') : ''
  ]);

  // CSV文字列を作成
  const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
  
  // BOMを追加してExcelで正しく文字化けしないようにする
  const bom = '\uFEFF';
  const csvBlob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(csvBlob);
  link.download = `books_export_${new Date().toISOString().split('T')[0]}.csv`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(link.href);
};

// CSVフィールドをエスケープ
const escapeCSVField = (field) => {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};

// JSONファイルからデータをインポート
export const importBooksFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        // データの基本的な検証
        if (!Array.isArray(jsonData)) {
          throw new Error('無効なJSONフォーマットです');
        }
        
        // 各書籍データの検証
        const validatedBooks = jsonData.map((book, index) => {
          if (!book.title) {
            throw new Error(`${index + 1}行目: タイトルが必須です`);
          }
          
          return {
            title: book.title,
            author: book.author || '',
            isbn: book.isbn || '',
            publisher: book.publisher || '',
            publishDate: book.publishDate || '',
            pages: book.pages || null,
            category: book.category || '',
            description: book.description || '',
            imageUrl: book.imageUrl || '',
            // 新しいIDと日時を設定
            addedAt: new Date().toISOString(),
          };
        });
        
        resolve(validatedBooks);
      } catch (error) {
        reject(new Error(`ファイル読み込みエラー: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };
    
    reader.readAsText(file);
  });
};

// CSVファイルからデータをインポート
export const importBooksFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const lines = csvText.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSVファイルにデータが含まれていません');
        }
        
        // ヘッダー行をスキップ
        const dataLines = lines.slice(1);
        
        const books = dataLines.map((line, index) => {
          const fields = parseCSVLine(line);
          
          if (fields.length < 1 || !fields[0]) {
            throw new Error(`${index + 2}行目: タイトルが必須です`);
          }
          
          return {
            title: fields[0] || '',
            author: fields[1] || '',
            isbn: fields[2] || '',
            publisher: fields[3] || '',
            publishDate: fields[4] || '',
            pages: fields[5] ? parseInt(fields[5]) || null : null,
            category: fields[6] || '',
            description: fields[7] || '',
            imageUrl: '',
            addedAt: new Date().toISOString(),
          };
        });
        
        resolve(books);
      } catch (error) {
        reject(new Error(`CSVファイル読み込みエラー: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };
    
    reader.readAsText(file);
  });
};

// 簡単なCSV行パーサー
const parseCSVLine = (line) => {
  const fields = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        currentField += '"';
        i++; // 次の引用符をスキップ
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  fields.push(currentField);
  return fields;
};