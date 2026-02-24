# ⚔️ Crónicas del Reino Olvidado

Un RPG por turnos de fantasía medieval — jugable desde el navegador en móvil y escritorio, sin instalación ni base de datos.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-🎵-gold)

---

## 🎮 Características

- **6 clases de héroe**: Guerrero, Mago, Arquero, Paladín, Nigromante, Asesino
- **Mundo abierto** con 13 zonas desbloqueables por nivel
- **Combate por turnos** con 24 habilidades únicas, venenos, buffs, críticos y debuffs
- **57 tipos de enemigos** con stats escalados por nivel, desde Rata Gigante hasta el Rey Oscuro
- **Sistema de misiones** con recompensas de EXP, oro e ítems únicos
- **Progresión de personaje**: niveles 1–20 con stats que crecen según tu clase
- **Inventario y equipamiento**: armas, armaduras, accesorios, pociones consumibles
- **NPCs con diálogos** y tienda de objetos en cada zona
- **Guardar partida** con LocalStorage — sin MySQL, sin servidor
- **Música procedural** generada en tiempo real con Web Audio API (4 temas: menú, mundo, batalla, victoria)
- **Efectos de sonido** únicos para cada acción: golpes, magia, curación, críticos, huida y más
- **Panel de control de audio** flotante: activar/desactivar música y FX, sliders de volumen
- **Diseño medieval oscuro** con animaciones CSS, partículas y efectos visuales
- **Compatible con móvil** — optimizado para touch en iOS y Android

---

## 🚀 Cómo Jugar

1. Clona o descarga el repositorio
2. Abre `index.html` en tu navegador — funciona en Chrome, Firefox, Safari y Edge
3. ¡No necesitas servidor, Node.js ni base de datos!

```bash
git clone https://github.com/iiikary/rpg-turnos-aventura.git
cd rpg-turnos-aventura
# Abre index.html directamente en tu navegador
```

> **Nota móvil:** El audio se activa al primer toque en la pantalla (requerimiento de iOS/Android).

---

## 📁 Estructura del Proyecto

```
rpg-turnos-aventura/
├── index.html            # Estructura HTML: todas las pantallas del juego
├── css/
│   ├── style.css         # Diseño oscuro medieval: colores, animaciones, layouts
│   └── audio-panel.css   # Panel flotante de control de audio (mobile-first)
└── js/
    ├── data.js           # Base de datos del juego: clases, enemigos, items, misiones, zonas
    ├── game.js           # Motor del juego: combate, inventario, misiones, guardado
    └── audio.js          # Sistema de audio: música procedural + efectos (Web Audio API)
```

---

## 🗺️ Zonas del Mundo de Valdoria

| Zona | Nivel Req. | Enemigos destacados |
|------|-----------|---------------------|
| 🏘️ Aldea de Comienzo | 1 | Lobos, Goblins, Ratas, Aldeanos Zombie |
| 🌲 Bosque Oscuro | 2 | Lobos de Sombra, Trolls, Hadas Corrompidas, Duendes |
| 🏛 Catacumbas Antiguas | 3 | Muertos Vivientes, Vampiros, Esqueletos Guerreros |
| ⛏️ Minas Malditas | 4 | Golems de Piedra, Espectros, Gusanos de Roca, Trolls |
| 🌿 Pantanos Malditos | 5 | Serpientes Venenosas, Brujas, Caimanes Corruptos |
| 🏛️ Ruinas del Imperio | 6 | Golems Antiguos, Centinelas Rúnicos, Guerreros Antiguos |
| 🏰 Castillo del Rey | 7 | Caballeros Oscuros, Vampiros Nobles, Bestias del Castillo |
| 🗼 Torre del Mago | 8 | Hidras, Quimeras, Homúnculos, Elementales del Caos |
| 🏔️ Tundra Glacial | 9 | Lobos de Hielo, Osos Glaciales, Yetis, Gigantes de Hielo |
| 🌋 Volcán Eterno | 10 | Demonios de Fuego, Dragón de Llamas, Titanes de Roca |
| 🏜️ Desierto de Cenizas | 12 | Escorpiones Gigantes, Momias, Faraones Oscuros |
| ⛩️ Santuario Prohibido | 14 | Ángeles Corruptos, Titanes Sagrados, Semidioses Caídos |
| 🕳️ El Abismo Final | 15 | Liches, Demonios del Abismo, Rey Oscuro (boss final) |

---

## ⚔️ Clases de Héroe

| Clase | Fortaleza | Habilidades |
|-------|-----------|-------------|
| 🛡️ Guerrero | HP / Defensa | Golpe Brutal, Escudo Férreo, Furia Berserker, Torbellino |
| 🔮 Mago | Magia masiva | Bola de Fuego, Rayo Arcano, Tormenta Mágica, Meteoro |
| 🏹 Arquero | Agilidad / Críticos | Flecha Certera, Lluvia de Flechas, Tiro Crítico, Flecha Envenenada |
| ✨ Paladín | HP + Curación | Golpe Sagrado, Luz Divina, Aura Bendita, Castigo Celestial |
| 💀 Nigromante | Magia oscura | Drenar Vida, Maldición, Ejército Muerto, Plaga Oscura |
| 🗡️ Asesino | Burst / Críticos | Apuñalar, Veneno, Golpe Letal, Sombra Mortal |

---

## 🎵 Sistema de Audio

Toda la música y los efectos se generan **en tiempo real** con la Web Audio API. No hay archivos `.mp3` ni dependencias externas.

### Música procedural (4 temas)
| Tema | Cuándo suena |
|------|-------------|
| 🏰 Menú | Pantalla principal y selección de personaje |
| 🌍 Mundo | Mapa del reino y pantalla de zona |
| ⚔️ Batalla | Durante el combate por turnos |
| 🏆 Victoria | Fanfarria al ganar un combate |

### Efectos de sonido (22 efectos)
Ataque, magia, bola de fuego, flecha, curación, drenar vida, veneno, golpe crítico, daño al jugador, daño al enemigo, victoria, derrota, subir de nivel, inicio de batalla, clic de menú, selección, notificación, huida, ítem recogido y buff.

### Panel de control de audio
- Botón flotante 🎵 en esquina superior derecha
- Activar / desactivar música y efectos independientemente
- Sliders de volumen para música y FX
- Funciona con touch en iOS y Android

---

## 📱 Soporte Móvil

El juego está optimizado para jugarse en celular:
- Diseño responsive para pantallas pequeñas
- Botones con tamaño mínimo táctil (48×48px)
- Panel de audio sin `clip-path` (compatible con Safari iOS)
- Audio inicializado con `touchstart`/`touchend` (requerimiento de iOS/Android)
- Compresor dinámico para evitar distorsión en altavoces del teléfono
- Música con menos capas en móvil para no saturar la CPU

---

## 📝 Historial de Cambios

| Versión | Cambios |
|---------|---------|
| v1.0 | Juego base: 6 clases, 6 zonas, 18 enemigos, combate por turnos, misiones, inventario, guardado |
| v1.1 | Sistema de audio completo: música procedural + 22 efectos de sonido con Web Audio API |
| v1.2 | Fix móvil: panel de audio corregido, audio activado por touch, compressor dinámico |
| v1.3 | 5 zonas nuevas (Pantanos, Ruinas, Tundra, Desierto, Santuario) y 39 enemigos adicionales — 13 zonas y 57 enemigos en total |

---

*¡Que comience la aventura!* ⚔️
