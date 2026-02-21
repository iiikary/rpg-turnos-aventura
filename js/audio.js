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

    // Detectar móvil para ajustar cargas
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const VOL_MASTER = isMobile ? 0.8 : 0.7;
    const VOL_MUSIC  = isMobile ? 0.18 : 0.22;
    const VOL_SFX    = isMobile ? 0.5  : 0.55;

    // ---- INICIALIZACIÓN ----
    function init() {
        if (initialized) return;
        try {
            ctx = new (window.AudioContext || window.webkitAudioContext)();

            // Compresor dinámico — evita distorsión y clipping en móvil
            compressor = ctx.createDynamicsCompressor();
            compressor.threshold.value = -18;
            compressor.knee.value      = 8;
            compressor.ratio.value     = 4;
            compressor.attack.value    = 0.003;
            compressor.release.value   = 0.15;
            compressor.connect(ctx.destination);

            masterGain = ctx.createGain();
            masterGain.gain.value = VOL_MASTER;
            masterGain.connect(compressor);

            musicGain = ctx.createGain();
            musicGain.gain.value = VOL_MUSIC;
            musicGain.connect(masterGain);

            sfxGain = ctx.createGain();
            sfxGain.gain.value = VOL_SFX;
            sfxGain.connect(masterGain);

            initialized = true;
        } catch (e) {
            console.warn('Web Audio API no disponible:', e);
        }
    }

    function resume() {
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
    }

    function safeCall(fn) {
        if (!ctx || !initialized) return;
        try { fn(); } catch(e) { /* silenciar errores de audio */ }
    }

    // ---- UTILIDADES ----
    function osc(type, freq, start, dur, gainVal, dest) {
        if (!ctx) return;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(gainVal, start);
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        o.connect(g);
        g.connect(dest || sfxGain);
        o.start(start);
        o.stop(start + dur + 0.01);
    }

    function noise(dur, gainVal, dest) {
        if (!ctx) return;
        // En móvil usar buffer más pequeño para ahorrar CPU
        const rate    = ctx.sampleRate;
        const bufSize = Math.floor(rate * Math.min(dur, isMobile ? 0.1 : 0.5));
        const buffer  = ctx.createBuffer(1, bufSize, rate);
        const data    = buffer.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const g = ctx.createGain();
        g.gain.setValueAtTime(gainVal, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        src.connect(g);
        g.connect(dest || sfxGain);
        src.start();
        src.stop(ctx.currentTime + dur);
    }

    function bpf(freq, q) {
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = freq;
        f.Q.value = q || 1;
        return f;
    }

    function hpf(freq) {
        const f = ctx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = freq;
        return f;
    }

    // ---- EFECTOS DE SONIDO ----

    function playAttack() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            osc('sawtooth', 160, t, 0.07, 0.35);
            osc('square',   80,  t, 0.10, 0.25);
            noise(0.05, 0.12);
        });
    }

    function playMagic() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            const o1 = ctx.createOscillator();
            const g1 = ctx.createGain();
            o1.type = 'sine';
            o1.frequency.setValueAtTime(300, t);
            o1.frequency.exponentialRampToValueAtTime(900, t + 0.4);
            g1.gain.setValueAtTime(0.25, t);
            g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
            o1.connect(g1); g1.connect(sfxGain);
            o1.start(t); o1.stop(t + 0.6);
            // Menos chispas en móvil
            const sparks = isMobile ? 2 : 4;
            for (let i = 0; i < sparks; i++) {
                osc('sine', 800 + Math.random() * 1000, t + i * 0.08, 0.06, 0.07);
            }
        });
    }

    function playFireball() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            const f = bpf(200, 5);
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(80, t);
            o.frequency.exponentialRampToValueAtTime(40, t + 0.3);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.4, t + 0.05);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
            o.connect(f); f.connect(g); g.connect(sfxGain);
            o.start(t); o.stop(t + 0.4);
            noise(0.2, 0.2);
            if (!isMobile) {
                for (let i = 0; i < 4; i++)
                    osc('sawtooth', 100 + Math.random() * 200, t + Math.random() * 0.2, 0.05, 0.08);
            }
        });
    }

    function playArrow() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(1100, t);
            o.frequency.exponentialRampToValueAtTime(380, t + 0.13);
            g.gain.setValueAtTime(0.18, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
            o.connect(g); g.connect(sfxGain);
            o.start(t); o.stop(t + 0.18);
            noise(0.03, 0.07);
        });
    }

    function playHeal() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            [523, 659, 784, 1047].forEach((freq, i) => {
                osc('sine', freq, t + i * 0.09, 0.22, 0.18);
            });
        });
    }

    function playDrain() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(500, t);
            o.frequency.exponentialRampToValueAtTime(100, t + 0.45);
            g.gain.setValueAtTime(0.18, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
            o.connect(g); g.connect(sfxGain);
            o.start(t); o.stop(t + 0.55);
        });
    }

    function playPoison() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            const count = isMobile ? 3 : 5;
            for (let i = 0; i < count; i++)
                osc('sine', 140 + Math.random() * 80, t + i * 0.06, 0.07, 0.1);
        });
    }

    function playCritical() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            osc('square',   110, t,        0.05, 0.45);
            osc('sawtooth', 75,  t,        0.10, 0.35);
            osc('square',   55,  t + 0.05, 0.14, 0.28);
            noise(0.10, 0.28);
            osc('sine', 1600, t, 0.07, 0.18);
        });
    }

    function playEnemyHit() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            osc('square',   150, t,        0.05, 0.22);
            osc('sawtooth', 90,  t + 0.02, 0.07, 0.18);
            noise(0.04, 0.09);
        });
    }

    function playPlayerHit() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            osc('square',   110, t,        0.07, 0.28);
            osc('sawtooth', 75,  t,        0.09, 0.22);
            osc('sine',     55,  t + 0.04, 0.10, 0.18);
            noise(0.06, 0.16);
        });
    }

    function playVictory() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            const mel = [
                {f:523,d:0.12},{f:523,d:0.12},{f:523,d:0.12},{f:659,d:0.45},
                {f:587,d:0.12},{f:587,d:0.12},{f:587,d:0.12},{f:784,d:0.5}
            ];
            let time = t;
            mel.forEach(n => {
                osc('square',   n.f,     time, n.d * 0.88, 0.2);
                osc('triangle', n.f * 2, time, n.d * 0.88, 0.07);
                time += n.d + 0.02;
            });
        });
    }

    function playDefeat() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(400, t);
            o.frequency.exponentialRampToValueAtTime(100, t + 1.0);
            g.gain.setValueAtTime(0.28, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
            o.connect(g); g.connect(sfxGain);
            o.start(t); o.stop(t + 1.3);
            osc('sawtooth', 200, t + 0.15, 0.85, 0.12);
        });
    }

    function playLevelUp() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            [261, 329, 392, 523, 659, 784, 1047].forEach((freq, i) => {
                osc('triangle', freq,       t + i * 0.07, 0.32, 0.22);
                osc('sine',     freq * 1.5, t + i * 0.07, 0.28, 0.06);
            });
            [523, 659, 784, 1047].forEach(f => osc('sine', f, t + 0.55, 0.55, 0.12));
        });
    }

    function playBattleStart() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            osc('square', 220, t,        0.08, 0.28);
            osc('square', 330, t + 0.08, 0.08, 0.28);
            osc('square', 440, t + 0.16, 0.14, 0.32);
            noise(0.04, 0.16);
        });
    }

    function playMenuClick() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            osc('sine', 820, t,        0.05, 0.11);
            osc('sine', 1020, t + 0.03, 0.04, 0.07);
        });
    }

    function playMenuSelect() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            osc('sine', 620,  t,        0.05, 0.13);
            osc('sine', 930,  t + 0.05, 0.06, 0.13);
            osc('sine', 1240, t + 0.10, 0.07, 0.10);
        });
    }

    function playNotification() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            osc('sine', 760,  t,        0.07, 0.13);
            osc('sine', 950,  t + 0.07, 0.09, 0.11);
        });
    }

    function playFlee() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(380, t);
            o.frequency.exponentialRampToValueAtTime(1500, t + 0.22);
            g.gain.setValueAtTime(0.18, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
            o.connect(g); g.connect(sfxGain);
            o.start(t); o.stop(t + 0.32);
            noise(0.10, 0.08);
        });
    }

    function playItemPickup() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            osc('sine', 560,  t,        0.06, 0.14);
            osc('sine', 840,  t + 0.06, 0.06, 0.11);
            osc('sine', 1120, t + 0.12, 0.08, 0.09);
        });
    }

    function playBuff() {
        safeCall(() => {
            if (!sfxEnabled) return;
            const t = ctx.currentTime;
            osc('triangle', 420, t,        0.13, 0.18);
            osc('triangle', 530, t + 0.10, 0.13, 0.16);
            osc('triangle', 630, t + 0.20, 0.17, 0.18);
        });
    }

    // ---- MÚSICA PROCEDURAL ----

    const SCALES = {
        minor:    [0, 2, 3, 5, 7, 8, 10],
        major:    [0, 2, 4, 5, 7, 9, 11],
        phrygian: [0, 1, 3, 5, 7, 8, 10]
    };

    const THEMES = {
        menu:    { bpm: 72,  rootNote: 55, scale: 'minor',    octaves: [3,4] },
        world:   { bpm: 80,  rootNote: 57, scale: 'minor',    octaves: [3,4,5] },
        battle:  { bpm: 140, rootNote: 49, scale: 'phrygian', octaves: [3,4] },
        victory: { bpm: 100, rootNote: 60, scale: 'major',    octaves: [4,5] }
    };

    function midiToFreq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    function stopMusic(fadeTime = 0.8) {
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

    function playTheme(themeName) {
        if (!musicEnabled || !ctx) return;
        if (currentTheme === themeName && musicPlaying) return;
        currentTheme = themeName;
        stopMusic(0.5);
        setTimeout(() => {
            if (!musicEnabled || !ctx) return;
            startTheme(themeName);
        }, 650);
    }

    function startTheme(themeName) {
        const theme = THEMES[themeName];
        if (!theme) return;
        musicPlaying = true;

        const beatDur     = 60 / theme.bpm;
        const loopBars    = 8;
        const beatsPerBar = 4;
        const totalBeats  = loopBars * beatsPerBar;
        const loopDur     = beatDur * totalBeats;

        // Reverb ligero — buffer reducido en móvil
        let reverbDest = musicGain;
        try {
            const convolver = ctx.createConvolver();
            const rvLen     = Math.floor(ctx.sampleRate * (isMobile ? 0.6 : 1.2));
            const rvBuf     = ctx.createBuffer(1, rvLen, ctx.sampleRate);
            const rvData    = rvBuf.getChannelData(0);
            for (let i = 0; i < rvLen; i++)
                rvData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rvLen, 2.8);
            convolver.buffer = rvBuf;
            const rvGain = ctx.createGain();
            rvGain.gain.value = isMobile ? 0.08 : 0.14;
            convolver.connect(rvGain);
            rvGain.connect(musicGain);
            reverbDest = convolver;
        } catch(e) { /* sin reverb si falla */ }

        function scheduleLoop(startTime) {
            if (!musicPlaying || !musicEnabled || !ctx) return;

            const scale = SCALES[theme.scale];
            const root  = theme.rootNote;

            // --- MELODÍA ---
            const leadGain = ctx.createGain();
            leadGain.gain.value = 0.22;
            leadGain.connect(musicGain);
            try { leadGain.connect(reverbDest); } catch(e){}

            const seed    = Math.floor(startTime * 10) % 100;
            const pattern = generateMelody(scale, root, theme.octaves, totalBeats, seed);
            pattern.forEach(({ note, beat, duration }) => {
                const t    = startTime + beat * beatDur;
                const freq = midiToFreq(note);
                const o    = ctx.createOscillator();
                const g    = ctx.createGain();
                o.type = 'triangle';
                o.frequency.setValueAtTime(freq, t);
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.28, t + 0.02);
                g.gain.setValueAtTime(0.28, t + duration * beatDur * 0.7);
                g.gain.exponentialRampToValueAtTime(0.0001, t + duration * beatDur * 0.95);
                o.connect(g); g.connect(leadGain);
                o.start(t); o.stop(t + duration * beatDur + 0.05);
                musicNodes.push(o);
            });

            // --- BAJO ---
            if (!isMobile || themeName !== 'battle') { // aligerar en battle móvil
                const bassGain = ctx.createGain();
                bassGain.gain.value = 0.28;
                bassGain.connect(musicGain);
                const bassPattern = generateBass(scale, root, totalBeats);
                bassPattern.forEach(({ note, beat, duration }) => {
                    const t    = startTime + beat * beatDur;
                    const freq = midiToFreq(note - 12);
                    const o    = ctx.createOscillator();
                    const g    = ctx.createGain();
                    o.type = 'sine';
                    o.frequency.setValueAtTime(freq, t);
                    g.gain.setValueAtTime(0, t);
                    g.gain.linearRampToValueAtTime(0.35, t + 0.01);
                    g.gain.exponentialRampToValueAtTime(0.0001, t + duration * beatDur * 0.85);
                    o.connect(g); g.connect(bassGain);
                    o.start(t); o.stop(t + duration * beatDur + 0.05);
                    musicNodes.push(o);
                });
            }

            // --- ACORDES ---
            if (!isMobile) {
                const chordGain = ctx.createGain();
                chordGain.gain.value = 0.07;
                chordGain.connect(musicGain);
                try { chordGain.connect(reverbDest); } catch(e){}
                getChordProg(theme.scale, root).forEach(({ notes, bar }) => {
                    const t   = startTime + bar * beatsPerBar * beatDur;
                    const dur = beatsPerBar * beatDur * 2;
                    notes.forEach(note => {
                        const o = ctx.createOscillator();
                        const g = ctx.createGain();
                        o.type = 'sine';
                        o.frequency.setValueAtTime(midiToFreq(note), t);
                        g.gain.setValueAtTime(0, t);
                        g.gain.linearRampToValueAtTime(0.13, t + 0.1);
                        g.gain.setValueAtTime(0.13, t + dur * 0.8);
                        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
                        o.connect(g); g.connect(chordGain);
                        o.start(t); o.stop(t + dur + 0.1);
                        musicNodes.push(o);
                    });
                });
            }

            // --- PERCUSIÓN (battle) ---
            if (themeName === 'battle') {
                scheduleDrums(startTime, beatDur, totalBeats);
            }

            // Siguiente loop
            setTimeout(() => {
                if (musicPlaying && musicEnabled && ctx && currentTheme === themeName)
                    scheduleLoop(startTime + loopDur);
            }, (loopDur - 0.3) * 1000);
        }

        scheduleLoop(ctx.currentTime + 0.1);
    }

    function generateMelody(scale, root, octaves, beats, seed) {
        const pattern = [];
        let beat = 0;
        const rng = mulberry32(seed);
        const stepOpts = isMobile ? [1, 1, 2] : [0.5, 1, 1, 1, 1.5, 2];

        while (beat < beats - 1) {
            const dur = stepOpts[Math.floor(rng() * stepOpts.length)];
            if (beat + dur > beats) break;
            const scaleIdx = Math.floor(rng() * scale.length);
            const oct      = octaves[Math.floor(rng() * octaves.length)];
            const note     = root + scale[scaleIdx] + oct * 12;
            if (rng() > 0.15) pattern.push({ note, beat, duration: dur });
            beat += dur;
        }
        return pattern;
    }

    function generateBass(scale, root, beats) {
        const pattern = [];
        const bassNotes = [scale[0], scale[4], scale[2], scale[5]].map(n => root + n);
        const barBeats  = 4;
        const bars      = Math.floor(beats / barBeats);
        const positions = isMobile ? [[0, 0.8], [2, 0.8]] : [[0, 0.5], [2, 0.5], [2.5, 0.5], [3.5, 0.5]];
        for (let bar = 0; bar < bars; bar++) {
            const note = bassNotes[bar % bassNotes.length];
            positions.forEach(([b, d]) =>
                pattern.push({ note, beat: bar * barBeats + b, duration: d })
            );
        }
        return pattern;
    }

    function getChordProg(scaleName, root) {
        const chords = {
            minor:    [[0,3,7],[5,8,12],[3,7,10],[8,12,15]],
            major:    [[0,4,7],[5,9,12],[7,11,14],[5,9,12]],
            phrygian: [[0,3,7],[1,5,8],[3,7,10],[8,12,15]]
        };
        return (chords[scaleName] || chords.minor).map((chord, i) => ({
            bar: i * 2,
            notes: chord.map(interval => root + interval + 48)
        }));
    }

    function scheduleDrums(startTime, beatDur, totalBeats) {
        const kickGain  = ctx.createGain(); kickGain.gain.value  = 0.38; kickGain.connect(musicGain);
        const snareGain = ctx.createGain(); snareGain.gain.value = 0.18; snareGain.connect(musicGain);
        // En móvil solo kick + snare, sin hi-hats (ahorran CPU)
        const maxBeat = isMobile ? Math.min(totalBeats, 16) : totalBeats;

        for (let beat = 0; beat < maxBeat; beat++) {
            const t       = startTime + beat * beatDur;
            const subBeat = beat % 4;

            // Kick en tiempos 0 y 2
            if (subBeat === 0 || subBeat === 2) {
                const ko = ctx.createOscillator();
                const kg = ctx.createGain();
                ko.type = 'sine';
                ko.frequency.setValueAtTime(95, t);
                ko.frequency.exponentialRampToValueAtTime(38, t + 0.09);
                kg.gain.setValueAtTime(0.45, t);
                kg.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
                ko.connect(kg); kg.connect(kickGain);
                ko.start(t); ko.stop(t + 0.16);
                musicNodes.push(ko);
            }

            // Snare en tiempos 1 y 3
            if (subBeat === 1 || subBeat === 3) {
                const rate    = ctx.sampleRate;
                const bufSize = Math.floor(rate * 0.06);
                const sBuf    = ctx.createBuffer(1, bufSize, rate);
                const sData   = sBuf.getChannelData(0);
                for (let i = 0; i < bufSize; i++)
                    sData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.5);
                const src = ctx.createBufferSource();
                src.buffer = sBuf;
                const sg = ctx.createGain();
                sg.gain.setValueAtTime(0.28, t);
                sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
                src.connect(sg); sg.connect(snareGain);
                src.start(t); src.stop(t + 0.08);
                musicNodes.push(src);
            }

            // Hi-hat solo en escritorio, cada 2 beats (no en cada entero)
            if (!isMobile && beat % 2 === 1) {
                const rate    = ctx.sampleRate;
                const bufSize = Math.floor(rate * 0.025);
                const hBuf    = ctx.createBuffer(1, bufSize, rate);
                const hData   = hBuf.getChannelData(0);
                for (let i = 0; i < bufSize; i++) hData[i] = Math.random() * 2 - 1;
                const src  = ctx.createBufferSource();
                src.buffer = hBuf;
                const hp   = hpf(9000);
                const hg   = ctx.createGain();
                hg.gain.setValueAtTime(0.12, t);
                hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
                src.connect(hp); hp.connect(hg); hg.connect(snareGain);
                src.start(t); src.stop(t + 0.03);
                musicNodes.push(src);
            }
        }
    }

    // PRNG determinista
    function mulberry32(seed) {
        return function() {
            seed |= 0; seed = seed + 0x6D2B79F5 | 0;
            let z = Math.imul(seed ^ seed >>> 15, 1 | seed);
            z = z + Math.imul(z ^ z >>> 7, 61 | z) ^ z;
            return ((z ^ z >>> 14) >>> 0) / 4294967296;
        };
    }

    // ---- CONTROLES ----
    function toggleMusic() {
        musicEnabled = !musicEnabled;
        if (!musicEnabled) { stopMusic(); currentTheme = null; }
        else if (currentTheme && ctx) {
            const saved = currentTheme;
            currentTheme = null;
            setTimeout(() => playTheme(saved), 200);
        }
        return musicEnabled;
    }

    function toggleSFX() {
        sfxEnabled = !sfxEnabled;
        return sfxEnabled;
    }

    function setMusicVolume(v) {
        if (!musicGain || !ctx) return;
        const target = Math.max(0.0001, v * VOL_MUSIC);
        musicGain.gain.setTargetAtTime(target, ctx.currentTime, 0.08);
    }

    function setSFXVolume(v) {
        if (!sfxGain || !ctx) return;
        const target = Math.max(0.0001, v * VOL_SFX);
        sfxGain.gain.setTargetAtTime(target, ctx.currentTime, 0.08);
    }

    // ---- API PÚBLICA ----
    return {
        init, resume,
        attack:      playAttack,
        magic:       playMagic,
        fireball:    playFireball,
        arrow:       playArrow,
        heal:        playHeal,
        drain:       playDrain,
        poison:      playPoison,
        critical:    playCritical,
        enemyHit:    playEnemyHit,
        playerHit:   playPlayerHit,
        victory:     playVictory,
        defeat:      playDefeat,
        levelUp:     playLevelUp,
        battleStart: playBattleStart,
        click:       playMenuClick,
        select:      playMenuSelect,
        notification:playNotification,
        flee:        playFlee,
        itemPickup:  playItemPickup,
        buff:        playBuff,
        playTheme,
        stopMusic,
        toggleMusic,
        toggleSFX,
        setMusicVolume,
        setSFXVolume,
        get musicEnabled() { return musicEnabled; },
        get sfxEnabled()   { return sfxEnabled; }
    };
})();

// ---- INICIALIZAR AL PRIMER GESTO (móvil y escritorio) ----
function _audioBootstrap() {
    AUDIO.init();
    AUDIO.resume();
}

['click', 'touchstart', 'touchend', 'keydown'].forEach(evt =>
    document.addEventListener(evt, _audioBootstrap, { once: true, passive: true })
);
