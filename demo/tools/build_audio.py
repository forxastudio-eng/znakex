"""Game audio from the generated files ("sound effectts/", "musica/"): trims silence, evens out loudness,
makes the loops seamless and writes demo/assets/audio/<name>.ogg (Vorbis: small and gapless when looping).
Needs ffmpeg (pip install imageio-ffmpeg)."""
import glob, os, subprocess
import numpy as np

try:
    import imageio_ffmpeg
    FF = imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:
    FF = 'ffmpeg'
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'demo', 'assets', 'audio')
SR = 44100

# game name -> start of the generated file name (the prompt text)
SFX = {
    'ui_tap': 'soft-wooden-tap-with', 'ui_back': 'lowerpitched-wooden-tap', 'ui_open': 'gentle-stone-panel',
    'ui_locked': 'dull-stone-thud', 'coin': 'single-worn-gold-coin', 'reward_chime': 'warm-rising-threenote',
    'eat_red': 'small-juicy-pop', 'eat_gold': 'big-golden-orb-chomp', 'boost_loop': 'seamless-loop.-soft',
    'boost_end': 'wind-flash-slowing', 'turn': 'extremely-subtle-scale', 'countdown_tick': 'wooden-block-tick',
    'countdown_go': 'stronger-tick-plus', 'die_hit': 'stronger-stone-impact-wal', 'die_liquid': 'splash-plus-bubbling',
    'crumble': 'snake-dissolving-into', 'revive': 'a-golden-light-returning', 'level_win': 'triumphant-short-fanfare',
    'level_fail': 'descending-threenote-wood', 'star_pop': 'glassy-star-popping', 'item_spawn': 'item-appearing-light',
    'item_pick': 'magical-pickup-bell', 'shield_break': 'bubble-shell-shattering', 'magnet_loop': 'soft-pulsing-magnetic',
    'portal_whoosh': 'swirling-airy-vortex', 'star_loop': 'radiant-soft-shimmering', 'alert_pulse': 'low-soft-pulsing-alarm',
    'map_change': 'stone-blocks-grinding', 'mission_done': 'wooden-checkmark-tick', 'new_record': 'sparkling-rising-arpeggio',
}
MUSIC = {
    'mus_menu': 'warm-mystical-forest', 'mus_story': 'adventurous-exploration', 'mus_classic': 'focused-hypnotic-groove',
    'mus_frenzy': 'fast-energetic-tribal', 'mus_duel': 'tense-rivalry-theme', 'mus_season': 'autumn-harvestmoon',
}
LOOPS = {'boost_loop', 'magnet_loop', 'star_loop'}
# peak level (dBFS) and maximum length (s) per effect; the rest -3 dB / 2.5 s
PEAK = {'ui_tap': -7, 'ui_back': -8, 'ui_open': -9, 'ui_locked': -7, 'turn': -14, 'countdown_tick': -5,
        'boost_loop': -10, 'magnet_loop': -10, 'star_loop': -9, 'alert_pulse': -6, 'coin': -5}
MAXLEN = {'ui_tap': 0.25, 'ui_back': 0.25, 'ui_open': 0.6, 'ui_locked': 0.45, 'turn': 0.15, 'countdown_tick': 0.3,
          'eat_red': 0.45, 'coin': 0.5, 'star_pop': 0.8, 'countdown_go': 0.8}


def find(folder, prefix):
    m = [f for f in glob.glob(os.path.join(ROOT, folder, '*.mp3')) if os.path.basename(f).startswith('magnific_' + prefix)]
    if len(m) != 1:
        raise SystemExit(f'{prefix}: {m}')
    return m[0]


def decode(path, ch):
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-f', 'f32le', '-ac', str(ch), '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, ch).copy()


def encode(a, path, q):
    ch = a.shape[1]
    subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ac', str(ch), '-ar', str(SR), '-i', '-', '-c:a', 'libvorbis', '-q:a', str(q), path],
                   input=np.clip(a, -1, 1).astype(np.float32).tobytes(), check=True)


def db(x): return 10 ** (x / 20)


def seamless(a, fade_s):
    """crossfade the tail into the head so the clip repeats without a click"""
    n = int(fade_s * SR)
    if len(a) < 3 * n:
        return a
    w = np.linspace(0, 1, n)[:, None]
    head = a[:n] * w + a[-n:] * (1 - w)
    return np.concatenate([head, a[n:-n]])


def sfx(name, src):
    a = decode(src, 1)
    env = np.abs(a[:, 0])
    thr = db(-48) * max(env.max(), 1e-6) / db(0)
    if name not in LOOPS:
        on = np.where(env > max(thr, db(-60)))[0]
        if len(on):
            s = max(0, on[0] - int(0.004 * SR))
            e = min(len(a), on[-1] + int(0.06 * SR))
            a = a[s:e]
        m = int(MAXLEN.get(name, 2.5) * SR)
        if len(a) > m:
            a = a[:m]
        f = min(len(a) // 3, int(0.05 * SR))
        a[-f:] *= np.linspace(1, 0, f)[:, None]
        a[:int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))[:, None]
    else:
        a = seamless(a, 0.3)
    a *= db(PEAK.get(name, -3)) / max(np.abs(a).max(), 1e-6)
    encode(a, os.path.join(OUT, name + '.ogg'), 4)
    return len(a) / SR


def music(name, src):
    a = decode(src, 2)
    rms = np.sqrt((a ** 2).mean())
    a *= db(-17) / rms  # every theme at the same loudness
    a = seamless(a, 1.5)
    pk = np.abs(a).max()
    if pk > db(-1):
        a *= db(-1) / pk
    encode(a, os.path.join(OUT, name + '.ogg'), 3)
    return len(a) / SR


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for n, p in SFX.items():
        print(n, round(sfx(n, find('sound effectts', p)), 2))
    for n, p in MUSIC.items():
        print(n, round(music(n, find('musica', p)), 2))
