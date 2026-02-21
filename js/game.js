// =============================================
// CRÓNICAS DEL REINO OLVIDADO — Motor del Juego
// =============================================

let state = {
    hero: null, currentZone: null, currentEnemy: null, battleActive: false,
    enemyEffects: { veneno:0, reduccionAtk:0, turnosEfecto:0, turnosEfecto2:0 },
    heroEffects: { bonusDef:0, bonusAtk:0, turnosEfecto:0 },
    misiones: {}, inventario: {}, equipado: { weapon:null, armor:null, accessory:null },
    selectedClass: null, kills: {}
};

// =============================================
// INIT
// =============================================
window.addEventListener('load', () => {
    createParticles();
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
        checkSaveExists();
    }, 3000);
});

function createParticles() {
    const c = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (4 + Math.random() * 8) + 's';
        p.style.animationDelay = (Math.random() * 8) + 's';
        p.style.width = p.style.height = (1 + Math.random() * 2) + 'px';
        c.appendChild(p);
    }
}

function checkSaveExists() {
    if (!localStorage.getItem('cronica_save'))
        document.getElementById('btn-continue').style.opacity = '0.4';
}

// =============================================
// NAVEGACIÓN
// =============================================
function showScreen(id) {
    ['main-menu','character-select','game-world','zone-screen','inventory','credits'].forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.add('hidden');
    });
    const t = document.getElementById(id);
    if (t) { t.classList.remove('hidden'); t.classList.add('screen-in'); setTimeout(() => t.classList.remove('screen-in'), 400); }
}

// =============================================
// SELECCIÓN DE CLASE
// =============================================
function selectClass(cls) {
    document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`[data-class="${cls}"]`).classList.add('selected');
    state.selectedClass = cls;
    document.getElementById('confirm-block').classList.remove('hidden');
}

// =============================================
// INICIAR JUEGO
// =============================================
function startGame() {
    const nombre = document.getElementById('hero-name').value.trim() || "Aventurero";
    if (!state.selectedClass) { notify("¡Elige una clase primero!"); return; }
    const cls = GAME_DATA.classes[state.selectedClass];
    state.hero = {
        nombre, clase: state.selectedClass, nivel: 1, exp: 0,
        hp: cls.baseStats.hp, maxHp: cls.baseStats.hp,
        mp: cls.baseStats.mp, maxMp: cls.baseStats.mp,
        atk: cls.baseStats.atk, def: cls.baseStats.def,
        mag: cls.baseStats.mag, agi: cls.baseStats.agi, oro: 50
    };
    state.inventario = { pocion_hp: 3 };
    state.equipado = { weapon: null, armor: null, accessory: null };
    state.misiones = { mision_aldea_1: { ...GAME_DATA.misiones.mision_aldea_1, activa: true, objetivo: { ...GAME_DATA.misiones.mision_aldea_1.objetivo, actual: 0 } } };
    state.kills = {};
    showScreen('game-world');
    updateHUD();
    renderQuests();
}

// =============================================
// HUD
// =============================================
function updateHUD() {
    if (!state.hero) return;
    const h = state.hero;
    const cls = GAME_DATA.classes[h.clase];
    document.getElementById('hud-avatar').textContent = cls.icono;
    document.getElementById('hud-name').textContent = h.nombre;
    document.getElementById('hud-level').textContent = h.nivel;
    document.getElementById('hud-class').textContent = cls.nombre;
    document.getElementById('gold-val').textContent = h.oro;
    const hpP = (h.hp / h.maxHp * 100).toFixed(1);
    const mpP = (h.mp / h.maxMp * 100).toFixed(1);
    const xpN = GAME_DATA.expParaNivel(h.nivel);
    const xpP = Math.min(h.exp / xpN * 100, 100).toFixed(1);
    document.getElementById('hp-bar').style.width = hpP + '%';
    document.getElementById('mp-bar').style.width = mpP + '%';
    document.getElementById('xp-bar').style.width = xpP + '%';
    document.getElementById('hp-val').textContent = `${h.hp}/${h.maxHp}`;
    document.getElementById('mp-val').textContent = `${h.mp}/${h.maxMp}`;
    document.getElementById('xp-val').textContent = `${h.exp}/${xpN}`;
}

function renderQuests() {
    const list = document.getElementById('quest-list');
    list.innerHTML = '';
    Object.entries(state.misiones).forEach(([id, m]) => {
        if (!m.activa || m.completada) return;
        const d = document.createElement('div');
        d.className = 'quest-item';
        d.innerHTML = `<div class="quest-name">📜 ${m.nombre}</div><div class="quest-progress">${m.objetivo.actual||0}/${m.objetivo.cantidad} derrotados</div>`;
        list.appendChild(d);
    });
}

// =============================================
// ZONAS
// =============================================
function enterZone(zoneId) {
    const zona = GAME_DATA.zonas[zoneId];
    if (!zona) return;
    if (state.hero && state.hero.nivel < zona.nivelMin && zoneId !== 'aldea') {
        notify(`¡Necesitas nivel ${zona.nivelMin} para entrar aquí!`);
        return;
    }
    state.currentZone = zoneId;
    document.getElementById('zone-title').textContent = zona.nombre;
    document.getElementById('zone-desc').textContent = zona.descripcion;
    document.getElementById('zone-art').textContent = zona.icono;
    const el = document.getElementById('zone-enemy-list');
    el.innerHTML = zona.enemigos.map(eid => {
        const e = GAME_DATA.enemigos[eid];
        return `<span class="enemy-tag">${e.icono} ${e.nombre}</span>`;
    }).join('');
    const mid = zona.misionId;
    if (mid && !state.misiones[mid]) {
        state.misiones[mid] = { ...GAME_DATA.misiones[mid], activa: true, objetivo: { ...GAME_DATA.misiones[mid].objetivo, actual: 0 } };
        notify(`📜 Nueva misión: ${GAME_DATA.misiones[mid].nombre}`);
        renderQuests();
    }
    showScreen('zone-screen');
}

// =============================================
// NPC
// =============================================
function showNPC() {
    if (!state.currentZone) return;
    const npc = GAME_DATA.zonas[state.currentZone].npc;
    document.getElementById('dialog-portrait').textContent = npc.icono;
    document.getElementById('dialog-name').textContent = npc.nombre;
    let idx = 0;
    const opts = document.getElementById('dialog-options');

    function render(texto) {
        document.getElementById('dialog-text').textContent = `"${texto}"`;
        opts.innerHTML = '';
        if (idx < npc.dialogo.length - 1) {
            addOpt("Continuar...", () => { idx++; render(npc.dialogo[idx]); });
        } else {
            addOpt("¡Gracias!", closeDialog);
            addOpt("¿Tienes algo a la venta?", showShop);
        }
    }

    function addOpt(text, fn) {
        const b = document.createElement('button');
        b.className = 'dialog-option'; b.textContent = text; b.onclick = fn;
        opts.appendChild(b);
    }

    render(npc.dialogo[0]);
    document.getElementById('npc-dialog').classList.remove('hidden');
}

function closeDialog() { document.getElementById('npc-dialog').classList.add('hidden'); }

function showShop() {
    document.getElementById('dialog-text').textContent = `"Claro, tengo estas mercancías para el valiente aventurero:"`;
    const opts = document.getElementById('dialog-options');
    opts.innerHTML = '';
    GAME_DATA.tiendaItems.forEach(id => {
        const item = GAME_DATA.items[id];
        const b = document.createElement('button');
        b.className = 'dialog-option';
        b.innerHTML = `${item.icono} ${item.nombre} — ${item.precio}🪙 <small style="color:var(--text-dim)">${item.descripcion}</small>`;
        b.onclick = () => buyItem(id, item);
        opts.appendChild(b);
    });
    const bc = document.createElement('button');
    bc.className = 'dialog-option'; bc.textContent = '← Adiós'; bc.onclick = closeDialog;
    opts.appendChild(bc);
}

function buyItem(id, item) {
    if (state.hero.oro < item.precio) { notify("¡No tienes suficiente oro!"); return; }
    state.hero.oro -= item.precio;
    state.inventario[id] = (state.inventario[id] || 0) + 1;
    notify(`Compraste: ${item.icono} ${item.nombre}`);
    updateHUD();
}

// =============================================
// COMBATE
// =============================================
function startBattle() {
    if (!state.currentZone) return;
    const zona = GAME_DATA.zonas[state.currentZone];
    const eid = zona.enemigos[Math.floor(Math.random() * zona.enemigos.length)];
    const base = GAME_DATA.enemigos[eid];
    const nv = Math.max(1, state.hero.nivel + Math.floor(Math.random() * 3) - 1);
    const sc = 1 + (nv - base.nivelBase) * 0.15;

    state.currentEnemy = {
        id: eid, nombre: base.nombre, icono: base.icono, nivel: nv,
        hp:  Math.floor(base.hp  * Math.max(0.6, sc)),
        maxHp: Math.floor(base.hp * Math.max(0.6, sc)),
        atk: Math.floor(base.atk * Math.max(0.7, sc)),
        def: Math.floor(base.def * Math.max(0.7, sc)),
        exp: Math.floor(base.exp * Math.max(0.7, sc)),
        oro: Math.floor(base.oro * Math.max(0.7, sc))
    };

    state.battleActive = true;
    state.enemyEffects = { veneno:0, reduccionAtk:0, turnosEfecto:0, turnosEfecto2:0 };
    state.heroEffects  = { bonusDef:0, bonusAtk:0, turnosEfecto:0 };

    document.getElementById('enemy-name').textContent    = state.currentEnemy.nombre;
    document.getElementById('enemy-level').textContent   = state.currentEnemy.nivel;
    document.getElementById('enemy-sprite').textContent  = state.currentEnemy.icono;
    document.getElementById('hero-sprite-battle').textContent = GAME_DATA.classes[state.hero.clase].icono;
    document.getElementById('hero-battle-name').textContent   = state.hero.nombre;
    document.getElementById('battle-bg').className = 'battle-bg ' + (zona.fondo || '');

    updateBattleUI();
    document.getElementById('battle-log').innerHTML = '';
    addLog(`⚔ ¡Un ${state.currentEnemy.nombre} aparece!`, '');
    document.getElementById('battle-screen').classList.remove('hidden');
    document.getElementById('skill-menu').classList.add('hidden');
    document.getElementById('battle-item-menu').classList.add('hidden');
    setBtns(true);
}

function updateBattleUI() {
    const h = state.hero, e = state.currentEnemy;
    document.getElementById('enemy-hp-bar').style.width = Math.max(0, e.hp / e.maxHp * 100) + '%';
    document.getElementById('enemy-hp-text').textContent = `${e.hp}/${e.maxHp}`;
    document.getElementById('battle-hp-bar').style.width = Math.max(0, h.hp / h.maxHp * 100) + '%';
    document.getElementById('battle-mp-bar').style.width = Math.max(0, h.mp / h.maxMp * 100) + '%';
    document.getElementById('battle-hp-text').textContent = `${h.hp}/${h.maxHp}`;
    document.getElementById('battle-mp-text').textContent = `${h.mp}/${h.maxMp}`;
}

function addLog(text, cls) {
    const log = document.getElementById('battle-log');
    const p = document.createElement('p');
    p.className = 'log-entry ' + cls;
    p.textContent = text;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

function showDmg(amt, color, isHero) {
    const fx = document.getElementById('battle-effects');
    const d = document.createElement('div');
    d.className = 'damage-number';
    d.textContent = amt > 0 ? `-${amt}` : `+${Math.abs(amt)}`;
    d.style.color = color;
    d.style.left = (25 + Math.random() * 50) + '%';
    d.style.top  = isHero ? '70%' : '40%';
    fx.appendChild(d);
    setTimeout(() => d.remove(), 1300);
}

async function battleAction(action) {
    if (!state.battleActive) return;
    setBtns(false);
    const h = state.hero, e = state.currentEnemy;
    let acted = false;

    if (action === 'attack') {
        const base = h.atk + (state.heroEffects.bonusAtk || 0);
        let dmg = Math.max(1, calcDmg(base, e.def));
        const crit = Math.random() < 0.15;
        if (crit) dmg = Math.floor(dmg * 1.8);
        e.hp = Math.max(0, e.hp - dmg);
        document.getElementById('enemy-sprite').classList.add('taking-hit');
        setTimeout(() => document.getElementById('enemy-sprite').classList.remove('taking-hit'), 400);
        showDmg(dmg, crit ? '#ffff60' : '#ff8080', false);
        addLog(crit ? `💥 ¡CRÍTICO! ${h.nombre} golpea por ${dmg}!` : `⚔ ${h.nombre} ataca por ${dmg}.`, crit ? 'critical' : 'player-action');
        acted = true;
    } else if (action === 'flee') {
        if (Math.random() < 0.5) {
            addLog(`💨 ¡${h.nombre} escapó del combate!`, 'player-action');
            await sleep(800);
            endBattle(false, true);
            return;
        } else {
            addLog(`❌ ¡No pudiste escapar!`, 'enemy-action');
            acted = true;
        }
    }

    updateBattleUI();

    if (state.enemyEffects.veneno > 0) {
        e.hp = Math.max(0, e.hp - state.enemyEffects.veneno);
        addLog(`☠ Veneno daña por ${state.enemyEffects.veneno}.`, 'skill-action');
        state.enemyEffects.turnosEfecto--;
        if (state.enemyEffects.turnosEfecto <= 0) state.enemyEffects.veneno = 0;
        updateBattleUI();
    }

    if (e.hp <= 0) { await sleep(400); endBattle(true, false); return; }

    if (acted) {
        if (state.heroEffects.turnosEfecto > 0) {
            state.heroEffects.turnosEfecto--;
            if (state.heroEffects.turnosEfecto <= 0) { state.heroEffects.bonusDef = 0; state.heroEffects.bonusAtk = 0; }
        }
        if (state.enemyEffects.reduccionAtk > 0) {
            if (state.enemyEffects.turnosEfecto2 > 0) state.enemyEffects.turnosEfecto2--;
            if (state.enemyEffects.turnosEfecto2 <= 0) state.enemyEffects.reduccionAtk = 0;
        }
        await sleep(700);
        const eAtk = Math.max(1, e.atk - (state.enemyEffects.reduccionAtk || 0));
        const eDef = h.def + (state.heroEffects.bonusDef || 0);
        let eDmg = Math.max(1, calcDmg(eAtk, eDef));
        const eCrit = Math.random() < 0.08;
        if (eCrit) eDmg = Math.floor(eDmg * 1.6);
        h.hp = Math.max(0, h.hp - eDmg);
        showDmg(eDmg, '#ff6060', true);
        addLog(eCrit ? `💥 ¡${e.nombre} golpe crítico! ${eDmg}!` : `${e.icono} ${e.nombre} ataca por ${eDmg}.`, 'enemy-action');
        updateBattleUI(); updateHUD();
        if (h.hp <= 0) { await sleep(400); endBattle(false, false); return; }
    }

    await sleep(200);
    setBtns(true);
}

async function useSkill(skillId) {
    hideSkills();
    if (!state.battleActive) return;
    const h = state.hero, e = state.currentEnemy;
    const sk = GAME_DATA.habilidades[skillId];
    if (h.mp < sk.costo) { notify("¡No tienes suficiente MP!"); setBtns(true); return; }
    h.mp -= sk.costo;
    setBtns(false);

    if (sk.tipo === 'ataque' || sk.tipo === 'magico') {
        const base = sk.tipo === 'magico' ? h.mag : h.atk;
        let dmg = Math.max(1, Math.floor((base + (state.heroEffects.bonusAtk||0)) * sk.multiplicador) - Math.floor(e.def * 0.5));
        if (sk.garantizaCritico || Math.random() < 0.2) { dmg = Math.floor(dmg * 1.5); addLog(`💥 ¡${sk.nombre} CRÍTICO! ${dmg}!`, 'critical'); }
        else addLog(`✨ ${h.nombre} usa ${sk.nombre}! ${dmg} de daño.`, 'skill-action');
        e.hp = Math.max(0, e.hp - dmg);
        document.getElementById('enemy-sprite').classList.add('taking-hit');
        setTimeout(() => document.getElementById('enemy-sprite').classList.remove('taking-hit'), 400);
        showDmg(dmg, '#c080ff', false);
    } else if (sk.tipo === 'curar') {
        const cura = Math.floor(h.maxHp * sk.porcentaje);
        h.hp = Math.min(h.maxHp, h.hp + cura);
        showDmg(-cura, '#60e080', true);
        addLog(`💚 ${sk.nombre}! Recuperas ${cura} HP.`, 'heal-action');
    } else if (sk.tipo === 'drenar') {
        const dmg = Math.max(1, Math.floor(h.atk * sk.multiplicador) - Math.floor(e.def * 0.3));
        const robo = Math.floor(dmg * 0.5);
        e.hp = Math.max(0, e.hp - dmg);
        h.hp = Math.min(h.maxHp, h.hp + robo);
        showDmg(dmg, '#c080ff', false); showDmg(-robo, '#60e080', true);
        addLog(`🩸 Drenas ${dmg} y recuperas ${robo} HP.`, 'skill-action');
    } else if (sk.tipo === 'veneno') {
        state.enemyEffects.veneno = sk.dañoPorTurno;
        state.enemyEffects.turnosEfecto = sk.turnos;
        addLog(`☠ ${e.nombre} envenenado! ${sk.dañoPorTurno}/turno`, 'skill-action');
    } else if (sk.tipo === 'buff') {
        state.heroEffects.bonusDef = sk.bonusDef || 0;
        state.heroEffects.bonusAtk = sk.bonusAtk || 0;
        state.heroEffects.turnosEfecto = sk.turnos;
        addLog(`⬆ Te fortaleces por ${sk.turnos} turnos!`, 'heal-action');
    } else if (sk.tipo === 'defensa') {
        state.heroEffects.bonusDef = sk.bonusDef;
        state.heroEffects.turnosEfecto = sk.turnos;
        addLog(`🛡 +${sk.bonusDef} DEF por ${sk.turnos} turnos.`, 'heal-action');
    } else if (sk.tipo === 'debuff') {
        state.enemyEffects.reduccionAtk = sk.reduccionAtk;
        state.enemyEffects.turnosEfecto2 = sk.turnos;
        addLog(`🔮 ${e.nombre} debilitado -${sk.reduccionAtk} ATK!`, 'skill-action');
    }

    updateBattleUI(); updateHUD();
    if (e.hp <= 0) { await sleep(500); endBattle(true, false); return; }

    await sleep(700);
    const eAtk = Math.max(1, e.atk - (state.enemyEffects.reduccionAtk || 0));
    const eDef = h.def + (state.heroEffects.bonusDef || 0);
    const eDmg = Math.max(1, calcDmg(eAtk, eDef));
    h.hp = Math.max(0, h.hp - eDmg);
    showDmg(eDmg, '#ff6060', true);
    addLog(`${e.icono} ${e.nombre} ataca por ${eDmg}.`, 'enemy-action');
    updateBattleUI(); updateHUD();
    if (h.hp <= 0) { await sleep(400); endBattle(false, false); return; }
    setBtns(true);
}

function useBattleItem(id) {
    hideBattleItems();
    const item = GAME_DATA.items[id];
    const h = state.hero;
    if (!state.inventario[id] || state.inventario[id] <= 0) return;
    if (item.efecto === 'curar_hp') {
        const ant = h.hp; h.hp = Math.min(h.maxHp, h.hp + item.valor);
        showDmg(-(h.hp - ant), '#60e080', true);
        addLog(`🧪 ${item.nombre}: +${h.hp-ant} HP.`, 'heal-action');
    } else if (item.efecto === 'curar_mp') {
        h.mp = Math.min(h.maxMp, h.mp + item.valor);
        addLog(`💧 ${item.nombre}: +${item.valor} MP.`, 'heal-action');
    } else if (item.efecto === 'curar_todo') {
        h.hp = h.maxHp; h.mp = h.maxMp;
        addLog(`✨ ${item.nombre}: ¡HP y MP restaurados!`, 'heal-action');
    }
    state.inventario[id]--;
    if (state.inventario[id] <= 0) delete state.inventario[id];
    updateBattleUI(); updateHUD();
}

function endBattle(victory, fled) {
    state.battleActive = false;
    document.getElementById('battle-screen').classList.add('hidden');
    if (fled) { setBtns(true); return; }

    const h = state.hero, e = state.currentEnemy;
    if (victory) {
        state.kills[e.id] = (state.kills[e.id] || 0) + 1;
        checkMissions(e.id);
        h.exp += e.exp; h.oro += e.oro;
        document.getElementById('result-icon').textContent = '🏆';
        document.getElementById('result-title').textContent = '¡Victoria!';
        document.getElementById('result-desc').textContent = `Derrotaste a ${e.nombre}`;
        let rhtml = `<div class="reward-item">⭐ +${e.exp} EXP</div><div class="reward-item">🪙 +${e.oro} Oro</div>`;
        if (Math.random() < 0.25) {
            const keys = Object.keys(GAME_DATA.items).filter(k => GAME_DATA.items[k].tipo === 'consumible');
            const drop = keys[Math.floor(Math.random() * keys.length)];
            state.inventario[drop] = (state.inventario[drop] || 0) + 1;
            rhtml += `<div class="reward-item">${GAME_DATA.items[drop].icono} ¡${GAME_DATA.items[drop].nombre} encontrado!</div>`;
        }
        document.getElementById('rewards-block').innerHTML = rhtml;
        const lvlBlock = document.getElementById('level-up-block');
        const xpNeed = GAME_DATA.expParaNivel(h.nivel);
        if (h.exp >= xpNeed) {
            h.exp -= xpNeed; h.nivel++;
            const cls = GAME_DATA.classes[h.clase];
            h.maxHp += cls.hpPerLevel; h.hp = h.maxHp;
            h.maxMp += cls.mpPerLevel; h.mp = h.maxMp;
            h.atk += cls.atkPerLevel; h.def += cls.defPerLevel;
            h.mag += cls.magPerLevel; h.agi += cls.agiPerLevel;
            lvlBlock.classList.remove('hidden');
            document.getElementById('level-up-details').textContent = `Nivel ${h.nivel}! HP+${cls.hpPerLevel} ATK+${cls.atkPerLevel} DEF+${cls.defPerLevel}`;
            unlockZones();
        } else {
            lvlBlock.classList.add('hidden');
        }
    } else {
        document.getElementById('result-icon').textContent = '💀';
        document.getElementById('result-title').textContent = 'Has caído...';
        document.getElementById('result-desc').textContent = 'Pero los héroes no mueren, solo descansan.';
        document.getElementById('rewards-block').innerHTML = '<div class="reward-item" style="color:var(--text-dim)">Perdiste el combate pero sigues vivo.</div>';
        document.getElementById('level-up-block').classList.add('hidden');
        h.hp = Math.floor(h.maxHp * 0.3);
    }
    updateHUD();
    document.getElementById('battle-result').classList.remove('hidden');
}

function closeBattleResult() {
    document.getElementById('battle-result').classList.add('hidden');
    document.getElementById('battle-screen').classList.add('hidden');
    setBtns(true);
}

function checkMissions(eid) {
    Object.entries(state.misiones).forEach(([id, m]) => {
        if (!m.activa || m.completada) return;
        if (m.objetivo.tipo === 'matar_enemigos' && m.objetivo.enemigos.includes(eid)) {
            m.objetivo.actual = (m.objetivo.actual || 0) + 1;
            if (m.objetivo.actual >= m.objetivo.cantidad) completeMission(id);
        }
    });
    renderQuests();
}

function completeMission(id) {
    const m = state.misiones[id];
    m.completada = true;
    const r = m.recompensa;
    state.hero.exp += r.exp; state.hero.oro += r.oro;
    if (r.item) state.inventario[r.item] = (state.inventario[r.item] || 0) + 1;
    notify(`🎉 ¡Misión: ${m.nombre}! +${r.exp} EXP, +${r.oro} Oro`);
    updateHUD();
}

function unlockZones() {
    const h = state.hero;
    const map = { 'zone-bosque':2, 'zone-minas':4, 'zone-castillo':7, 'zone-volcan':10, 'zone-abismo':15 };
    document.querySelectorAll('.region').forEach(region => {
        const match = (region.getAttribute('onclick')||'').match(/enterZone\('(.+)'\)/);
        if (!match) return;
        const req = map[`zone-${match[1]}`];
        if (req && h.nivel >= req) {
            region.classList.remove('region-locked');
            const lock = region.querySelector('.lock-icon');
            if (lock) lock.remove();
        }
    });
}

// =============================================
// MENÚS DE BATALLA
// =============================================
function showSkills() {
    const cls = GAME_DATA.classes[state.hero.clase];
    const sl = document.getElementById('skill-list');
    sl.innerHTML = '';
    cls.habilidades.forEach(sid => {
        const sk = GAME_DATA.habilidades[sid];
        const b = document.createElement('button');
        b.className = 'skill-btn-item';
        b.disabled = state.hero.mp < sk.costo;
        b.innerHTML = `<span>${sk.icono} ${sk.nombre}</span><br><span class="skill-cost">MP: ${sk.costo}</span>`;
        b.onclick = () => useSkill(sid);
        sl.appendChild(b);
    });
    document.getElementById('battle-actions').querySelector('.action-row').classList.add('hidden');
    document.getElementById('skill-menu').classList.remove('hidden');
}

function hideSkills() {
    document.getElementById('skill-menu').classList.add('hidden');
    document.getElementById('battle-actions').querySelector('.action-row').classList.remove('hidden');
}

function showBattleItems() {
    const il = document.getElementById('battle-item-list');
    il.innerHTML = '';
    const consumibles = Object.entries(state.inventario).filter(([id]) => GAME_DATA.items[id]?.tipo === 'consumible');
    if (!consumibles.length) {
        il.innerHTML = '<p style="color:var(--text-dim);padding:10px;grid-column:1/-1;font-style:italic;">No tienes objetos.</p>';
    } else {
        consumibles.forEach(([id, qty]) => {
            const item = GAME_DATA.items[id];
            const b = document.createElement('button');
            b.className = 'item-btn-item';
            b.innerHTML = `${item.icono} ${item.nombre} x${qty}`;
            b.onclick = () => useBattleItem(id);
            il.appendChild(b);
        });
    }
    document.getElementById('battle-actions').querySelector('.action-row').classList.add('hidden');
    document.getElementById('battle-item-menu').classList.remove('hidden');
}

function hideBattleItems() {
    document.getElementById('battle-item-menu').classList.add('hidden');
    document.getElementById('battle-actions').querySelector('.action-row').classList.remove('hidden');
}

function setBtns(on) {
    document.querySelectorAll('.action-btn').forEach(b => b.disabled = !on);
}

// =============================================
// INVENTARIO
// =============================================
function renderInventory() {
    if (!state.hero) return;
    const h = state.hero, cls = GAME_DATA.classes[h.clase];
    document.getElementById('inv-hero-name').textContent = `${h.nombre} — ${cls.nombre} Nv.${h.nivel}`;
    document.getElementById('inv-avatar').textContent = cls.icono;
    document.getElementById('stats-list').innerHTML = `
        <div class="stat-row"><span>❤ HP</span><span>${h.hp}/${h.maxHp}</span></div>
        <div class="stat-row"><span>✦ MP</span><span>${h.mp}/${h.maxMp}</span></div>
        <div class="stat-row"><span>⭐ EXP</span><span>${h.exp}/${GAME_DATA.expParaNivel(h.nivel)}</span></div>
        <div class="stat-row"><span>⚔ Ataque</span><span>${h.atk}</span></div>
        <div class="stat-row"><span>🛡 Defensa</span><span>${h.def}</span></div>
        <div class="stat-row"><span>✨ Magia</span><span>${h.mag}</span></div>
        <div class="stat-row"><span>💨 Agilidad</span><span>${h.agi}</span></div>
        <div class="stat-row"><span>🪙 Oro</span><span>${h.oro}</span></div>
    `;
    const grid = document.getElementById('items-grid');
    grid.innerHTML = '';
    let any = false;
    Object.entries(state.inventario).forEach(([id, qty]) => {
        if (!qty || !GAME_DATA.items[id]) return;
        any = true;
        const item = GAME_DATA.items[id];
        const d = document.createElement('div');
        d.className = 'item-slot'; d.title = item.descripcion;
        d.innerHTML = `<div class="item-icon">${item.icono}</div><div class="item-name">${item.nombre}</div><div class="item-qty">x${qty}</div>`;
        d.onclick = () => useItemFromInventory(id, item);
        grid.appendChild(d);
    });
    if (!any) grid.innerHTML = '<p style="color:var(--text-dim);font-style:italic;padding:20px;">Inventario vacío.</p>';
    const eq = state.equipado;
    document.getElementById('eq-weapon').textContent    = eq.weapon    ? `${GAME_DATA.items[eq.weapon].icono} ${GAME_DATA.items[eq.weapon].nombre}`     : 'Ninguna';
    document.getElementById('eq-armor').textContent     = eq.armor     ? `${GAME_DATA.items[eq.armor].icono} ${GAME_DATA.items[eq.armor].nombre}`       : 'Ninguna';
    document.getElementById('eq-accessory').textContent = eq.accessory ? `${GAME_DATA.items[eq.accessory].icono} ${GAME_DATA.items[eq.accessory].nombre}` : 'Ninguno';
}

function useItemFromInventory(id, item) {
    const h = state.hero;
    if (item.tipo === 'consumible') {
        if (item.efecto === 'curar_hp') { const a = h.hp; h.hp = Math.min(h.maxHp, h.hp+item.valor); notify(`${item.icono} +${h.hp-a} HP`); }
        else if (item.efecto === 'curar_mp') { h.mp = Math.min(h.maxMp, h.mp+item.valor); notify(`${item.icono} +${item.valor} MP`); }
        else if (item.efecto === 'curar_todo') { h.hp=h.maxHp; h.mp=h.maxMp; notify(`${item.icono} ¡HP y MP restaurados!`); }
        state.inventario[id]--;
        if (state.inventario[id] <= 0) delete state.inventario[id];
        updateHUD(); renderInventory();
    } else if (['arma','armadura','accesorio'].includes(item.tipo)) {
        equipItem(id, item);
    }
}

function equipItem(id, item) {
    const h = state.hero;
    const slot = {arma:'weapon', armadura:'armor', accesorio:'accessory'}[item.tipo];
    if (!slot) return;
    const prev = state.equipado[slot];
    if (prev) {
        const p = GAME_DATA.items[prev];
        if (p.bonusAtk) h.atk -= p.bonusAtk;
        if (p.bonusDef) h.def -= p.bonusDef;
        if (p.bonusMag) h.mag -= p.bonusMag;
        if (p.bonusHp)  { h.maxHp -= p.bonusHp; h.hp = Math.min(h.hp, h.maxHp); }
        state.inventario[prev] = (state.inventario[prev] || 0) + 1;
    }
    if (item.bonusAtk) h.atk += item.bonusAtk;
    if (item.bonusDef) h.def += item.bonusDef;
    if (item.bonusMag) h.mag += item.bonusMag;
    if (item.bonusHp)  h.maxHp += item.bonusHp;
    state.equipado[slot] = id;
    state.inventario[id]--;
    if (state.inventario[id] <= 0) delete state.inventario[id];
    notify(`✅ Equipado: ${item.icono} ${item.nombre}`);
    updateHUD(); renderInventory();
}

function closeInventory() {
    state.hero ? showScreen('game-world') : showScreen('main-menu');
}

// =============================================
// GUARDAR / CARGAR
// =============================================
function saveGame() {
    if (!state.hero) return;
    localStorage.setItem('cronica_save', JSON.stringify({
        hero: state.hero, currentZone: state.currentZone,
        misiones: state.misiones, inventario: state.inventario,
        equipado: state.equipado, kills: state.kills
    }));
    notify('💾 Partida guardada.');
}

function loadGame() {
    const raw = localStorage.getItem('cronica_save');
    if (!raw) { notify('No hay partida guardada.'); return; }
    const d = JSON.parse(raw);
    state.hero        = d.hero;
    state.currentZone = d.currentZone;
    state.misiones    = d.misiones || {};
    state.inventario  = d.inventario || {};
    state.equipado    = d.equipado || { weapon:null, armor:null, accessory:null };
    state.kills       = d.kills || {};
    showScreen('game-world');
    updateHUD(); renderQuests(); unlockZones();
    notify(`✅ Bienvenido de vuelta, ${state.hero.nombre}!`);
}

// =============================================
// MISCELÁNEA
// =============================================
function showQuestLog() { notify("📜 Misiones visibles en el panel derecho"); }

function calcDmg(atk, def) {
    return Math.max(1, atk - Math.floor(def * 0.7) + Math.floor(Math.random() * 4) - 2);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let notifTimer;
function notify(msg) {
    const n = document.getElementById('notification');
    document.getElementById('notification-text').textContent = msg;
    n.classList.remove('hidden');
    clearTimeout(notifTimer);
    notifTimer = setTimeout(() => n.classList.add('hidden'), 3200);
}
