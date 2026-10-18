// 小鱼的心动海域 - Service Worker
const CACHE_NAME = 'xiaoyu-heart-sea-v1.0.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.mjs',
  './engine.mjs',
  './renderer.mjs',
  './audioManager.mjs',
  './background.mp3'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] 正在安装...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] 缓存资源');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] 正在激活...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 缓存优先策略
      if (response) {
        return response;
      }

      // 网络请求
      return fetch(event.request).then((response) => {
        // 只缓存有效的响应
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 克隆响应并缓存
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// 监听消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
