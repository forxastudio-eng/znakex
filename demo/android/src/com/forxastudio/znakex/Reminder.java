package com.forxastudio.znakex;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;

import java.util.Calendar;

/**
 * Gentle "come back and play" reminders.
 * - At most one a day, in the evening (inexact alarm, no special permission), and only on days the
 *   player has not opened the game.
 * - After 3 reminders in a row with no visit, they stop until the game is opened again.
 * - The texts come from the game in the player's language; the player can turn them off in Settings.
 */
public class Reminder extends BroadcastReceiver {
    static final String PREFS = "znakex_reminders";
    private static final String CHANNEL = "reminders";
    private static final int MAX_UNANSWERED = 3;

    static long today() {
        Calendar c = Calendar.getInstance();
        return c.get(Calendar.YEAR) * 1000L + c.get(Calendar.DAY_OF_YEAR);
    }

    /** Called each time the game opens: remembers the visit and plans tomorrow's evening reminder. */
    static void schedule(Context ctx, String messagesJson) {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        p.edit().putString("messages", messagesJson).putLong("lastPlay", today()).putInt("unanswered", 0).putBoolean("on", true).apply();
        setAlarm(ctx, 1);
    }

    static void cancel(Context ctx) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean("on", false).apply();
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am != null) am.cancel(pending(ctx));
    }

    private static PendingIntent pending(Context ctx) {
        Intent i = new Intent(ctx, Reminder.class);
        return PendingIntent.getBroadcast(ctx, 7, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** an evening window (18:30-20:30) `days` days from now; the system picks the moment, saving battery */
    private static void setAlarm(Context ctx, int days) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        Calendar c = Calendar.getInstance();
        c.add(Calendar.DAY_OF_YEAR, days);
        c.set(Calendar.HOUR_OF_DAY, 18);
        c.set(Calendar.MINUTE, 30);
        c.set(Calendar.SECOND, 0);
        am.setWindow(AlarmManager.RTC, c.getTimeInMillis(), 2 * 60 * 60 * 1000L, pending(ctx));
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (!p.getBoolean("on", false)) return;
        int unanswered = p.getInt("unanswered", 0);
        if (p.getLong("lastPlay", 0) == today()) { setAlarm(ctx, 1); return; } // already played today
        if (unanswered >= MAX_UNANSWERED) return; // stop nagging: the next visit starts them again
        try {
            JSONArray msgs = new JSONArray(p.getString("messages", "[]"));
            if (msgs.length() > 0) {
                int idx = p.getInt("next", 0) % msgs.length();
                post(ctx, msgs.getString(idx));
                p.edit().putInt("next", idx + 1).putInt("unanswered", unanswered + 1).apply();
            }
        } catch (Exception ignored) {
        }
        setAlarm(ctx, 1);
    }

    /** resources by name: the R class lives in a different package in the tester and release builds */
    private static int res(Context ctx, String type, String name) {
        return ctx.getResources().getIdentifier(name, type, ctx.getPackageName());
    }

    @SuppressWarnings("deprecation")
    private static void post(Context ctx, String text) {
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            try {
                // NotificationChannel is API 26: created by reflection so the app still builds against API 23
                Class<?> ch = Class.forName("android.app.NotificationChannel");
                Object channel = ch.getConstructor(String.class, CharSequence.class, int.class)
                        .newInstance(CHANNEL, ctx.getString(res(ctx, "string", "reminders")), 2 /* IMPORTANCE_LOW: no sound */);
                NotificationManager.class.getMethod("createNotificationChannel", ch).invoke(nm, channel);
                b = Notification.Builder.class.getConstructor(Context.class, String.class).newInstance(ctx, CHANNEL);
            } catch (Exception e) {
                b = new Notification.Builder(ctx);
            }
        } else {
            b = new Notification.Builder(ctx);
        }
        Intent open = new Intent(ctx, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(ctx, 8, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        b.setSmallIcon(res(ctx, "drawable", "ic_notify"))
                .setContentTitle("ZNAKEX")
                .setContentText(text)
                .setStyle(new Notification.BigTextStyle().bigText(text))
                .setColor(0xFF00A04A)
                .setAutoCancel(true)
                .setContentIntent(pi)
                .setPriority(Notification.PRIORITY_LOW);
        nm.notify(1, b.build());
    }
}
