import { useState } from 'react';
import { useBooks } from '../contexts/BookContext';
import { exportBooks, importBooksFromJSON, importBooksFromCSV } from '../utils/dataUtils';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';

const DataManagement = () => {
  const { books, addBook } = useBooks();
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [importType, setImportType] = useState('success'); // 'success' | 'error'

  const handleExport = (format) => {
    try {
      exportBooks(books, format);
      setImportMessage(`${format.toUpperCase()}ファイルをエクスポートしました`);
      setImportType('success');
      setTimeout(() => setImportMessage(''), 3000);
    } catch (error) {
      setImportMessage(`エクスポートエラー: ${error.message}`);
      setImportType('error');
      setTimeout(() => setImportMessage(''), 5000);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportMessage('');

    try {
      let importedBooks;
      
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        importedBooks = await importBooksFromJSON(file);
      } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        importedBooks = await importBooksFromCSV(file);
      } else {
        throw new Error('サポートされていないファイル形式です。JSONまたはCSVファイルを選択してください。');
      }

      // 重複チェック（ISBNまたはタイトル+著者で判定）
      const existingISBNs = new Set(books.filter(b => b.isbn).map(b => b.isbn));
      const existingTitleAuthors = new Set(books.map(b => `${b.title}_${b.author}`));
      
      const newBooks = importedBooks.filter(book => {
        if (book.isbn && existingISBNs.has(book.isbn)) {
          return false;
        }
        const titleAuthor = `${book.title}_${book.author}`;
        if (existingTitleAuthors.has(titleAuthor)) {
          return false;
        }
        return true;
      });

      // 新しい書籍を追加
      newBooks.forEach(book => addBook(book));

      const skippedCount = importedBooks.length - newBooks.length;
      let message = `${newBooks.length}件の書籍をインポートしました`;
      if (skippedCount > 0) {
        message += `（${skippedCount}件は重複のためスキップ）`;
      }

      setImportMessage(message);
      setImportType('success');
      setTimeout(() => setImportMessage(''), 5000);

    } catch (error) {
      setImportMessage(`インポートエラー: ${error.message}`);
      setImportType('error');
      setTimeout(() => setImportMessage(''), 5000);
    } finally {
      setIsImporting(false);
      event.target.value = ''; // ファイル選択をリセット
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>データ管理</h3>
      
      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* エクスポート */}
        <div>
          <h4 style={{ marginBottom: '1rem', color: '#555' }}>エクスポート</h4>
          <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>
            登録された書籍データをファイルとしてダウンロードできます
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="secondary-button"
              onClick={() => handleExport('json')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              disabled={books.length === 0}
            >
              <Download size={16} />
              JSON形式
            </button>
            <button
              className="secondary-button"
              onClick={() => handleExport('csv')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              disabled={books.length === 0}
            >
              <Download size={16} />
              CSV形式
            </button>
          </div>
          {books.length === 0 && (
            <p style={{ marginTop: '0.5rem', color: '#999', fontSize: '0.875rem' }}>
              エクスポートするデータがありません
            </p>
          )}
        </div>

        {/* インポート */}
        <div>
          <h4 style={{ marginBottom: '1rem', color: '#555' }}>インポート</h4>
          <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>
            JSONまたはCSVファイルから書籍データを取り込めます
          </p>
          
          <div style={{ position: 'relative' }}>
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleImport}
              disabled={isImporting}
              style={{ display: 'none' }}
              id="import-file"
            />
            <label
              htmlFor="import-file"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '10px 20px',
                backgroundColor: isImporting ? '#6c757d' : '#007bff',
                color: 'white',
                borderRadius: '4px',
                cursor: isImporting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                border: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Upload size={16} />
              {isImporting ? 'インポート中...' : 'ファイルを選択'}
            </label>
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
            <h5 style={{ marginBottom: '0.5rem' }}>注意事項:</h5>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.5' }}>
              <li>同じISBNまたは同じタイトル+著者の書籍は重複として除外されます</li>
              <li>CSVファイルの1行目はヘッダーとして扱われます</li>
              <li>JSONファイルは以前にエクスポートしたファイルと同じ形式である必要があります</li>
            </ul>
          </div>
        </div>
      </div>

      {/* メッセージ表示 */}
      {importMessage && (
        <div 
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '4px',
            backgroundColor: importType === 'success' ? '#d4edda' : '#f8d7da',
            borderLeft: `4px solid ${importType === 'success' ? '#28a745' : '#dc3545'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {importType === 'success' ? (
            <CheckCircle size={20} style={{ color: '#28a745' }} />
          ) : (
            <AlertCircle size={20} style={{ color: '#dc3545' }} />
          )}
          <span style={{ color: importType === 'success' ? '#155724' : '#721c24' }}>
            {importMessage}
          </span>
        </div>
      )}
    </div>
  );
};

export default DataManagement;