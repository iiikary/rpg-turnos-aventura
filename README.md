# ⚔️ Crónicas del Reino Olvidado

Un RPG por turnos de fantasía medieval — jugable desde el navegador, sin instalación ni base de datos.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## 🎮 Características

- **6 clases de héroe**: Guerrero, Mago, Arquero, Paladín, Nigromante, Asesino
- **Mundo abierto** con 6 zonas: Aldea, Bosque Oscuro, Minas Malditas, Castillo, Volcán y El Abismo Final
- **Combate por turnos** con habilidades únicas por clase, venenos, buffs y críticos
- **Sistema de misiones** con recompensas de EXP, oro e ítems
- **Progresión de personaje**: sube de nivel y mejora tus estadísticas
- **Inventario y equipamiento**: armas, armaduras, accesorios, pociones
- **NPCs con diálogos** y tienda de objetos en cada zona
- **Guardar partida** con LocalStorage (sin MySQL, sin servidor)
- **Diseño elegante** oscuro medieval con animaciones, partículas y efectos visuales

## 🚀 Cómo Jugar

1. Clona o descarga el repositorio
2. Abre `index.html` en tu navegador (doble clic)
3. ¡Listo! No necesitas servidor ni base de datos

```bash
git clone https://github.com/iiikary/rpg-turnos-aventura.git
cd rpg-turnos-aventura
# Abre index.html en tu navegador favorito
```

## 📁 Estructura

```
rpg-turnos-aventura/
├── index.html        # Juego completo (todas las pantallas)
├── css/
│   └── style.css     # Diseño oscuro medieval elegante
└── js/
    ├── data.js       # Datos: clases, enemigos, items, misiones, zonas
    └── game.js       # Motor del juego: combate, inventario, guardado
```

## 🗺️ Zonas del Mundo de Valdoria

| Zona | Nivel Req. | Enemigos |
|------|-----------|----------|
| 🏘️ Aldea de Comienzo | 1 | Lobos, Goblins, Ratas |
| 🌲 Bosque Oscuro | 2 | Lobos de Sombra, Trolls, Hadas Corrompidas |
| ⛏️ Minas Malditas | 4 | Esqueletos, Golems de Piedra, Espectros |
| 🏰 Castillo del Rey | 7 | Caballeros Oscuros, Magos Negros, Guardianes |
| 🌋 Volcán Eterno | 10 | Demonios de Fuego, Elementales, Dragón |
| 🕳️ El Abismo Final | 15 | Sombras Eternas, Liche Inmortal, Rey Oscuro |

## ⚔️ Clases de Héroe

| Clase | Fortaleza | Habilidades |
|-------|-----------|-------------|
| 🛡️ Guerrero | HP / Defensa | Golpe Brutal, Escudo Férreo, Furia Berserker, Torbellino |
| 🔮 Mago | Magia masiva | Bola de Fuego, Rayo Arcano, Tormenta Mágica, Meteoro |
| 🏹 Arquero | Agilidad | Flecha Certera, Lluvia de Flechas, Tiro Crítico, Envenenada |
| ✨ Paladín | HP + Curación | Golpe Sagrado, Luz Divina, Aura Bendita, Castigo Celestial |
| 💀 Nigromante | Magia oscura | Drenar Vida, Maldición, Ejército Muerto, Plaga Oscura |
| 🗡️ Asesino | Críticos letales | Apuñalar, Veneno, Golpe Letal, Sombra Mortal |

---
*¡Que comience la aventura!* ⚔️
