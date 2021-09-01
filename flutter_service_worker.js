'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "7e64ce00406c39a186cb5b70b6255438",
"assets/assets/cf.png": "2f96a66060fc2111bb68d02e94711f65",
"assets/assets/codechef.png": "bc9445fc5f4de221a3801ad949011717",
"assets/assets/codeforces.png": "98561f99ff4d2bb17937576477b7194c",
"assets/assets/fonts/Alegreya-VariableFont_wght.ttf": "015630d8318d38534a599076732129a1",
"assets/assets/fonts/Amita-Regular.ttf": "52b623b54f38b816cf5ffb0a12751f73",
"assets/assets/fonts/Cookie-Regular.ttf": "1a26c990eb18bc85f1fe12a3416d57cf",
"assets/assets/fonts/FiraCode-VariableFont_wght.ttf": "addbb673ce35a6f0a1e08b2757a93846",
"assets/assets/fonts/KaushanScript-Regular.ttf": "bafd78da573962d22a817cf22678c8dc",
"assets/assets/fonts/MarckScript-Regular.ttf": "4092ea4f72947cc3245883b3faf35339",
"assets/assets/fonts/Operator_mono.ttf": "ef04da29e75516c790c35bcd348256a9",
"assets/assets/fonts/Redressed-Regular.ttf": "d34f65dc73594fd283f439001aebcb2f",
"assets/assets/fonts/Signatra.ttf": "7b67035b3b8dab514ecf09763597a947",
"assets/assets/fonts/Sofia-Regular.ttf": "3bc8db41165013433b412a3c9118a71e",
"assets/assets/git1.png": "cefc20232703e5e3c24efd5f50d75e26",
"assets/assets/git2.png": "472739dfb5857b1f659f4c4c6b4568d0",
"assets/assets/linked1.png": "1b18d461ce75c75fdb4d7b6ec08b3e65",
"assets/assets/linked2.png": "c24cde2827448f08d40afd6909011e16",
"assets/assets/pexels-junior-teixeira-2047905.jpg": "5afc248fc18706ccef776ce1fb117750",
"assets/assets/pexels-negative-space-34153.jpg": "f15dc185a2e041887cf8e91862e31cd1",
"assets/assets/profile.jpg": "5dc69bff2a542be248f2aade18c0da44",
"assets/FontManifest.json": "b36cec0bc1442d5a6e7028bd7cd8198b",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/NOTICES": "a19e69958f32158fb8412cc55c47c7b4",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "344bcb0ecc436b8070fc5a9bca7796a3",
"/": "344bcb0ecc436b8070fc5a9bca7796a3",
"main.dart.js": "238b7d8f099a6da99da820f24f18eb70",
"manifest.json": "435dc4cbcbe9405430d9724a146af5e3",
"version.json": "dedb15980b149de4625291a1bc9f03e9"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
