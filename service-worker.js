'use strict';

// 👇 缓存版本号，每次更改资源时请修改版本号
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-cache-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-cache-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// 👇 预缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  // '/offline.html',
  // '/css/styles.css',
  // '/js/main.js',
  // '/favicon.ico',
];

// 安装事件 → 预缓存所有静态资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // 立即激活新 service worker
});

// 激活事件 → 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (![STATIC_CACHE, DYNAMIC_CACHE].includes(key)) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // 立即控制所有页面
});

// 分发 fetch 请求
self.addEventListener('fetch', event => {
  const { request } = event;

  // GET 请求才缓存
  if (request.method !== 'GET' || request.url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    // 先查静态缓存
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        // 命中缓存 → 返回缓存 & 同时后台更新缓存
        fetchAndUpdateCache(request);
        return cachedResponse;
      }

      // 无缓存 → 尝试网络请求
      return fetch(request)
        .then(networkResponse => {
          // 网络成功 → 动态缓存
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // 网络失败 → 返回静态离线页（如果请求的是导航页面）
          if (request.mode === 'navigate' || request.destination === 'document') {
            return caches.match(OFFLINE_URL);
          }
        });
    })
  );
});

// 辅助函数：后台更新缓存
async function fetchAndUpdateCache(request) {
  return fetch(request)
    .then(async networkResponse => {
      return caches.open(DYNAMIC_CACHE).then(cache => {
        cache.put(request, networkResponse.clone());
        return networkResponse;
      });
    })
    .catch(() => {
      // 忽略网络错误
      return null;
    });
}