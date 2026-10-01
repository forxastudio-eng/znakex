package com.forxastudio.znakex;

import android.app.Activity;
import android.content.Intent;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.annotation.NonNull;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.PlayGamesSdk;
import com.google.android.gms.games.SnapshotsClient;
import com.google.android.gms.games.snapshot.Snapshot;
import com.google.android.gms.games.snapshot.SnapshotMetadataChange;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.UserMessagingPlatform;

import org.json.JSONArray;
import org.json.JSONObject;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Google Play services for the game (only in the Gradle / Google Play build; MainActivity loads this
 * class by name, so the old test build without these libraries still works):
 * - ZnakexAds: AdMob interstitial (between games, every 10) and rewarded ads, after the UMP consent form.
 * - ZnakexBilling: real purchases with Google Play Billing (prices in the player's currency).
 * - ZnakexGames: Play Games sign-in, cloud save (Saved Games) and leaderboards.
 * Results go back to the game through window.__znakex* callbacks.
 */
public class Bridges {
    private final Activity act;
    private final WebView web;

    public Bridges(Activity act, WebView web) {
        this.act = act;
        this.web = web;
        web.addJavascriptInterface(new Ads(), "ZnakexAds");
        web.addJavascriptInterface(new Billing(), "ZnakexBilling");
        web.addJavascriptInterface(new Games(), "ZnakexGames");
        startConsentAndAds();
        startBilling();
        startGames();
    }

    private String str(String name) {
        int id = act.getResources().getIdentifier(name, "string", act.getPackageName());
        return id == 0 ? "" : act.getString(id);
    }

    private void js(final String code) {
        act.runOnUiThread(() -> web.evaluateJavascript(code, null));
    }

    private static String q(String s) {
        return JSONObject.quote(s == null ? "" : s);
    }

    /** called by MainActivity.onResume: purchases made outside the app (pending, promo codes) */
    public void onResume() {
        if (billing != null && billing.isReady()) restore(false);
    }

    // ================================================================ ads (AdMob + UMP consent)
    private ConsentInformation consent;
    private final AtomicBoolean adsStarted = new AtomicBoolean(false);
    private InterstitialAd interstitial;
    private RewardedAd rewarded;
    private boolean loadingI, loadingR;

    private void startConsentAndAds() {
        consent = UserMessagingPlatform.getConsentInformation(act);
        ConsentRequestParameters params = new ConsentRequestParameters.Builder().build();
        consent.requestConsentInfoUpdate(act, params,
                () -> UserMessagingPlatform.loadAndShowConsentFormIfRequired(act, err -> {
                    if (consent.canRequestAds()) startAds();
                }),
                err -> {
                    if (consent.canRequestAds()) startAds();
                });
        // consent from an earlier session: ads can start right away
        if (consent.canRequestAds()) startAds();
    }

    private void startAds() {
        if (!adsStarted.compareAndSet(false, true)) return;
        new Thread(() -> {
            MobileAds.initialize(act, status -> act.runOnUiThread(() -> {
                loadInterstitial();
                loadRewarded();
            }));
        }).start();
    }

    private void loadInterstitial() {
        if (interstitial != null || loadingI) return;
        loadingI = true;
        InterstitialAd.load(act, str("admob_interstitial"), new AdRequest.Builder().build(), new InterstitialAdLoadCallback() {
            @Override
            public void onAdLoaded(@NonNull InterstitialAd ad) {
                loadingI = false;
                interstitial = ad;
            }

            @Override
            public void onAdFailedToLoad(@NonNull LoadAdError e) {
                loadingI = false;
                web.postDelayed(Bridges.this::loadInterstitial, 60_000);
            }
        });
    }

    private void loadRewarded() {
        if (rewarded != null || loadingR) return;
        loadingR = true;
        RewardedAd.load(act, str("admob_rewarded"), new AdRequest.Builder().build(), new RewardedAdLoadCallback() {
            @Override
            public void onAdLoaded(@NonNull RewardedAd ad) {
                loadingR = false;
                rewarded = ad;
            }

            @Override
            public void onAdFailedToLoad(@NonNull LoadAdError e) {
                loadingR = false;
                web.postDelayed(Bridges.this::loadRewarded, 60_000);
            }
        });
    }

    private void adDone(boolean ok) {
        js("window.__znakexAdDone && window.__znakexAdDone(" + ok + ")");
    }

    private class Ads {
        @JavascriptInterface
        public boolean isReady(String kind) {
            return "rewarded".equals(kind) ? rewarded != null : interstitial != null;
        }

        @JavascriptInterface
        public void show(final String kind) {
            act.runOnUiThread(() -> {
                if ("rewarded".equals(kind)) {
                    RewardedAd ad = rewarded;
                    rewarded = null;
                    if (ad == null) { adDone(false); return; }
                    final boolean[] earned = {false};
                    ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                        @Override
                        public void onAdDismissedFullScreenContent() {
                            adDone(earned[0]);
                            loadRewarded();
                        }

                        @Override
                        public void onAdFailedToShowFullScreenContent(@NonNull AdError e) {
                            adDone(false);
                            loadRewarded();
                        }
                    });
                    ad.show(act, item -> earned[0] = true);
                } else {
                    InterstitialAd ad = interstitial;
                    interstitial = null;
                    if (ad == null) { adDone(false); return; }
                    ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                        @Override
                        public void onAdDismissedFullScreenContent() {
                            adDone(true);
                            loadInterstitial();
                        }

                        @Override
                        public void onAdFailedToShowFullScreenContent(@NonNull AdError e) {
                            adDone(false);
                            loadInterstitial();
                        }
                    });
                    ad.show(act);
                }
            });
        }

        /** EU / UK players must be able to change their ad consent later (button in Settings) */
        @JavascriptInterface
        public boolean privacyRequired() {
            return consent != null && consent.getPrivacyOptionsRequirementStatus()
                    == ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED;
        }

        @JavascriptInterface
        public void privacyOptions() {
            act.runOnUiThread(() -> UserMessagingPlatform.showPrivacyOptionsForm(act, err -> {
                if (consent.canRequestAds()) startAds();
            }));
        }
    }

    // ================================================================ billing (Google Play Billing v8)
    private BillingClient billing;
    private final Map<String, ProductDetails> products = new HashMap<>();

    private void startBilling() {
        billing = BillingClient.newBuilder(act)
                .setListener((result, purchases) -> {
                    int code = result.getResponseCode();
                    if (code == BillingClient.BillingResponseCode.OK && purchases != null) {
                        for (Purchase p : purchases) deliver(p, false);
                    } else if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
                        restore(false);
                    } else {
                        js("window.__znakexBuyFailed && window.__znakexBuyFailed(" + (code == BillingClient.BillingResponseCode.USER_CANCELED) + ")");
                    }
                })
                .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
                .enableAutoServiceReconnection()
                .build();
        billing.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult r) {
                if (r.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    js("window.__znakexBillingReady && window.__znakexBillingReady()");
                    restore(false);
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
            }
        });
    }

    /** hands a paid purchase to the game; the game grants it, saves, then calls ZnakexBilling.finish */
    private void deliver(Purchase p, boolean restored) {
        if (p.getPurchaseState() != Purchase.PurchaseState.PURCHASED) {
            if (p.getPurchaseState() == Purchase.PurchaseState.PENDING)
                js("window.__znakexBuyPending && window.__znakexBuyPending()");
            return;
        }
        for (String id : p.getProducts()) {
            js("window.__znakexPurchase && window.__znakexPurchase(" + q(id) + "," + q(p.getPurchaseToken()) + "," + p.isAcknowledged() + "," + restored + ")");
        }
    }

    private void restore(final boolean manual) {
        billing.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),
                (r, list) -> {
                    int n = 0;
                    if (r.getResponseCode() == BillingClient.BillingResponseCode.OK && list != null) {
                        for (Purchase p : list) {
                            if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) n++;
                            deliver(p, true);
                        }
                    }
                    if (manual) js("window.__znakexRestored && window.__znakexRestored(" + n + ")");
                });
    }

    private class Billing {
        /** ids: JSON array of product ids; answers __znakexProducts({id: localPrice}) */
        @JavascriptInterface
        public void products(String idsJson) {
            try {
                JSONArray ids = new JSONArray(idsJson);
                List<QueryProductDetailsParams.Product> list = new ArrayList<>();
                for (int i = 0; i < ids.length(); i++) {
                    list.add(QueryProductDetailsParams.Product.newBuilder()
                            .setProductId(ids.getString(i))
                            .setProductType(BillingClient.ProductType.INAPP).build());
                }
                billing.queryProductDetailsAsync(QueryProductDetailsParams.newBuilder().setProductList(list).build(),
                        (r, result) -> {
                            JSONObject prices = new JSONObject();
                            try {
                                for (ProductDetails d : result.getProductDetailsList()) {
                                    products.put(d.getProductId(), d);
                                    ProductDetails.OneTimePurchaseOfferDetails o = d.getOneTimePurchaseOfferDetails();
                                    if (o != null) prices.put(d.getProductId(), o.getFormattedPrice());
                                }
                            } catch (Exception ignored) {
                            }
                            js("window.__znakexProducts && window.__znakexProducts(" + prices + ")");
                        });
            } catch (Exception ignored) {
            }
        }

        @JavascriptInterface
        public boolean ready() {
            return billing != null && billing.isReady();
        }

        @JavascriptInterface
        public boolean buy(final String id) {
            final ProductDetails d = products.get(id);
            if (d == null || !billing.isReady()) return false;
            act.runOnUiThread(() -> {
                List<BillingFlowParams.ProductDetailsParams> ps = new ArrayList<>();
                ps.add(BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(d).build());
                billing.launchBillingFlow(act, BillingFlowParams.newBuilder().setProductDetailsParamsList(ps).build());
            });
            return true;
        }

        /** the game has granted and saved the purchase: coins are consumed (can be bought again), the rest acknowledged */
        @JavascriptInterface
        public void finish(String token, boolean consumable) {
            if (consumable) {
                billing.consumeAsync(ConsumeParams.newBuilder().setPurchaseToken(token).build(), (r, t) -> {
                });
            } else {
                billing.acknowledgePurchase(AcknowledgePurchaseParams.newBuilder().setPurchaseToken(token).build(), r -> {
                });
            }
        }

        @JavascriptInterface
        public void restore() {
            if (billing.isReady()) Bridges.this.restore(true);
            else js("window.__znakexRestored && window.__znakexRestored(-1)");
        }
    }

    // ================================================================ Play Games (sign-in, cloud save, leaderboards)
    private static final String SAVE_NAME = "znakex_progress";
    private boolean gamesOn;

    private void startGames() {
        String pid = str("game_services_project_id");
        gamesOn = pid.length() > 3; // "0" until the Play Games project exists
        if (!gamesOn) return;
        PlayGamesSdk.initialize(act);
        // automatic sign-in: Play Games signs the player in by itself when they already use it
        PlayGames.getGamesSignInClient(act).isAuthenticated().addOnCompleteListener(t ->
                signedIn(t.isSuccessful() && t.getResult().isAuthenticated()));
    }

    private void signedIn(boolean ok) {
        if (!ok) {
            js("window.__znakexGames && window.__znakexGames(false,'')");
            return;
        }
        PlayGames.getPlayersClient(act).getCurrentPlayer().addOnCompleteListener(t -> {
            String name = t.isSuccessful() && t.getResult() != null ? t.getResult().getDisplayName() : "";
            js("window.__znakexGames && window.__znakexGames(true," + q(name) + ")");
        });
    }

    private class Games {
        @JavascriptInterface
        public boolean available() {
            return gamesOn;
        }

        /** answers __znakexGames again (the automatic sign-in can finish before the game has loaded) */
        @JavascriptInterface
        public void refresh() {
            if (!gamesOn) return;
            act.runOnUiThread(() -> PlayGames.getGamesSignInClient(act).isAuthenticated().addOnCompleteListener(t ->
                    signedIn(t.isSuccessful() && t.getResult().isAuthenticated())));
        }

        @JavascriptInterface
        public void signIn() {
            if (!gamesOn) return;
            act.runOnUiThread(() -> PlayGames.getGamesSignInClient(act).signIn().addOnCompleteListener(t ->
                    signedIn(t.isSuccessful() && t.getResult().isAuthenticated())));
        }

        /** reads the cloud copy of the progress: __znakexCloudLoaded(json or null) */
        @JavascriptInterface
        public void load() {
            if (!gamesOn) return;
            act.runOnUiThread(() -> PlayGames.getSnapshotsClient(act)
                    .open(SAVE_NAME, true, SnapshotsClient.RESOLUTION_POLICY_MOST_RECENTLY_MODIFIED)
                    .addOnCompleteListener(t -> {
                        String data = null;
                        try {
                            if (t.isSuccessful() && !t.getResult().isConflict()) {
                                Snapshot s = t.getResult().getData();
                                byte[] b = s.getSnapshotContents().readFully();
                                if (b != null && b.length > 0) data = new String(b, StandardCharsets.UTF_8);
                                PlayGames.getSnapshotsClient(act).discardAndClose(s);
                            }
                        } catch (Exception ignored) {
                        }
                        js("window.__znakexCloudLoaded && window.__znakexCloudLoaded(" + (data == null ? "null" : q(data)) + ")");
                    }));
        }

        /** writes the progress to the player's Google account */
        @JavascriptInterface
        public void save(final String json, final String description) {
            if (!gamesOn) return;
            act.runOnUiThread(() -> {
                final SnapshotsClient sc = PlayGames.getSnapshotsClient(act);
                sc.open(SAVE_NAME, true, SnapshotsClient.RESOLUTION_POLICY_MOST_RECENTLY_MODIFIED)
                        .addOnCompleteListener(t -> {
                            try {
                                if (!t.isSuccessful() || t.getResult().isConflict()) return;
                                Snapshot s = t.getResult().getData();
                                s.getSnapshotContents().writeBytes(json.getBytes(StandardCharsets.UTF_8));
                                sc.commitAndClose(s, new SnapshotMetadataChange.Builder().setDescription(description).build());
                            } catch (Exception ignored) {
                            }
                        });
            });
        }

        /** board: "classic" | "frenzy" (ids set in Play Console) */
        @JavascriptInterface
        public void submit(String board, long score) {
            String id = str("lb_" + board);
            if (!gamesOn || id.length() < 4) return;
            PlayGames.getLeaderboardsClient(act).submitScore(id, score);
        }

        @JavascriptInterface
        public void showLeaderboard(String board) {
            final String id = str("lb_" + board);
            if (!gamesOn) return;
            act.runOnUiThread(() -> {
                com.google.android.gms.tasks.Task<Intent> task = id.length() < 4
                        ? PlayGames.getLeaderboardsClient(act).getAllLeaderboardsIntent()
                        : PlayGames.getLeaderboardsClient(act).getLeaderboardIntent(id);
                task.addOnSuccessListener(i -> act.startActivityForResult(i, 9004));
            });
        }
    }
}
