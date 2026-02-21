// =============================================
// CRÓNICAS DEL REINO OLVIDADO — Sistema de Audio
// Web Audio API — Sin archivos externos
// =============================================

const AUDIO = (() => {
    let ctx = null;
    let masterGain = null;
    let musicGain = null;
    let sfxGain = null;
    let musicEnabled = true;
    let sfxEnabled = true;
    let musicPlaying = false;
    let musicNodes = [];
    let currentTheme = null;

    // Volúmenes
    const VOL_MASTER = 0.7;
    const VOL_MUSIC  = 0.22;
    const VOL_SFX    = 0.55;

    function init() {
        if (ctx) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = ctx.createGain(); masterGain.gain.value = VOL_MASTER;
        musicGain  = ctx.createGain(); musicGain.gain.value  = VOL_MUSIC;
        sfxGain    = ctx.createGain(); sfxGain.gain.value    = VOL_SFX;
        masterGain.connect(ctx.destination);
        musicGain.connect(masterGain);
        sfxGain.connect(masterGain);
    }

    function resume() {
        if (ctx && ctx.state === 'suspended') ctx.resume();
    }

    // ---- UTILIDADES ----
    function osc(type, freq, start, dur, gainVal, destination) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(gainVal, start);
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        o.connect(g); g.connect(destination || sfxGain);
        o.start(start); o.stop(start + dur + 0.01);
        return { osc: o, gain: g };
    }

    function noise(dur, gainVal, destination) {
        const bufSize = ctx.sampleRate * dur;
        const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const g = ctx.createGain();
        g.gain.setValueAtTime(gainVal, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        src.connect(g); g.connect(destination || sfxGain);
        src.start(); src.stop(ctx.currentTime + dur);
    }

    function filter(type, freq, q) {
        const f = ctx.createBiquadFilter();
        f.type = type; f.frequency.value = freq; f.Q.value = q || 1;
        return f;
    }

    // ---- EFECTOS DE SONIDO ----

    function playAttack() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        // Golpe metálico
        osc('sawtooth', 180, t, 0.08, 0.4);
        osc('square',   90,  t, 0.12, 0.3);
        osc('sawtooth', 260, t + 0.03, 0.06, 0.2);
        noise(0.06, 0.15);
    }

    function playMagic() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        // Sonido mágico ascendente
        const o1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        o1.type = 'sine';
        o1.frequency.setValueAtTime(300, t);
        o1.frequency.exponentialRampToValueAtTime(900, t + 0.4);
        g1.gain.setValueAtTime(0.3, t);
        g1.gain.setValueAtTime(0.4, t + 0.2);
        g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        o1.connect(g1); g1.connect(sfxGain);
        o1.start(t); o1.stop(t + 0.65);

        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.type = 'triangle';
        o2.frequency.setValueAtTime(600, t);
        o2.frequency.exponentialRampToValueAtTime(1800, t + 0.4);
        g2.gain.setValueAtTime(0.15, t);
        g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        o2.connect(g2); g2.connect(sfxGain);
        o2.start(t); o2.stop(t + 0.55);

        // Chispas
        for (let i = 0; i < 5; i++) {
            osc('sine', 800 + Math.random() * 1200, t + i * 0.08, 0.07, 0.08);
        }
    }

    function playFireball() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        // Whoosh + explosion
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const f = filter('bandpass', 200, 5);
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(80, t);
        o.frequency.exponentialRampToValueAtTime(40, t + 0.3);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.5, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        o.connect(f); f.connect(g); g.connect(sfxGain);
        o.start(t); o.stop(t + 0.45);
        noise(0.3, 0.3);
        // Crackle
        for (let i = 0; i < 8; i++) {
            osc('sawtooth', 100 + Math.random() * 300, t + Math.random() * 0.3, 0.05, 0.1 + Math.random() * 0.1);
        }
    }

    function playArrow() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        // Silbido de flecha
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(1200, t);
        o.frequency.exponentialRampToValueAtTime(400, t + 0.15);
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o.connect(g); g.connect(sfxGain);
        o.start(t); o.stop(t + 0.2);
        noise(0.04, 0.08);
    }

    function playHeal() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        // Arpeggio de curación
        const notes = [523, 659, 784, 1047]; // C5-E5-G5-C6
        notes.forEach((freq, i) => {
            const delay = i * 0.08;
            osc('sine', freq, t + delay, 0.25, 0.2);
            osc('triangle', freq * 2, t + delay, 0.2, 0.05);
        });
    }

    function playDrain() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        // Succión descendente
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(600, t);
        o.frequency.exponentialRampToValueAtTime(100, t + 0.5);
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
        o.connect(g); g.connect(sfxGain);
        o.start(t); o.stop(t + 0.6);
        osc('sine', 400, t, 0.4, 0.1);
    }

    function playPoison() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        // Burbujeo tóxico
        for (let i = 0; i < 6; i++) {
            osc('sine', 150 + Math.random() * 100, t + i * 0.05, 0.08, 0.12);
        }
        osc('sawtooth', 80, t, 0.3, 0.15);
    }

    function playCritical() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        // Impacto crítico dramático
        osc('square', 120, t, 0.05, 0.5);
        osc('sawtooth', 80, t, 0.1, 0.4);
        osc('square', 60, t + 0.05, 0.15, 0.3);
        noise(0.12, 0.35);
        // Acento agudo
        osc('sine', 1800, t, 0.08, 0.2);
        osc('sine', 2400, t + 0.03, 0.06, 0.15);
    }

    function playEnemyHit() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        osc('square', 160, t, 0.06, 0.25);
        osc('sawtooth', 100, t + 0.02, 0.08, 0.2);
        noise(0.05, 0.1);
    }

    function playPlayerHit() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        osc('square', 120, t, 0.08, 0.3);
        osc('sawtooth', 80, t, 0.1, 0.25);
        osc('sine', 60, t + 0.05, 0.12, 0.2);
        noise(0.08, 0.2);
    }

    function playVictory() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        // Fanfarria de victoria
        const melody = [
            {f:523, d:0.12}, {f:523, d:0.12}, {f:523, d:0.12}, {f:659, d:0.5},
            {f:587, d:0.12}, {f:587, d:0.12}, {f:587, d:0.12}, {f:784, d:0.6}
        ];
        let time = t;
        melody.forEach(note => {
            osc('square', note.f, time, note.d * 0.9, 0.25);
            osc('triangle', note.f * 2, time, note.d * 0.9, 0.08);
            time += note.d + 0.02;
        });
    }

    function playDefeat() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        // Descenso de derrota
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(440, t);
        o.frequency.exponentialRampToValueAtTime(110, t + 1.2);
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
        o.connect(g); g.connect(sfxGain);
        o.start(t); o.stop(t + 1.5);
        osc('sawtooth', 220, t + 0.2, 1.0, 0.15);
    }

    function playLevelUp() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        // Arpeggio épico ascendente
        const notes = [261, 329, 392, 523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const d = t + i * 0.07;
            osc('triangle', freq, d, 0.35, 0.25);
            osc('sine', freq * 1.5, d, 0.3, 0.08);
        });
        // Acorde final glorioso
        [523, 659, 784, 1047].forEach(f => osc('sine', f, t + 0.55, 0.6, 0.15));
    }

    function playBattleStart() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        // Stinger de combate
        osc('square', 220, t, 0.08, 0.3);
        osc('square', 330, t + 0.08, 0.08, 0.3);
        osc('square', 440, t + 0.16, 0.15, 0.35);
        noise(0.05, 0.2, sfxGain);
    }

    function playMenuClick() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        osc('sine', 880, t, 0.06, 0.12);
        osc('sine', 1100, t + 0.03, 0.04, 0.08);
    }

    function playMenuSelect() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        osc('sine', 660, t, 0.05, 0.15);
        osc('sine', 990, t + 0.05, 0.07, 0.15);
        osc('sine', 1320, t + 0.1, 0.08, 0.12);
    }

    function playNotification() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        osc('sine', 800, t, 0.08, 0.15);
        osc('sine', 1000, t + 0.08, 0.1, 0.12);
    }

    function playFlee() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        // Whoosh de huida
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(400, t);
        o.frequency.exponentialRampToValueAtTime(1600, t + 0.25);
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(g); g.connect(sfxGain);
        o.start(t); o.stop(t + 0.35);
        noise(0.15, 0.1);
    }

    function playItemPickup() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        osc('sine', 600, t, 0.06, 0.15);
        osc('sine', 900, t + 0.06, 0.07, 0.12);
        osc('sine', 1200, t + 0.12, 0.09, 0.1);
    }

    function playBuff() {
        if (!sfxEnabled || !ctx) return;
        const t = ctx.currentTime;
        osc('triangle', 440, t, 0.15, 0.2);
        osc('triangle', 550, t + 0.1, 0.15, 0.18);
        osc('triangle', 660, t + 0.2, 0.2, 0.2);
    }

    // ---- MÚSICA PROCEDURAL ----

    const SCALES = {
        minor: [0, 2, 3, 5, 7, 8, 10],
        major: [0, 2, 4, 5, 7, 9, 11],
        phrygian: [0, 1, 3, 5, 7, 8, 10]
    };

    const THEMES = {
        menu: {
            bpm: 72, rootNote: 55, scale: 'minor',
            octaves: [3, 4], noteLength: 0.5,
            desc: 'Ambiente de menú oscuro'
        },
        world: {
            bpm: 80, rootNote: 57, scale: 'minor',
            octaves: [3, 4, 5], noteLength: 0.4,
            desc: 'Exploración del reino'
        },
        battle: {
            bpm: 140, rootNote: 49, scale: 'phrygian',
            octaves: [3, 4], noteLength: 0.2,
            desc: 'Combate épico'
        },
        victory: {
            bpm: 100, rootNote: 60, scale: 'major',
            octaves: [4, 5], noteLength: 0.35,
            desc: 'Victoria'
        }
    };

    function midiToFreq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    function stopMusic(fadeTime = 0.8) {
        if (!ctx || !musicPlaying) return;
        const t = ctx.currentTime;
        if (musicGain) {
            musicGain.gain.setValueAtTime(musicGain.gain.value, t);
            musicGain.gain.exponentialRampToValueAtTime(0.0001, t + fadeTime);
        }
        setTimeout(() => {
            musicNodes.forEach(n => { try { n.stop(); } catch(e){} });
            musicNodes = [];
            musicPlaying = false;
            if (musicGain) musicGain.gain.setValueAtTime(VOL_MUSIC, ctx.currentTime);
        }, (fadeTime + 0.1) * 1000);
    }

    function playTheme(themeName) {
        if (!musicEnabled || !ctx) return;
        if (currentTheme === themeName && musicPlaying) return;
        currentTheme = themeName;
        stopMusic(0.5);
        setTimeout(() => {
            if (!musicEnabled) return;
            startTheme(themeName);
        }, 600);
    }

    function startTheme(themeName) {
        const theme = THEMES[themeName];
        if (!theme) return;
        musicPlaying = true;

        const beatDur  = 60 / theme.bpm;
        const noteDur  = theme.noteLength;
        const loopBars = 8;
        const beatsPerBar = 4;
        const loopDur = beatDur * beatsPerBar * loopBars;

        // Reverb simple
        const convolver = ctx.createConvolver();
        const bufLen = ctx.sampleRate * 1.5;
        const reverbBuf = ctx.createBuffer(2, bufLen, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const d = reverbBuf.getChannelData(ch);
            for (let i = 0; i < bufLen; i++) {
                d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2.5);
            }
        }
        convolver.buffer = reverbBuf;
        const reverbGain = ctx.createGain();
        reverbGain.gain.value = 0.15;
        convolver.connect(reverbGain);
        reverbGain.connect(musicGain);

        function scheduleLoop(startTime) {
            if (!musicPlaying || !musicEnabled) return;

            const scale = SCALES[theme.scale];
            const root  = theme.rootNote;

            // --- MELODÍA PRINCIPAL (Lead) ---
            const leadGain = ctx.createGain();
            leadGain.gain.value = 0.25;
            leadGain.connect(musicGain);
            leadGain.connect(convolver);

            // Patrón melódico semi-random pero musical
            const seed = Math.floor(startTime * 10) % 100;
            const pattern = generateMelody(scale, root, theme.octaves, loopBars * beatsPerBar, seed);

            pattern.forEach(({ note, beat, duration }) => {
                const t = startTime + beat * beatDur;
                const freq = midiToFreq(note);
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'triangle';
                o.frequency.setValueAtTime(freq, t);
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.3, t + 0.02);
                g.gain.setValueAtTime(0.3, t + duration * beatDur * 0.7);
                g.gain.exponentialRampToValueAtTime(0.0001, t + duration * beatDur * 0.95);
                o.connect(g); g.connect(leadGain);
                o.start(t); o.stop(t + duration * beatDur + 0.05);
                musicNodes.push(o);
            });

            // --- BAJO ---
            const bassGain = ctx.createGain();
            bassGain.gain.value = 0.3;
            bassGain.connect(musicGain);

            const bassPattern = generateBass(scale, root, theme.bpm, loopBars * beatsPerBar);
            bassPattern.forEach(({ note, beat, duration }) => {
                const t = startTime + beat * beatDur;
                const freq = midiToFreq(note - 12);
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(freq, t);
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.4, t + 0.01);
                g.gain.exponentialRampToValueAtTime(0.0001, t + duration * beatDur * 0.85);
                o.connect(g); g.connect(bassGain);
                o.start(t); o.stop(t + duration * beatDur + 0.05);
                musicNodes.push(o);
            });

            // --- ACORDES AMBIENTALES ---
            const chordGain = ctx.createGain();
            chordGain.gain.value = 0.08;
            chordGain.connect(musicGain);
            chordGain.connect(convolver);

            const chordProg = getChordProgression(theme.scale, root, theme.rootNote);
            chordProg.forEach(({ notes, bar }) => {
                const t = startTime + bar * beatsPerBar * beatDur;
                const dur = beatsPerBar * beatDur * 2;
                notes.forEach(note => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = 'sine';
                    o.frequency.setValueAtTime(midiToFreq(note), t);
                    g.gain.setValueAtTime(0, t);
                    g.gain.linearRampToValueAtTime(0.15, t + 0.1);
                    g.gain.setValueAtTime(0.15, t + dur * 0.8);
                    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
                    o.connect(g); g.connect(chordGain);
                    o.start(t); o.stop(t + dur + 0.1);
                    musicNodes.push(o);
                });
            });

            // --- PERCUSIÓN (solo en battle) ---
            if (themeName === 'battle') {
                scheduleDrums(startTime, beatDur, loopBars * beatsPerBar);
            }

            // Programar siguiente loop
            const loopTimeout = setTimeout(() => {
                if (musicPlaying && musicEnabled && currentTheme === themeName) {
                    scheduleLoop(startTime + loopDur);
                }
            }, (loopDur - 0.2) * 1000);
        }

        scheduleLoop(ctx.currentTime + 0.1);
    }

    function generateMelody(scale, root, octaves, beats, seed) {
        const pattern = [];
        let beat = 0;
        let lastNote = root + scale[3] + octaves[0] * 12;
        const rng = mulberry32(seed);

        while (beat < beats - 1) {
            const stepOptions = [0.5, 1, 1, 1, 1.5, 2];
            const dur = stepOptions[Math.floor(rng() * stepOptions.length)];
            if (beat + dur > beats) break;

            // Movimiento melódico cercano (más natural)
            const direction = rng() > 0.5 ? 1 : -1;
            const step = Math.floor(rng() * 3) + 1;
            const scaleIdx = scale.indexOf(((lastNote - root) % 12 + 12) % 12);
            const newIdx = ((scaleIdx + direction * step) + scale.length * 4) % scale.length;
            const oct = octaves[Math.floor(rng() * octaves.length)];
            const note = root + scale[newIdx] + oct * 12;

            // Pausa ocasional (silencio)
            if (rng() > 0.15) {
                pattern.push({ note, beat, duration: dur });
                lastNote = note;
            }
            beat += dur;
        }
        return pattern;
    }

    function generateBass(scale, root, bpm, beats) {
        const pattern = [];
        const bassNotes = [scale[0], scale[4], scale[2], scale[5]].map(n => root + n);
        const barBeats = 4;
        const bars = Math.floor(beats / barBeats);

        for (let bar = 0; bar < bars; bar++) {
            const note = bassNotes[bar % bassNotes.length];
            // Patrón de bajo: golpe en 1, 3
            [[0, 0.5], [2, 0.5], [2.5, 0.5], [3.5, 0.5]].forEach(([beat, dur]) => {
                pattern.push({ note, beat: bar * barBeats + beat, duration: dur });
            });
        }
        return pattern;
    }

    function getChordProgression(scaleName, root, rootNote) {
        const scale = SCALES[scaleName];
        const chords = {
            minor: [
                [0, 3, 7], [5, 8, 12], [3, 7, 10], [8, 12, 15]
            ],
            major: [
                [0, 4, 7], [5, 9, 12], [7, 11, 14], [5, 9, 12]
            ],
            phrygian: [
                [0, 3, 7], [1, 5, 8], [3, 7, 10], [8, 12, 15]
            ]
        };
        const prog = chords[scaleName] || chords.minor;
        return prog.map((chord, i) => ({
            bar: i * 2,
            notes: chord.map(interval => root + interval + 48)
        }));
    }

    function scheduleDrums(startTime, beatDur, totalBeats) {
        const kickGain = ctx.createGain(); kickGain.gain.value = 0.4; kickGain.connect(musicGain);
        const snareGain = ctx.createGain(); snareGain.gain.value = 0.2; snareGain.connect(musicGain);
        const hihatGain = ctx.createGain(); hihatGain.gain.value = 0.08; hihatGain.connect(musicGain);

        for (let beat = 0; beat < totalBeats; beat++) {
            const t = startTime + beat * beatDur;
            const subBeat = beat % 4;

            // Kick en 0 y 2
            if (subBeat === 0 || subBeat === 2) {
                const ko = ctx.createOscillator();
                const kg = ctx.createGain();
                ko.type = 'sine';
                ko.frequency.setValueAtTime(100, t);
                ko.frequency.exponentialRampToValueAtTime(40, t + 0.1);
                kg.gain.setValueAtTime(0.5, t);
                kg.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
                ko.connect(kg); kg.connect(kickGain);
                ko.start(t); ko.stop(t + 0.2);
                musicNodes.push(ko);
            }

            // Snare en 1 y 3
            if (subBeat === 1 || subBeat === 3) {
                const bufSize = Math.floor(ctx.sampleRate * 0.08);
                const snareBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
                const data = snareBuf.getChannelData(0);
                for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.5);
                const src = ctx.createBufferSource();
                src.buffer = snareBuf;
                const sg = ctx.createGain();
                sg.gain.setValueAtTime(0.3, t);
                sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
                src.connect(sg); sg.connect(snareGain);
                src.start(t); src.stop(t + 0.1);
                musicNodes.push(src);
            }

            // Hi-hat en cada octavo
            if (beat % 0.5 === 0) {
                const bufSize = Math.floor(ctx.sampleRate * 0.03);
                const hhBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
                const d = hhBuf.getChannelData(0);
                for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
                const src = ctx.createBufferSource();
                src.buffer = hhBuf;
                const hf = filter('highpass', 8000, 1);
                const hg = ctx.createGain();
                hg.gain.setValueAtTime(0.15, t);
                hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
                src.connect(hf); hf.connect(hg); hg.connect(hihatGain);
                src.start(t); src.stop(t + 0.04);
                musicNodes.push(src);
            }
        }
    }

    // PRNG determinista para melodías reproducibles
    function mulberry32(seed) {
        return function() {
            seed |= 0; seed = seed + 0x6D2B79F5 | 0;
            let z = Math.imul(seed ^ seed >>> 15, 1 | seed);
            z = z + Math.imul(z ^ z >>> 7, 61 | z) ^ z;
            return ((z ^ z >>> 14) >>> 0) / 4294967296;
        };
    }

    // ---- CONTROLES DE AUDIO ----
    function toggleMusic() {
        musicEnabled = !musicEnabled;
        if (!musicEnabled) { stopMusic(); currentTheme = null; }
        else if (currentTheme) { setTimeout(() => startTheme(currentTheme), 200); }
        return musicEnabled;
    }

    function toggleSFX() {
        sfxEnabled = !sfxEnabled;
        return sfxEnabled;
    }

    function setMusicVolume(v) {
        if (musicGain) musicGain.gain.setTargetAtTime(v * VOL_MUSIC, ctx.currentTime, 0.1);
    }

    function setSFXVolume(v) {
        if (sfxGain) sfxGain.gain.setTargetAtTime(v * VOL_SFX, ctx.currentTime, 0.1);
    }

    // API Pública
    return {
        init, resume,
        // Efectos
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
        // Música
        playTheme,
        stopMusic,
        // Controles
        toggleMusic,
        toggleSFX,
        setMusicVolume,
        setSFXVolume,
        get musicEnabled() { return musicEnabled; },
        get sfxEnabled()   { return sfxEnabled; }
    };
})();

// Inicializar al primer gesto del usuario
document.addEventListener('click', () => {
    AUDIO.init();
    AUDIO.resume();
}, { once: true });

document.addEventListener('keydown', () => {
    AUDIO.init();
    AUDIO.resume();
}, { once: true });
