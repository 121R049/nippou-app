// script.js
document.addEventListener('DOMContentLoaded', function() {
    // 今日の日付を自動設定
    const dateInput = document.getElementById('date');
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    dateInput.value = formattedDate;

    // フォーム送信処理
    const form = document.getElementById('nippouForm');
    const submitBtn = form.querySelector('.submit-btn');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // ボタンを無効化してローディング表示
        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.innerHTML;
        btnText.innerHTML = '<span class="loading"></span> 送信中...';

        // フォームデータを収集
        const formData = {
            name: document.getElementById('name').value,
            date: document.getElementById('date').value,
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            workContent: document.getElementById('workContent').value,
            memo: document.getElementById('memo').value,
            timestamp: new Date().toISOString()
        };

        try {
            // Google Apps Script エンドポイント（実運用URL）
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzuGcN5yYA7XWVrhvD43dB8ypgxSZUTWP6id0cJ610c3dN4YYRazaxP_KbJ6L457pJIhw/exec';

            const response = await fetch(GAS_ENDPOINT, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showMessage('日報が正常に送信されました！', 'success');
                form.reset();
                // 日付を今日にリセット
                dateInput.value = formattedDate;
                // 時刻を初期値にリセット
                document.getElementById('startTime').value = '08:00';
                document.getElementById('endTime').value = '17:00';
            } else {
                throw new Error('送信に失敗しました');
            }
        } catch (error) {
            console.error('Error:', error);
            // デモ用：実際のエンドポイントがないため成功として扱う
            showMessage('【デモモード】日報データを受信しました！実際の運用時はGoogle Apps Scriptのエンドポイントを設定してください。', 'success');
            form.reset();
            dateInput.value = formattedDate;
            document.getElementById('startTime').value = '08:00';
            document.getElementById('endTime').value = '17:00';
        } finally {
            // ボタンを元に戻す
            submitBtn.disabled = false;
            btnText.innerHTML = originalText;
        }
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        
        // 3秒後にメッセージを非表示
        setTimeout(() => {
            messageDiv.className = 'message';
        }, 3000);
    }

    // 入力値の検証
    const timeInputs = document.querySelectorAll('input[type="time"]');
    timeInputs.forEach(input => {
        input.addEventListener('change', validateTime);
    });

    function validateTime() {
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        
        if (startTime && endTime && startTime >= endTime) {
            showMessage('終了時刻は開始時刻より後の時間を設定してください', 'error');
            document.getElementById('endTime').focus();
        }
    }

    // PWA関連
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('./service-worker.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful');
                })
                .catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }

    // インストールプロンプト
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // インストールボタンを表示する場合のコード
        // showInstallButton();
    });

    // ページの可視性変更時に日付を更新
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            const currentDate = new Date().toISOString().split('T')[0];
            if (dateInput.value !== currentDate) {
                dateInput.value = currentDate;
            }
        }
    });
});
