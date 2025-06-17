# 日報WebApp - PWA対応日報入力アプリ

## 概要
スマートフォンでも使いやすいPWA（Progressive Web App）対応の日報入力アプリケーションです。
HTML・CSS・JavaScriptのみで構成されており、GitHub Pagesで簡単に公開できます。

## 機能
- 📱 レスポンシブデザイン（スマホ・タブレット・PC対応）
- 🔄 PWA対応（オフライン動作、ホーム画面追加可能）
- 📝 日報フォーム機能
- 🚀 Google Apps Script連携（POST送信）
- ⚡ 高速な動作とキャッシュ機能

## ファイル構成
```
nippou-webapp/
├── index.html          # メインHTMLファイル
├── style.css           # スタイルシート
├── script.js           # JavaScript機能
├── manifest.json       # PWAマニフェスト
├── service-worker.js   # Service Worker（オフライン対応）
├── icon.png           # アプリアイコン（512x512px - 要追加）
└── README.md          # このファイル
```

## セットアップ手順

### 1. アイコンファイルの準備
`icon.png`ファイル（512x512px）を用意して、プロジェクトルートに配置してください。

### 2. Google Apps Script エンドポイントの設定
`script.js`の32行目にある`GAS_ENDPOINT`を実際のGoogle Apps Scriptのエンドポイントに変更してください。

```javascript
const GAS_ENDPOINT = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

### 3. GitHub Pagesでの公開
1. GitHubリポジトリを作成
2. すべてのファイルをアップロード
3. Settings > Pages > Source で「Deploy from a branch」を選択
4. Branch で「main」を選択して「Save」

## PWA機能

### インストール
- Chrome/Edge: アドレスバーのインストールボタンをクリック
- Safari: 共有ボタン > ホーム画面に追加

### オフライン対応
Service Workerによりオフライン時でもアプリの基本機能が利用可能です。

## Google Apps Script 連携例

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // スプレッドシートに記録
    const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getSheetByName('日報');
    sheet.appendRow([
      data.timestamp,
      data.name,
      data.date,
      data.startTime,
      data.endTime,
      data.workContent,
      data.memo
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 使用方法

1. ブラウザで`index.html`を開く
2. 各項目を入力（日付は自動で今日の日付が設定されます）
3. 「日報を送信」ボタンをクリック
4. デモモードで成功メッセージが表示されます

## カスタマイズ

### デザインの変更
`style.css`のCSS変数を変更することで、アプリの色合いを簡単にカスタマイズできます。

### フォーム項目の追加
`index.html`のフォーム部分と`script.js`のデータ収集部分を編集することで、新しい入力項目を追加できます。

## ライセンス
このプロジェクトはMITライセンスの下で公開されています。

## サポート
問題や質問がある場合は、GitHubのIssuesページで報告してください。