// =============================================
// CRÓNICAS DEL REINO OLVIDADO — Datos del Juego
// =============================================

const GAME_DATA = {

    classes: {
        guerrero:   { nombre:"Guerrero",    icono:"🛡️", baseStats:{hp:120,mp:30,atk:18,def:14,mag:6,agi:10},  hpPerLevel:18,mpPerLevel:4,atkPerLevel:4,defPerLevel:3,magPerLevel:1,agiPerLevel:1, habilidades:["golpe_brutal","escudo_ferreo","furia_berserker","torbellino"] },
        mago:       { nombre:"Mago",        icono:"🔮", baseStats:{hp:65,mp:90,atk:8,def:6,mag:22,agi:12},   hpPerLevel:8,mpPerLevel:14,atkPerLevel:1,defPerLevel:1,magPerLevel:5,agiPerLevel:2, habilidades:["bola_fuego","rayo_arcano","tormenta_magica","meteor"] },
        arquero:    { nombre:"Arquero",     icono:"🏹", baseStats:{hp:85,mp:50,atk:14,def:9,mag:8,agi:20},   hpPerLevel:11,mpPerLevel:6,atkPerLevel:3,defPerLevel:2,magPerLevel:1,agiPerLevel:4, habilidades:["flecha_certera","lluvia_flechas","tiro_critico","flecha_envenenada"] },
        paladin:    { nombre:"Paladín",     icono:"✨", baseStats:{hp:100,mp:60,atk:14,def:12,mag:14,agi:8}, hpPerLevel:14,mpPerLevel:9,atkPerLevel:3,defPerLevel:2,magPerLevel:3,agiPerLevel:1, habilidades:["golpe_sagrado","luz_divina","aura_bendita","castigo_celestial"] },
        nigromante: { nombre:"Nigromante",  icono:"💀", baseStats:{hp:75,mp:80,atk:10,def:8,mag:20,agi:11},  hpPerLevel:9,mpPerLevel:12,atkPerLevel:2,defPerLevel:1,magPerLevel:4,agiPerLevel:2, habilidades:["drenar_vida","maldicion","ejercito_muerto","plaga_oscura"] },
        asesino:    { nombre:"Asesino",     icono:"🗡️", baseStats:{hp:80,mp:55,atk:17,def:8,mag:9,agi:18},   hpPerLevel:10,mpPerLevel:7,atkPerLevel:4,defPerLevel:1,magPerLevel:1,agiPerLevel:3, habilidades:["apunalar","veneno","golpe_letal","sombra_mortal"] }
    },

    habilidades: {
        golpe_brutal:     { nombre:"Golpe Brutal",       icono:"⚔",  costo:8,  tipo:"ataque",  multiplicador:1.8 },
        escudo_ferreo:    { nombre:"Escudo Férreo",       icono:"🛡",  costo:10, tipo:"defensa", bonusDef:8, turnos:3 },
        furia_berserker:  { nombre:"Furia Berserker",     icono:"💢", costo:15, tipo:"buff",    bonusAtk:10, turnos:3 },
        torbellino:       { nombre:"Torbellino",          icono:"🌀", costo:20, tipo:"ataque",  multiplicador:2.2 },
        bola_fuego:       { nombre:"Bola de Fuego",       icono:"🔥", costo:12, tipo:"magico",  multiplicador:2.0 },
        rayo_arcano:      { nombre:"Rayo Arcano",         icono:"⚡", costo:10, tipo:"magico",  multiplicador:1.7 },
        tormenta_magica:  { nombre:"Tormenta Mágica",     icono:"🌩", costo:22, tipo:"magico",  multiplicador:2.8 },
        meteor:           { nombre:"Meteoro",             icono:"☄",  costo:35, tipo:"magico",  multiplicador:3.5 },
        flecha_certera:   { nombre:"Flecha Certera",      icono:"🎯", costo:8,  tipo:"ataque",  multiplicador:1.6 },
        lluvia_flechas:   { nombre:"Lluvia de Flechas",   icono:"🏹", costo:18, tipo:"ataque",  multiplicador:1.4 },
        tiro_critico:     { nombre:"Tiro Crítico",        icono:"💥", costo:20, tipo:"ataque",  multiplicador:2.5, garantizaCritico:true },
        flecha_envenenada:{ nombre:"Flecha Envenenada",   icono:"☠",  costo:14, tipo:"veneno",  dañoPorTurno:6, turnos:3 },
        golpe_sagrado:    { nombre:"Golpe Sagrado",       icono:"✨", costo:10, tipo:"ataque",  multiplicador:1.8 },
        luz_divina:       { nombre:"Luz Divina",          icono:"💫", costo:20, tipo:"curar",   porcentaje:0.3 },
        aura_bendita:     { nombre:"Aura Bendita",        icono:"🌟", costo:25, tipo:"buff",    bonusDef:6, bonusAtk:4, turnos:4 },
        castigo_celestial:{ nombre:"Castigo Celestial",   icono:"☀",  costo:30, tipo:"magico",  multiplicador:3.0 },
        drenar_vida:      { nombre:"Drenar Vida",         icono:"🩸", costo:14, tipo:"drenar",  multiplicador:1.5 },
        maldicion:        { nombre:"Maldición",           icono:"🔮", costo:12, tipo:"debuff",  reduccionAtk:6, turnos:3 },
        ejercito_muerto:  { nombre:"Ejército Muerto",     icono:"💀", costo:25, tipo:"magico",  multiplicador:2.2 },
        plaga_oscura:     { nombre:"Plaga Oscura",        icono:"🌑", costo:30, tipo:"veneno",  dañoPorTurno:10, turnos:4 },
        apunalar:         { nombre:"Apuñalar",            icono:"🗡", costo:8,  tipo:"ataque",  multiplicador:1.7 },
        veneno:           { nombre:"Veneno",              icono:"☠",  costo:12, tipo:"veneno",  dañoPorTurno:8, turnos:3 },
        golpe_letal:      { nombre:"Golpe Letal",         icono:"💀", costo:22, tipo:"ataque",  multiplicador:2.8, garantizaCritico:true },
        sombra_mortal:    { nombre:"Sombra Mortal",       icono:"🌑", costo:28, tipo:"ataque",  multiplicador:3.2 }
    },

    zonas: {
        aldea:    { nombre:"Aldea de Comienzo", icono:"🏘️", fondo:"village-bg",  descripcion:"Un pacífico pueblo rodeado de colinas. Pero algo oscuro se acerca...",           nivelMin:1,  enemigos:["lobo_salvaje","goblin","rata_gigante"],              npc:{nombre:"Anciano Erwin",     icono:"👴", dialogo:["¡Bienvenido, joven aventurero! Este reino lleva décadas sufriendo...","El Rey Oscuro despertó hace un año y sus hordas avanzan desde el norte.","Necesitamos héroes valientes. ¿Aceptas la misión?"]},             misionId:"mision_aldea_1" },
        bosque:   { nombre:"Bosque Oscuro",     icono:"🌲", fondo:"forest-bg",   descripcion:"Niebla espesa cubre los árboles retorcidos. Ojos brillan en la oscuridad.",    nivelMin:2,  enemigos:["lobo_sombra","troll_arbol","hada_corrompida"],       npc:{nombre:"Druida Sylas",       icono:"🧙", dialogo:["Estos bosques eran sagrados... Ahora la oscuridad los ha corrompido.","Si derrotas a la Araña Reina, quizás el bosque pueda sanar.","Ten cuidado. Muchos aventureros se han perdido aquí para siempre."]}, misionId:"mision_bosque_1" },
        minas:    { nombre:"Minas Malditas",    icono:"⛏️", fondo:"dungeon-bg",  descripcion:"Cavernas kilométricas bajo tierra. Criaturas sin nombre merodean.",            nivelMin:4,  enemigos:["esqueleto_minero","golem_piedra","espectro"],        npc:{nombre:"Enano Dorak",        icono:"⛏",  dialogo:["¡Por la barba de mis ancestros! Estas minas eran nuestro hogar.","Un antiguo golem despertó y mató a todos mis compañeros.","Si lo detienes, compartiré los secretos de nuestro tesoro."]},    misionId:"mision_minas_1" },
        castillo: { nombre:"Castillo del Rey",  icono:"🏰", fondo:"dungeon-bg",  descripcion:"Otrora glorioso, ahora corroído por la magia oscura. El trono espera.",         nivelMin:7,  enemigos:["caballero_oscuro","mago_negro","guardian_castillo"], npc:{nombre:"Capitán Valdris",    icono:"⚔",  dialogo:["El rey fue corrompido por el Orbe Oscuro hace seis meses.","Los caballeros leales fuimos expulsados. El reino está perdido... sin tu ayuda.","Recupera el Orbe y podremos salvar al rey."]},               misionId:"mision_castillo_1" },
        volcan:   { nombre:"Volcán Eterno",     icono:"🌋", fondo:"dungeon-bg",  descripcion:"Lava ardiente y demonios de fuego. El calor es insoportable.",                 nivelMin:10, enemigos:["demonio_fuego","elemental_lava","dragon_llamas"],   npc:{nombre:"Pitonisa Vera",      icono:"🔮", dialogo:["El Dragón de Fuego duerme en el corazón del volcán.","Su escama es necesaria para forjar la Espada del Destino.","Solo el elegido puede enfrentarse a él y sobrevivir."]},         misionId:"mision_volcan_1" },
        abismo:   { nombre:"El Abismo Final",   icono:"🕳️", fondo:"dungeon-bg",  descripcion:"El dominio del Rey Oscuro. Aquí termina toda aventura... o comienza la leyenda.", nivelMin:15, enemigos:["sombra_eterna","lich","rey_oscuro"],               npc:{nombre:"Espíritu Antiguo",   icono:"👻", dialogo:["Has llegado hasta aquí. Pocos lo logran.","El Rey Oscuro es casi invencible. Solo con la Espada del Destino puedes vencerlo.","El destino del reino... del mundo... está en tus manos."]},    misionId:"mision_abismo_1" }
    },

    enemigos: {
        lobo_salvaje:      { nombre:"Lobo Salvaje",        icono:"🐺", nivelBase:1,  hp:30,  atk:8,  def:3,  exp:15,   oro:5 },
        goblin:            { nombre:"Goblin",              icono:"👺", nivelBase:1,  hp:25,  atk:7,  def:2,  exp:12,   oro:8 },
        rata_gigante:      { nombre:"Rata Gigante",        icono:"🐀", nivelBase:1,  hp:20,  atk:6,  def:1,  exp:10,   oro:3 },
        lobo_sombra:       { nombre:"Lobo de Sombra",      icono:"🐺", nivelBase:3,  hp:55,  atk:14, def:6,  exp:35,   oro:15 },
        troll_arbol:       { nombre:"Troll del Árbol",     icono:"🌳", nivelBase:4,  hp:80,  atk:16, def:10, exp:55,   oro:25 },
        hada_corrompida:   { nombre:"Hada Corrompida",     icono:"🧚", nivelBase:3,  hp:45,  atk:18, def:4,  exp:45,   oro:20 },
        esqueleto_minero:  { nombre:"Esqueleto Minero",    icono:"💀", nivelBase:5,  hp:70,  atk:18, def:8,  exp:60,   oro:22 },
        golem_piedra:      { nombre:"Golem de Piedra",     icono:"🗿", nivelBase:7,  hp:140, atk:22, def:20, exp:120,  oro:60 },
        espectro:          { nombre:"Espectro",            icono:"👻", nivelBase:6,  hp:80,  atk:24, def:6,  exp:90,   oro:40 },
        caballero_oscuro:  { nombre:"Caballero Oscuro",    icono:"⚔",  nivelBase:9,  hp:160, atk:28, def:18, exp:160,  oro:80 },
        mago_negro:        { nombre:"Mago Negro",          icono:"🔮", nivelBase:10, hp:110, atk:35, def:8,  exp:180,  oro:90 },
        guardian_castillo: { nombre:"Guardián del Castillo",icono:"🛡", nivelBase:11, hp:200, atk:30, def:22, exp:220,  oro:110 },
        demonio_fuego:     { nombre:"Demonio de Fuego",    icono:"😈", nivelBase:12, hp:180, atk:38, def:14, exp:250,  oro:130 },
        elemental_lava:    { nombre:"Elemental de Lava",   icono:"🌋", nivelBase:13, hp:220, atk:40, def:18, exp:300,  oro:150 },
        dragon_llamas:     { nombre:"Dragón de Llamas",    icono:"🐲", nivelBase:15, hp:380, atk:50, def:25, exp:600,  oro:400 },
        sombra_eterna:     { nombre:"Sombra Eterna",       icono:"🌑", nivelBase:16, hp:280, atk:48, def:20, exp:450,  oro:300 },
        lich:              { nombre:"Liche Inmortal",      icono:"💀", nivelBase:18, hp:360, atk:55, def:22, exp:700,  oro:500 },
        rey_oscuro:        { nombre:"Rey Oscuro",          icono:"👑", nivelBase:20, hp:600, atk:65, def:30, exp:2000, oro:1500 }
    },

    items: {
        pocion_hp:      { nombre:"Poción HP",       icono:"🧪", tipo:"consumible", efecto:"curar_hp",   valor:40,  precio:30,  descripcion:"Restaura 40 HP." },
        pocion_hp_mayor:{ nombre:"Poción Mayor HP", icono:"💊", tipo:"consumible", efecto:"curar_hp",   valor:100, precio:80,  descripcion:"Restaura 100 HP." },
        pocion_mp:      { nombre:"Poción MP",       icono:"💧", tipo:"consumible", efecto:"curar_mp",   valor:30,  precio:25,  descripcion:"Restaura 30 MP." },
        elixir:         { nombre:"Elixir",          icono:"✨", tipo:"consumible", efecto:"curar_todo", valor:999, precio:200, descripcion:"Restaura HP y MP al máximo." },
        espada_hierro:  { nombre:"Espada de Hierro",icono:"⚔",  tipo:"arma",       bonusAtk:8,          precio:120, descripcion:"+8 Ataque." },
        espada_acero:   { nombre:"Espada de Acero", icono:"🗡", tipo:"arma",       bonusAtk:16,         precio:280, descripcion:"+16 Ataque." },
        arco_caza:      { nombre:"Arco de Caza",    icono:"🏹", tipo:"arma",       bonusAtk:10,         precio:140, descripcion:"+10 Ataque." },
        baston_arcano:  { nombre:"Bastón Arcano",   icono:"🔮", tipo:"arma",       bonusMag:12,         precio:160, descripcion:"+12 Magia." },
        armadura_cuero: { nombre:"Armadura de Cuero",icono:"🥋",tipo:"armadura",   bonusDef:6,          precio:100, descripcion:"+6 Defensa." },
        armadura_hierro:{ nombre:"Armadura de Hierro",icono:"🛡",tipo:"armadura",  bonusDef:12,         precio:250, descripcion:"+12 Defensa." },
        anillo_fuerza:  { nombre:"Anillo de Fuerza",icono:"💍", tipo:"accesorio",  bonusAtk:5,          precio:180, descripcion:"+5 Ataque." },
        amuleto_vida:   { nombre:"Amuleto de Vida", icono:"❤",  tipo:"accesorio",  bonusHp:30,          precio:200, descripcion:"+30 HP máximo." }
    },

    misiones: {
        mision_aldea_1:    { nombre:"Proteger la Aldea",      descripcion:"Elimina 5 criaturas de la aldea.",      objetivo:{tipo:"matar_enemigos",enemigos:["lobo_salvaje","goblin","rata_gigante"],  cantidad:5, actual:0}, recompensa:{exp:80,   oro:50,   item:"pocion_hp"} },
        mision_bosque_1:   { nombre:"El Bosque Corrupto",     descripcion:"Derrota 6 criaturas del bosque.",       objetivo:{tipo:"matar_enemigos",enemigos:["lobo_sombra","troll_arbol","hada_corrompida"],cantidad:6,actual:0},recompensa:{exp:200,  oro:120,  item:"espada_hierro"} },
        mision_minas_1:    { nombre:"Las Minas Liberadas",    descripcion:"Elimina 8 criaturas de las minas.",     objetivo:{tipo:"matar_enemigos",enemigos:["esqueleto_minero","golem_piedra","espectro"],cantidad:8,actual:0},recompensa:{exp:450,  oro:300,  item:"armadura_hierro"} },
        mision_castillo_1: { nombre:"Recuperar el Trono",     descripcion:"Derrota 6 guardianes del castillo.",    objetivo:{tipo:"matar_enemigos",enemigos:["caballero_oscuro","mago_negro","guardian_castillo"],cantidad:6,actual:0},recompensa:{exp:800,  oro:600,  item:"espada_acero"} },
        mision_volcan_1:   { nombre:"El Dragón Eterno",       descripcion:"Derrota 4 criaturas del volcán.",       objetivo:{tipo:"matar_enemigos",enemigos:["demonio_fuego","elemental_lava","dragon_llamas"],cantidad:4,actual:0},recompensa:{exp:1500, oro:1200, item:"baston_arcano"} },
        mision_abismo_1:   { nombre:"El Destino del Reino",   descripcion:"Derrota al Rey Oscuro.",                objetivo:{tipo:"matar_enemigos",enemigos:["rey_oscuro"],cantidad:1,actual:0},             recompensa:{exp:5000, oro:5000, item:"elixir"} }
    },

    tiendaItems: ["pocion_hp","pocion_hp_mayor","pocion_mp","armadura_cuero","espada_hierro","arco_caza","baston_arcano"],

    expParaNivel: (nivel) => Math.floor(100 * Math.pow(1.4, nivel - 1))
};
