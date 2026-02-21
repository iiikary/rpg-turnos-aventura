// =============================================
// CRÓNICAS DEL REINO OLVIDADO — Sistema de Audio
// Web Audio API — Sin archivos externos
// Optimizado para móvil y escritorio
// =============================================

const AUDIO = (() => {
    let ctx = null;
    let masterGain = null;
    let musicGain = null;
    let sfxGain = null;
    let compressor = null;
    let musicEnabled = true;
    let sfxEnabled = true;
    let musicPlaying = false;
    let musicNodes = [];
    let currentTheme = null;
    let initialized = false;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const VOL_MASTER = isMobile ? 0.85 : 0.72;
    const VOL_MUSIC  = isMobile ? 0.20 : 0.24;
    const VOL_SFX    = isMobile ? 0.52 : 0.56;

    // ---- INIT ----
    function init() {
        if (initialized) return;
        try {
            ctx = new (window.AudioContext || window.webkitAudioContext)();

            compressor = ctx.createDynamicsCompressor();
            compressor.threshold.value = -18;
            compressor.knee.value      = 8;
            compressor.ratio.value     = 4;
            compressor.attack.value    = 0.003;
            compressor.release.value   = 0.15;
            compressor.connect(ctx.destination);

            masterGain = ctx.createGain(); masterGain.gain.value = VOL_MASTER;
            masterGain.connect(compressor);
            musicGain  = ctx.createGain(); musicGain.gain.value  = VOL_MUSIC;
            musicGain.connect(masterGain);
            sfxGain    = ctx.createGain(); sfxGain.gain.value    = VOL_SFX;
            sfxGain.connect(masterGain);

            initialized = true;
        } catch (e) { console.warn('Web Audio no disponible:', e); }
    }

    function resume() {
        if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    }

    function safeCall(fn) {
        if (!ctx || !initialized) return;
        try { fn(); } catch(e) {}
    }

    // ---- UTILS ----
    function osc(type, freq, start, dur, gainVal, dest) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(gainVal, start);
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        o.connect(g); g.connect(dest || sfxGain);
        o.start(start); o.stop(start + dur + 0.01);
    }

    function noise(dur, gainVal, dest) {
        const rate = ctx.sampleRate;
        const buf  = ctx.createBuffer(1, Math.floor(rate * Math.min(dur, isMobile ? 0.1 : 0.5)), rate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource(), g = ctx.createGain();
        src.buffer = buf;
        g.gain.setValueAtTime(gainVal, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        src.connect(g); g.connect(dest || sfxGain);
        src.start(); src.stop(ctx.currentTime + dur);
    }

    // ---- SFX ----
    function playAttack()     { safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; osc('sawtooth',160,t,.07,.35); osc('square',80,t,.10,.25); noise(.05,.12); }); }
    function playCritical()   { safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; osc('square',110,t,.05,.45); osc('sawtooth',75,t,.10,.35); osc('square',55,t+.05,.14,.28); noise(.10,.28); osc('sine',1600,t,.07,.18); }); }
    function playEnemyHit()   { safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; osc('square',150,t,.05,.22); osc('sawtooth',90,t+.02,.07,.18); noise(.04,.09); }); }
    function playPlayerHit()  { safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; osc('square',110,t,.07,.28); osc('sawtooth',75,t,.09,.22); osc('sine',55,t+.04,.10,.18); noise(.06,.16); }); }
    function playArrow()      { safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(1100,t); o.frequency.exponentialRampToValueAtTime(380,t+.13); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.0001,t+.15); o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t+.18); noise(.03,.07); }); }
    function playHeal()       { safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; [523,659,784,1047].forEach((f,i)=>osc('sine',f,t+i*.09,.22,.18)); }); }
    function playDrain()      { safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(500,t); o.frequency.exponentialRampToValueAtTime(100,t+.45); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.0001,t+.5); o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t+.55); }); }
    function playPoison()     { safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; for(let i=0;i<(isMobile?3:5);i++) osc('sine',140+Math.random()*80,t+i*.06,.07,.1); }); }
    function playMagic()      { safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(300,t); o.frequency.exponentialRampToValueAtTime(900,t+.4); g.gain.setValueAtTime(.25,t); g.gain.exponentialRampToValueAtTime(.0001,t+.55); o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t+.6); for(let i=0;i<(isMobile?2:4);i++) osc('sine',800+Math.random()*1000,t+i*.08,.06,.07); }); }
    function playFireball()   { safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; const o=ctx.createOscillator(),g=ctx.createGain(); const f=ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=200; f.Q.value=5; o.type='sawtooth'; o.frequency.setValueAtTime(80,t); o.frequency.exponentialRampToValueAtTime(40,t+.3); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.4,t+.05); g.gain.exponentialRampToValueAtTime(.0001,t+.35); o.connect(f); f.connect(g); g.connect(sfxGain); o.start(t); o.stop(t+.4); noise(.2,.2); }); }
    function playBuff()       { safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; osc('triangle',420,t,.13,.18); osc('triangle',530,t+.1,.13,.16); osc('triangle',630,t+.2,.17,.18); }); }
    function playFlee()       { safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(380,t); o.frequency.exponentialRampToValueAtTime(1500,t+.22); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.0001,t+.28); o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t+.32); noise(.10,.08); }); }
    function playItemPickup() { safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; osc('sine',560,t,.06,.14); osc('sine',840,t+.06,.06,.11); osc('sine',1120,t+.12,.08,.09); }); }
    function playMenuClick()  { safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; osc('sine',820,t,.05,.11); osc('sine',1020,t+.03,.04,.07); }); }
    function playMenuSelect() { safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; osc('sine',620,t,.05,.13); osc('sine',930,t+.05,.06,.13); osc('sine',1240,t+.10,.07,.10); }); }
    function playNotification(){ safeCall(() => { if (!sfxEnabled) return; const t=ctx.currentTime; osc('sine',760,t,.07,.13); osc('sine',950,t+.07,.09,.11); }); }

    function playVictory() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            const mel = [{f:523,d:.12},{f:523,d:.12},{f:523,d:.12},{f:659,d:.45},{f:587,d:.12},{f:587,d:.12},{f:587,d:.12},{f:784,d:.5}];
            let time = t;
            mel.forEach(n => { osc('square',n.f,time,n.d*.88,.2); osc('triangle',n.f*2,time,n.d*.88,.07); time+=n.d+.02; });
        });
    }

    function playDefeat() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(400, t);
            o.frequency.exponentialRampToValueAtTime(100, t + 1.0);
            g.gain.setValueAtTime(.28, t);
            g.gain.exponentialRampToValueAtTime(.0001, t + 1.2);
            o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 1.3);
            osc('sawtooth', 200, t + .15, .85, .12);
        });
    }

    function playLevelUp() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            [261,329,392,523,659,784,1047].forEach((f,i) => { osc('triangle',f,t+i*.07,.32,.22); osc('sine',f*1.5,t+i*.07,.28,.06); });
            [523,659,784,1047].forEach(f => osc('sine',f,t+.55,.55,.12));
        });
    }

    function playBattleStart() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            osc('square',220,t,.08,.28); osc('square',330,t+.08,.08,.28); osc('square',440,t+.16,.14,.32); noise(.04,.16);
        });
    }

    // ---- MÚSICA PROCEDURAL ----
    const SCALES = {
        minor:    [0,2,3,5,7,8,10],
        major:    [0,2,4,5,7,9,11],
        phrygian: [0,1,3,5,7,8,10]
    };
    const THEMES = {
        menu:    { bpm:72,  rootNote:55, scale:'minor',    octaves:[3,4] },
        world:   { bpm:80,  rootNote:57, scale:'minor',    octaves:[3,4,5] },
        battle:  { bpm:140, rootNote:49, scale:'phrygian', octaves:[3,4] },
        victory: { bpm:100, rootNote:60, scale:'major',    octaves:[4,5] }
    };

    function midiToFreq(m) { return 440 * Math.pow(2, (m-69)/12); }

    function stopMusic(fadeTime=0.8) {
        if (!ctx || !musicPlaying) return;
        const t = ctx.currentTime;
        if (musicGain) {
            musicGain.gain.cancelScheduledValues(t);
            musicGain.gain.setValueAtTime(musicGain.gain.value, t);
            musicGain.gain.exponentialRampToValueAtTime(0.0001, t + fadeTime);
        }
        setTimeout(() => {
            musicNodes.forEach(n => { try { n.stop(); } catch(e){} });
            musicNodes = [];
            musicPlaying = false;
            if (musicGain && ctx) musicGain.gain.setValueAtTime(VOL_MUSIC, ctx.currentTime);
        }, (fadeTime + 0.15) * 1000);
    }

    // FIX MÓVIL: ctx.resume() antes y después del delay
    function playTheme(themeName) {
        if (!musicEnabled) return;
        if (!initialized) init();
        if (!ctx) return;
        if (currentTheme === themeName && musicPlaying) return;
        currentTheme = themeName;
        ctx.resume().catch(() => {});
        stopMusic(0.5);
        setTimeout(() => {
            if (!musicEnabled || !ctx) return;
            ctx.resume().then(() => startTheme(themeName)).catch(() => startTheme(themeName));
        }, 680);
    }

    function startTheme(themeName) {
        const theme = THEMES[themeName];
        if (!theme || !ctx) return;
        ctx.resume().catch(() => {});
        musicPlaying = true;

        const beatDur     = 60 / theme.bpm;
        const loopBars    = 8;
        const beatsPerBar = 4;
        const totalBeats  = loopBars * beatsPerBar;
        const loopDur     = beatDur * totalBeats;

        let reverbDest = musicGain;
        try {
            const conv  = ctx.createConvolver();
            const rvLen = Math.floor(ctx.sampleRate * (isMobile ? 0.5 : 1.1));
            const rvBuf = ctx.createBuffer(1, rvLen, ctx.sampleRate);
            const rvD   = rvBuf.getChannelData(0);
            for (let i = 0; i < rvLen; i++) rvD[i] = (Math.random()*2-1) * Math.pow(1-i/rvLen, 2.8);
            conv.buffer = rvBuf;
            const rvG   = ctx.createGain(); rvG.gain.value = isMobile ? 0.07 : 0.13;
            conv.connect(rvG); rvG.connect(musicGain);
            reverbDest = conv;
        } catch(e) {}

        function scheduleLoop(startTime) {
            if (!musicPlaying || !musicEnabled || !ctx) return;
            const scale = SCALES[theme.scale], root = theme.rootNote;

            // Melodía
            const leadG = ctx.createGain(); leadG.gain.value = 0.22; leadG.connect(musicGain);
            try { leadG.connect(reverbDest); } catch(e){}
            generateMelody(scale, root, theme.octaves, totalBeats, Math.floor(startTime*10)%100).forEach(({note,beat,duration}) => {
                const t = startTime + beat * beatDur, freq = midiToFreq(note);
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.type = 'triangle';
                o.frequency.setValueAtTime(freq, t);
                g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.28,t+.02);
                g.gain.setValueAtTime(.28, t+duration*beatDur*.7);
                g.gain.exponentialRampToValueAtTime(.0001, t+duration*beatDur*.95);
                o.connect(g); g.connect(leadG); o.start(t); o.stop(t+duration*beatDur+.05);
                musicNodes.push(o);
            });

            // Bajo
            if (!isMobile || themeName !== 'battle') {
                const bassG = ctx.createGain(); bassG.gain.value = 0.28; bassG.connect(musicGain);
                generateBass(scale, root, totalBeats).forEach(({note,beat,duration}) => {
                    const t = startTime + beat * beatDur, freq = midiToFreq(note-12);
                    const o = ctx.createOscillator(), g = ctx.createGain();
                    o.type = 'sine';
                    o.frequency.setValueAtTime(freq,t);
                    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.35,t+.01);
                    g.gain.exponentialRampToValueAtTime(.0001,t+duration*beatDur*.85);
                    o.connect(g); g.connect(bassG); o.start(t); o.stop(t+duration*beatDur+.05);
                    musicNodes.push(o);
                });
            }

            // Acordes (solo desktop)
            if (!isMobile) {
                const chordG = ctx.createGain(); chordG.gain.value = 0.07; chordG.connect(musicGain);
                try { chordG.connect(reverbDest); } catch(e){}
                getChordProg(theme.scale, root).forEach(({notes,bar}) => {
                    const t = startTime + bar * beatsPerBar * beatDur;
                    const dur = beatsPerBar * beatDur * 2;
                    notes.forEach(note => {
                        const o = ctx.createOscillator(), g = ctx.createGain();
                        o.type = 'sine'; o.frequency.setValueAtTime(midiToFreq(note),t);
                        g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.13,t+.1);
                        g.gain.setValueAtTime(.13,t+dur*.8); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
                        o.connect(g); g.connect(chordG); o.start(t); o.stop(t+dur+.1);
                        musicNodes.push(o);
                    });
                });
            }

            // Percusión
            if (themeName === 'battle') scheduleDrums(startTime, beatDur, totalBeats);

            setTimeout(() => {
                if (musicPlaying && musicEnabled && ctx && currentTheme === themeName)
                    scheduleLoop(startTime + loopDur);
            }, (loopDur - 0.3) * 1000);
        }

        scheduleLoop(ctx.currentTime + 0.1);
    }

    function generateMelody(scale, root, octaves, beats, seed) {
        const pattern = [], rng = mulberry32(seed);
        const steps = isMobile ? [1,1,2] : [.5,1,1,1,1.5,2];
        let beat = 0;
        while (beat < beats - 1) {
            const dur = steps[Math.floor(rng()*steps.length)];
            if (beat+dur > beats) break;
            const idx = Math.floor(rng()*scale.length);
            const oct = octaves[Math.floor(rng()*octaves.length)];
            if (rng() > .15) pattern.push({ note: root+scale[idx]+oct*12, beat, duration: dur });
            beat += dur;
        }
        return pattern;
    }

    function generateBass(scale, root, beats) {
        const pattern = [], bassNotes = [scale[0],scale[4],scale[2],scale[5]].map(n=>root+n);
        const barBeats = 4, bars = Math.floor(beats/barBeats);
        const pos = isMobile ? [[0,.8],[2,.8]] : [[0,.5],[2,.5],[2.5,.5],[3.5,.5]];
        for (let bar=0;bar<bars;bar++) {
            const note = bassNotes[bar%bassNotes.length];
            pos.forEach(([b,d]) => pattern.push({note, beat: bar*barBeats+b, duration: d}));
        }
        return pattern;
    }

    function getChordProg(scaleName, root) {
        const chords = { minor:[[0,3,7],[5,8,12],[3,7,10],[8,12,15]], major:[[0,4,7],[5,9,12],[7,11,14],[5,9,12]], phrygian:[[0,3,7],[1,5,8],[3,7,10],[8,12,15]] };
        return (chords[scaleName]||chords.minor).map((c,i) => ({ bar:i*2, notes:c.map(iv=>root+iv+48) }));
    }

    function scheduleDrums(startTime, beatDur, totalBeats) {
        const kickG = ctx.createGain(); kickG.gain.value = .38; kickG.connect(musicGain);
        const snrG  = ctx.createGain(); snrG.gain.value  = .18; snrG.connect(musicGain);
        const max   = isMobile ? Math.min(totalBeats, 16) : totalBeats;
        for (let beat=0; beat<max; beat++) {
            const t = startTime + beat * beatDur, sub = beat % 4;
            if (sub===0||sub===2) {
                const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine';
                o.frequency.setValueAtTime(95,t); o.frequency.exponentialRampToValueAtTime(38,t+.09);
                g.gain.setValueAtTime(.45,t); g.gain.exponentialRampToValueAtTime(.0001,t+.13);
                o.connect(g); g.connect(kickG); o.start(t); o.stop(t+.16); musicNodes.push(o);
            }
            if (sub===1||sub===3) {
                const rate=ctx.sampleRate, sz=Math.floor(rate*.06), buf=ctx.createBuffer(1,sz,rate);
                const d=buf.getChannelData(0); for(let i=0;i<sz;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/sz,1.5);
                const src=ctx.createBufferSource(), g=ctx.createGain(); src.buffer=buf;
                g.gain.setValueAtTime(.28,t); g.gain.exponentialRampToValueAtTime(.0001,t+.06);
                src.connect(g); g.connect(snrG); src.start(t); src.stop(t+.08); musicNodes.push(src);
            }
            if (!isMobile && beat%2===1) {
                const rate=ctx.sampleRate, sz=Math.floor(rate*.025), buf=ctx.createBuffer(1,sz,rate);
                const d=buf.getChannelData(0); for(let i=0;i<sz;i++) d[i]=Math.random()*2-1;
                const src=ctx.createBufferSource(), hp=ctx.createBiquadFilter(), g=ctx.createGain();
                hp.type='highpass'; hp.frequency.value=9000; src.buffer=buf;
                g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.0001,t+.025);
                src.connect(hp); hp.connect(g); g.connect(snrG); src.start(t); src.stop(t+.03); musicNodes.push(src);
            }
        }
    }

    function mulberry32(seed) {
        return function() {
            seed|=0; seed=seed+0x6D2B79F5|0;
            let z=Math.imul(seed^seed>>>15,1|seed);
            z=z+Math.imul(z^z>>>7,61|z)^z;
            return ((z^z>>>14)>>>0)/4294967296;
        };
    }

    // ---- CONTROLES ----
    function toggleMusic() {
        musicEnabled = !musicEnabled;
        if (!musicEnabled) { stopMusic(); currentTheme = null; }
        else if (currentTheme && ctx) { const s=currentTheme; currentTheme=null; setTimeout(()=>playTheme(s),200); }
        return musicEnabled;
    }
    function toggleSFX()             { sfxEnabled = !sfxEnabled; return sfxEnabled; }
    function setMusicVolume(v)        { if (musicGain&&ctx) musicGain.gain.setTargetAtTime(Math.max(.0001,v*VOL_MUSIC),ctx.currentTime,.08); }
    function setSFXVolume(v)          { if (sfxGain&&ctx)   sfxGain.gain.setTargetAtTime(Math.max(.0001,v*VOL_SFX),ctx.currentTime,.08); }

    return {
        init, resume,
        attack: playAttack, magic: playMagic, fireball: playFireball, arrow: playArrow,
        heal: playHeal, drain: playDrain, poison: playPoison, buff: playBuff,
        critical: playCritical, enemyHit: playEnemyHit, playerHit: playPlayerHit,
        victory: playVictory, defeat: playDefeat, levelUp: playLevelUp,
        battleStart: playBattleStart, click: playMenuClick, select: playMenuSelect,
        notification: playNotification, flee: playFlee, itemPickup: playItemPickup,
        playTheme, stopMusic, toggleMusic, toggleSFX, setMusicVolume, setSFXVolume,
        get musicEnabled() { return musicEnabled; },
        get sfxEnabled()   { return sfxEnabled; }
    };
})();

// Bootstrap: múltiples eventos incluyendo touch
let _audioReady = false;
function _audioBootstrap() {
    if (_audioReady) return;
    _audioReady = true;
    AUDIO.init();
    AUDIO.resume();
}
['click','touchstart','touchend','keydown'].forEach(evt =>
    document.addEventListener(evt, _audioBootstrap, { once: true, passive: true })
);
