# 📚 書籍管理アプリ (Book Scanner)

スマホのカメラでバーコードスキャンできる書籍管理Webアプリケーションです。

## ✨ 機能

### 基本機能
- 📱 **バーコードスキャン**: スマホカメラでISBNバーコードを読み取り
- ✍️ **手動入力**: 書籍情報の手動登録
- 📖 **書籍一覧**: 登録した書籍をカード形式で表示
- 🔍 **検索機能**: タイトル、著者、ISBNで検索
- 📝 **書籍詳細**: 個別書籍の詳細情報表示・編集

### 拡張機能
- 🌐 **ISBN API連携**: Google Books APIで書籍情報自動取得
- 🖼️ **画像アップロード**: 書籍表紙画像の追加・表示
- 🏷️ **カテゴリーフィルター**: カテゴリー別の絞り込み
- 💾 **データ管理**: JSON/CSV形式でのエクスポート・インポート
- 📱 **レスポンシブデザイン**: スマホ・タブレット対応

## 🛠️ 技術スタック

- **フロントエンド**: React 19, Vite
- **ルーティング**: React Router DOM
- **バーコードスキャン**: html5-qrcode
- **アイコン**: Lucide React
- **API**: Google Books API
- **ストレージ**: LocalStorage
- **ホスティング**: Vercel

## 🏃‍♂️ ローカル開発

```bash
# リポジトリをクローン
git clone https://github.com/kanalia7355/book-scanner.git
cd book-scanner

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:5173 を開く
```

## 📦 ビルド

```bash
# 本番用ビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

## 🔧 使用方法

1. **バーコードスキャン**
   - 「スキャン」ページにアクセス
   - スマホのカメラを書籍のISBNバーコードに向ける
   - 自動的に書籍情報が取得・登録される

2. **手動入力**
   - 「手動追加」ページで書籍情報を入力
   - 画像のアップロードも可能

3. **検索・フィルター**
   - 一覧ページで書籍を検索
   - カテゴリー別に絞り込み

4. **データ管理**
   - 書籍データをJSON/CSV形式でエクスポート
   - 他の端末からデータをインポート

## 📱 モバイル対応

このアプリはスマートフォンでの使用を想定しており、以下の機能をサポートしています：

- カメラアクセスによるバーコードスキャン
- タッチ操作に最適化されたUI
- レスポンシブレイアウト

## 🌐 デプロイ

### Vercelでのデプロイ

1. [Vercel](https://vercel.com)にアカウントを作成
2. GitHubリポジトリを接続
3. 自動デプロイが開始されます

### その他のホスティングオプション

- Netlify
- GitHub Pages
- Firebase Hosting

## 🔒 プライバシー

- すべてのデータはブラウザのLocalStorageに保存
- 外部サーバーにデータは送信されません
- Google Books APIは書籍情報取得のみに使用

## 🤝 コントリビューション

1. フォークしてください
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🐛 バグ報告・機能要望

[Issues](https://github.com/your-username/book-scanner/issues) ページからお気軽にご報告ください。

---

⭐ このプロジェクトが気に入ったら、ぜひスターを付けてください！
