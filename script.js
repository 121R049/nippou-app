document.addEventListener('DOMContentLoaded', function () {
    const dateInput = document.getElementById('date');
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    dateInput.value = formattedDate;

    const form = document.getElementById('nippouForm');
    const submitBtn = form.querySelector('.submit-btn');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.innerHTML;
        btnText.innerHTML = '<span class="loading"></span> 送信中...';

        const formData = {
            name: document.getElementById('name').value,
            date: document.getElementById('date').value,
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            workContent: document.getElementById('workContent').value,
            memo: document.getElementById('memo').value,
            timestamp: new Date().toISOString()
        };

        const params = new URLSearchParams(formData).toString();

        const xhr = new XMLHttpRequest();
        const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzTF3u6BWsagGAguq3PwlBTigGiNXhlHnvFGjXy5ydL11vmJxaxaud3ikbqRPMSZoDolg/exec';

        xhr.open("POST", GAS_ENDPOINT, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    showMessage('日報が正常に送信されました！', 'success');
                    form.reset();
                    dateInput.value = formattedDate;
                    document.getElementById('startTime').value = '08:00';
                    document.getElementById('endTime').value = '17:00';
                } else {
                    showMessage('送信に失敗しました', 'error');
                }
                submitBtn.disabled = false;
                btnText.innerHTML = originalText;
            }
        };

        xhr.send(params);
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        setTimeout(() => {
            messageDiv.className = 'message';
        }, 3000);
    }

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

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('./service-worker.js')
                .then(function (registration) {
                    console.log('ServiceWorker registration successful');
                })
                .catch(function (err) {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }

    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });

    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            const currentDate = new Date().toISOString().split('T')[0];
            if (dateInput.value !== currentDate) {
                dateInput.value = currentDate;
            }
        }
    });
});
