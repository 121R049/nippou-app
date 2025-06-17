// service-worker.js
const CACHE_NAME = 'nippou-app-v1.0.0';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icon.png'
];

// Service Worker インストール時
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
                return self.skipWaiting(); // 新しいSWを即座にアクティブにする
            })
    );
});

// Service Worker アクティベート時
self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activate event');
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    // 古いキャッシュを削除
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Claiming clients');
            return self.clients.claim(); // すべてのクライアントを制御下に置く
        })
    );
});

// リクエストに対する処理
self.addEventListener('fetch', function(event) {
    console.log('Service Worker: Fetch event for:', event.request.url);
    
    // Google Apps Script へのPOSTリクエストはキャッシュしない
    if (event.request.method === 'POST' || 
        event.request.url.includes('script.google.com') ||
        event.request.url.includes('googleapis.com')) {
        console.log('Service Worker: POST request or external API, going to network');
        return fetch(event.request);
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // キャッシュにある場合はそれを返す
                if (response) {
                    console.log('Service Worker: Found in cache:', event.request.url);
                    return response;
                }
                
                // キャッシュにない場合はネットワークから取得
                console.log('Service Worker: Not in cache, fetching from network:', event.request.url);
                return fetch(event.request)
                    .then(function(response) {
                        // レスポンスが有効でない場合はそのまま返す
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // レスポンスをクローンしてキャッシュに保存
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(function(error) {
                        console.log('Service Worker: Fetch failed:', error);
                        
                        // オフライン時のフォールバック
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// バックグラウンド同期（オプション）
self.addEventListener('sync', function(event) {
    console.log('Service Worker: Background sync event');
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // ここで保留中のデータの送信処理を行う
            console.log('Service Worker: Performing background sync')
        );
    }
});

// プッシュ通知受信時（オプション）
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

// 通知クリック時の処理（オプション）
self.addEventListener('notificationclick', function(event) {
    console.log('Service Worker: Notification click event');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('./')
    );
});