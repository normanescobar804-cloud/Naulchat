/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "9217bcf030f831396ce9d4841c657f30"
  }, {
    "url": "pwa-512x512.png",
    "revision": "f0cb22c17f5fc7d8b8abfc49a2a03a3b"
  }, {
    "url": "pwa-192x192.png",
    "revision": "547096af4c7326cc164d6ae4503399d1"
  }, {
    "url": "index.html",
    "revision": "6560326414b49caa81ecc50745f2ecec"
  }, {
    "url": "icon.svg",
    "revision": "a8a915b1e665d25df86d44b14e6d3da7"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "cc24bf36ae9a7fb6aa015fc7334ae8b3"
  }, {
    "url": "assets/index-CR8lMJwR.css",
    "revision": null
  }, {
    "url": "assets/index-BCVlHZ8I.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "cc24bf36ae9a7fb6aa015fc7334ae8b3"
  }, {
    "url": "icon.svg",
    "revision": "a8a915b1e665d25df86d44b14e6d3da7"
  }, {
    "url": "pwa-192x192.png",
    "revision": "547096af4c7326cc164d6ae4503399d1"
  }, {
    "url": "pwa-512x512.png",
    "revision": "f0cb22c17f5fc7d8b8abfc49a2a03a3b"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "9217bcf030f831396ce9d4841c657f30"
  }, {
    "url": "manifest.webmanifest",
    "revision": "636dc0ecda78ff65982f56f09342a792"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
