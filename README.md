# 日報WebApp - PWA対応日報入力アプリ

## 概要
スマートフォンでも使いやすいPWA（Progressive Web App）対応の日報入力アプリケーションです。
HTML・CSS・JavaScriptのみで構成されており、GitHub Pagesで簡単に公開できます。

## 2. 主な機能

| 機能名 | 説明 |
|--------|------|
| 日報入力フォーム | 氏名・日付・勤務時間・作業内容・メモの入力欄を備える |
| GAS連携 | Google Apps Scriptと連携し、スプレッドシートへの記録およびメール通知が可能 |
| レスポンシブ対応 | PC／タブレット／スマートフォンの画面幅に対応 |
| オフライン対応 | PWAによるキャッシュ機能によりオフラインでも画面表示が可能 |
| ホーム画面追加 | モバイル端末からホーム画面に追加して起動可能（PWA） |

---

## 3. ファイル構成

nippou-webapp/
├── index.html # アプリ本体のHTML
├── style.css # フォームUIスタイル
├── script.js # フォーム送信・検証・PWA登録
├── manifest.json # PWAマニフェスト定義
├── service-worker.js # キャッシュ制御（オフライン対応）
├── icon.png # アプリアイコン（512x512）
└── README.md # 本書

yaml
コピーする
編集する

---

## 4. 初期設定手順

### 4.1 アイコンの設定
- `icon.png`（512×512px）を準備し、プロジェクト直下に配置する。

### 4.2 GASエンドポイント設定
- `script.js` 内の `GAS_ENDPOINT` に、GASから取得したWebアプリURLを指定する。

```javascript
const GAS_ENDPOINT = 'https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxxxxx/exec';
5. 公開方法（GitHub Pages）
GitHub上に新規リポジトリを作成

プロジェクトファイルをアップロード

[Settings] → [Pages] を選択

Sourceを「Deploy from a branch」、Branchを「main」、ルート(/) を選択し保存

表示されたURLにて公開確認

6. Google Apps Script連携仕様（バックエンド）
6.1 GASコード例（スプレッドシート + メール送信）
javascript
コピーする
編集する
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
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

  MailApp.sendEmail({
    to: "your@email.com",
    subject: `日報が届きました - ${data.name}`,
    body: `日付: ${data.date}\n時間: ${data.startTime}〜${data.endTime}\n作業内容:\n${data.workContent}\n\nメモ:\n${data.memo}`
  });

  return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
}
7. 利用方法（利用者側）
Webアプリにアクセス

フォームに必要事項を入力（氏名、日付、勤務時間、作業内容、メモ）

「送信」ボタンをクリック

GAS側でスプレッドシートに記録＋メールで通知される

