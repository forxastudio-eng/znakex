package com.forxastudio.znakex;

import android.app.Activity;
import android.content.res.AssetManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.IOException;
import java.io.InputStream;

/**
 * ZNAKEX shell: a full-screen WebView that serves the game from the APK assets
 * under a virtual https origin (ES modules and localStorage need a real origin).
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/www/index.html";

    private WebView web;
    /** Google Play services (ads, purchases, Play Games): only present in the Gradle build, see demo/play */
    private Object plugin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(Color.parseColor("#0B0F0B")));

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0B0F0B"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        // everything is served from inside the app: nothing needs the WebView's disk cache, and a stale
        // cached copy of a video (partial byte ranges) is what could stop the intro until the cache was cleared
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        web.clearCache(true);
        web.setWebViewClient(new AssetClient(getAssets()));
        web.addJavascriptInterface(new NotifyBridge(), "ZnakexNotify");
        try {
            plugin = Class.forName("com.forxastudio.znakex.Bridges").getConstructor(Activity.class, WebView.class).newInstance(this, web);
        } catch (Throwable ignored) {
            // old test build without the Play libraries: the game simulates ads and purchases
        }
        setContentView(web);
        hideSystemUi();
        web.loadUrl(START);
    }

    private void hideSystemUi() {
        View d = getWindow().getDecorView();
        d.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        if (Build.VERSION.SDK_INT >= 28) {
            // layoutInDisplayCutoutMode = SHORT_EDGES (field added in API 28; set reflectively)
            try {
                WindowManager.LayoutParams lp = getWindow().getAttributes();
                lp.getClass().getField("layoutInDisplayCutoutMode").setInt(lp, 1);
                getWindow().setAttributes(lp);
            } catch (Exception ignored) {
            }
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemUi();
    }

    @Override
    protected void onPause() {
        // pause the game first (the WebView stops running JavaScript after onPause)
        if (web != null) web.evaluateJavascript("window.ZNAKEX && window.ZNAKEX.onPause && window.ZNAKEX.onPause()", null);
        super.onPause();
        web.onPause();
        // nothing keeps running in the background: JavaScript timers stop until the app returns
        web.pauseTimers();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.resumeTimers();
        web.onResume();
        if (plugin != null) {
            try {
                plugin.getClass().getMethod("onResume").invoke(plugin);
            } catch (Exception ignored) {
            }
        }
        // media is paused by the system while the app is hidden: start the videos and music again
        web.evaluateJavascript("window.ZNAKEX && window.ZNAKEX.onResume && window.ZNAKEX.onResume()", null);
    }

    private static final String POST_NOTIFICATIONS = "android.permission.POST_NOTIFICATIONS"; // API 33

    /** Reminders for the game: permission (asked only when the player says yes in the game) and scheduling. */
    private class NotifyBridge {
        @JavascriptInterface
        public String permission() {
            if (Build.VERSION.SDK_INT >= 33) {
                if (checkSelfPermission(POST_NOTIFICATIONS) == android.content.pm.PackageManager.PERMISSION_GRANTED) return "granted";
                return getSharedPreferences(Reminder.PREFS, MODE_PRIVATE).getBoolean("asked", false) ? "denied" : "default";
            }
            // before Android 13 no permission is needed (areNotificationsEnabled is API 24: read by reflection)
            try {
                Object nm = getSystemService(NOTIFICATION_SERVICE);
                Object on = nm.getClass().getMethod("areNotificationsEnabled").invoke(nm);
                return Boolean.FALSE.equals(on) ? "denied" : "granted";
            } catch (Exception e) {
                return "granted";
            }
        }

        @JavascriptInterface
        public void requestPermission() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                        getSharedPreferences(Reminder.PREFS, MODE_PRIVATE).edit().putBoolean("asked", true).apply();
                        requestPermissions(new String[]{POST_NOTIFICATIONS}, 77);
                    } else {
                        permissionResult(true);
                    }
                }
            });
        }

        @JavascriptInterface
        public void schedule(String messagesJson) {
            Reminder.schedule(MainActivity.this, messagesJson);
        }

        @JavascriptInterface
        public void cancel() {
            Reminder.cancel(MainActivity.this);
        }
    }

    private void permissionResult(boolean granted) {
        web.evaluateJavascript("window.__znakexNotifyPermission && window.__znakexNotifyPermission(" + granted + ")", null);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == 77) permissionResult(grantResults.length > 0 && grantResults[0] == android.content.pm.PackageManager.PERMISSION_GRANTED);
    }

    @Override
    public void onBackPressed() {
        // Let the game handle Back (close popup, pause, go to the menu).
        web.evaluateJavascript("(window.ZNAKEX && window.ZNAKEX.back) ? String(window.ZNAKEX.back()) : 'false'",
                new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String handled) {
                        if (handled == null || !handled.contains("true")) finish();
                    }
                });
    }

    /** Serves https://appassets.androidplatform.net/<path> from the APK assets folder. */
    private static class AssetClient extends WebViewClient {
        private final AssetManager assets;

        AssetClient(AssetManager assets) {
            this.assets = assets;
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            android.net.Uri u = request.getUrl();
            if (!HOST.equals(u.getHost())) return null;
            String path = u.getPath();
            if (path == null) return null;
            if (path.startsWith("/")) path = path.substring(1);
            try {
                // video needs byte ranges: the media player buffers, loops and seeks with Range requests
                if (path.endsWith(".mp4")) return media(path, request);
                InputStream in = assets.open(path);
                WebResourceResponse r = new WebResourceResponse(mime(path), mime(path).startsWith("text/") || path.endsWith(".js") ? "utf-8" : null, in);
                java.util.Map<String, String> h = new java.util.HashMap<>();
                h.put("Access-Control-Allow-Origin", "*");
                h.put("Cache-Control", "no-store");
                r.setResponseHeaders(h);
                return r;
            } catch (IOException e) {
                return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", null, null);
            }
        }

        /** 200 with the whole file, or 206 with the requested byte range (videos are stored uncompressed). */
        private WebResourceResponse media(String path, WebResourceRequest request) throws IOException {
            long total;
            try {
                android.content.res.AssetFileDescriptor fd = assets.openFd(path);
                total = fd.getLength();
                fd.close();
            } catch (IOException e) {
                total = -1;
            }
            if (total < 0) {
                InputStream c = assets.open(path);
                long n = 0;
                byte[] buf = new byte[65536];
                int k;
                while ((k = c.read(buf)) > 0) n += k;
                c.close();
                total = n;
            }
            long start = 0, end = total - 1;
            boolean partial = false;
            java.util.Map<String, String> req = request.getRequestHeaders();
            String range = null;
            if (req != null) for (java.util.Map.Entry<String, String> e : req.entrySet()) {
                if ("range".equalsIgnoreCase(e.getKey())) range = e.getValue();
            }
            if (range != null && range.startsWith("bytes=")) {
                String[] se = range.substring(6).split(",")[0].trim().split("-", -1);
                try {
                    if (se[0].isEmpty()) {
                        start = Math.max(0, total - Long.parseLong(se[1].trim()));
                    } else {
                        start = Long.parseLong(se[0].trim());
                        if (se.length > 1 && !se[1].trim().isEmpty()) end = Math.min(total - 1, Long.parseLong(se[1].trim()));
                    }
                    partial = true; // any Range request is answered with 206, as the media player expects
                } catch (NumberFormatException ignored) {
                    start = 0;
                    end = total - 1;
                }
            }
            if (start > end || start >= total) {
                java.util.Map<String, String> h = new java.util.HashMap<>();
                h.put("Content-Range", "bytes */" + total);
                return new WebResourceResponse("video/mp4", null, 416, "Range Not Satisfiable", h, new java.io.ByteArrayInputStream(new byte[0]));
            }
            InputStream in = assets.open(path);
            long skip = start;
            while (skip > 0) {
                long s2 = in.skip(skip);
                if (s2 <= 0) break;
                skip -= s2;
            }
            final long len = end - start + 1;
            InputStream body = new java.io.FilterInputStream(in) {
                long left = len;

                @Override
                public int read() throws IOException {
                    if (left <= 0) return -1;
                    int b = super.read();
                    if (b >= 0) left--;
                    return b;
                }

                @Override
                public int read(byte[] b, int off, int n) throws IOException {
                    if (left <= 0) return -1;
                    int r = super.read(b, off, (int) Math.min(n, left));
                    if (r > 0) left -= r;
                    return r;
                }
            };
            java.util.Map<String, String> h = new java.util.HashMap<>();
            h.put("Access-Control-Allow-Origin", "*");
            h.put("Accept-Ranges", "bytes");
            h.put("Content-Length", String.valueOf(len));
            h.put("Cache-Control", "no-store");
            if (partial) {
                h.put("Content-Range", "bytes " + start + "-" + end + "/" + total);
                return new WebResourceResponse("video/mp4", null, 206, "Partial Content", h, body);
            }
            return new WebResourceResponse("video/mp4", null, 200, "OK", h, body);
        }

        @Override
        @SuppressWarnings("deprecation")
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            if (url.contains(HOST)) return false;
            // privacy policy, support email...: open them outside the game (browser / mail app)
            try {
                android.content.Intent i = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url));
                i.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                view.getContext().startActivity(i);
            } catch (Exception ignored) {
            }
            return true;
        }

        private static String mime(String p) {
            if (p.endsWith(".html")) return "text/html";
            if (p.endsWith(".js") || p.endsWith(".mjs")) return "text/javascript";
            if (p.endsWith(".css")) return "text/css";
            if (p.endsWith(".png")) return "image/png";
            if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
            if (p.endsWith(".webp")) return "image/webp";
            if (p.endsWith(".mp4")) return "video/mp4";
            if (p.endsWith(".wav")) return "audio/wav";
            if (p.endsWith(".woff2")) return "font/woff2";
            if (p.endsWith(".json")) return "application/json";
            if (p.endsWith(".svg")) return "image/svg+xml";
            if (p.endsWith(".mp3")) return "audio/mpeg";
            if (p.endsWith(".ogg")) return "audio/ogg";
            return "application/octet-stream";
        }
    }
}
