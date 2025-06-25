const CACHE_NAME = 'nippou-app-v1.0.2';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js?v=20250625',
    './manifest.json',
    './icon.png'
];

// インストール時にキャッシュ
self.addEventListener('install', function(event) {
    console.log('Service Worker: Install event');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: All files cached');
                return self.skipWaiting();
            })
    );
});

// アクティベート時に古いキャッシュ削除
self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activate event');

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Claiming clients');
            return self.clients.claim();
        })
    );
});

// フェッチ処理（CORS対応付き）
self.addEventListener('fetch', function(event) {
    console.log('Service Worker: Fetch event for:', event.request.url);

    // GASや外部APIなど、POSTやCORSが関係するリクエストはそのまま通す
    if (event.request.method === 'POST' ||
        event.request.url.includes('script.google.com') ||
        event.request.url.includes('googleapis.com')) {
        console.log('Service Worker: Bypassing cache for external/API/POST');
        event.respondWith(fetch(event.request)); // ← これでCORSが安定する
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    console.log('Service Worker: Found in cache:', event.request.url);
                    return response;
                }

                console.log('Service Worker: Not in cache, fetching from network:', event.request.url);
                return fetch(event.request)
                    .then(function(response) {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(function(error) {
                        console.log('Service Worker: Fetch failed:', error);

                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }

                        throw error;
                    });
            })
    );
});

// バックグラウンド同期（将来拡張用）
self.addEventListener('sync', function(event) {
    console.log('Service Worker: Background sync event');

    if (event.tag === 'background-sync') {
        event.waitUntil(
            // 保留中のデータ送信処理などをここに書く
            console.log('Service Worker: Performing background sync')
        );
    }
});

// プッシュ通知受信
self.addEventListener('push', function(event) {
    console.log('Service Worker: Push event received');

    const options = {
        body: event.data ? event.data.text() : 'プッシュ通知を受信しました',
        icon: './icon.png',
        badge: './icon.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'アプリを開く',
                icon: './icon.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('日報WebApp', options)
    );
});

// 通知クリック時の処理
self.addEventListener('notificationclick', function(event) {
    console.log('Service Worker: Notification click event');
    event.notification.close();

    event.waitUntil(
        clients.openWindow('./')
    );
});
// 新しいSWを即座に有効にする（index.html からの指示を受け取る）
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('Service Worker: SKIP_WAITING を受信、即時有効化');
        self.skipWaiting();
    }
});
