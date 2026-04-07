// script.js

// 1. ESTADO GLOBAL Y MÁQUINA DE ESTADOS
let creditos = 100;
let ganancias = 0;
let isSpinning = false;
let currentLightIndex = 1;
let esApuestaPersistente = false;

// Estados: 'NORMAL', 'ESPERANDO_MINIJUEGO', 'DOBLANDO'
let estadoJuego = 'NORMAL'; 
let miniGameInterval = null;
let miniGameNum = 1;
let girosPendientesMinijuego = 0;

let apuestas = {
    cereza: 0, manzana: 0, naranja: 0, uva: 0,
    campana: 0, bar: 0, siete: 0, estrella: 0, sandia: 0
};

// FIX: BAR separado en la tabla de pagos
const paytable = {
    cereza: 2, manzana: 5, naranja: 10, uva: 15,
    campana: 20, sandia: 20, estrella: 40, siete: 40, 
    bar50: 50, bar100: 100 
};

// FIX: Casilla 3 es bar50, Casilla 4 es bar100
const tableroMap = {
    1: 'naranja', 2: 'campana', 3: 'bar50', 4: 'bar100', 5: 'manzana', 6: 'cereza', 7: 'uva',
    8: 'sandia', 9: 'cereza', 10: 'oncemore', 11: 'manzana', 12: 'cereza',
    13: 'naranja', 14: 'campana', 15: 'cereza', 16: 'siete', 17: 'manzana', 18: 'cereza', 19: 'uva',
    20: 'estrella', 21: 'cereza', 22: 'oncemore', 23: 'manzana', 24: 'cereza'
};

// 2. ELEMENTOS DEL DOM
const uiCreditos = document.getElementById('credit-counter');
const uiGanancias = document.getElementById('win-counter');
const btnStart = document.getElementById('btn-start');
const btnReset = document.getElementById('btn-reset');
const btnCobrar = document.getElementById('btn-cobrar'); 
const btnInsertCoin = document.getElementById('btn-insert-coin');
const casillas = document.querySelectorAll('.casilla');
const botonesApuesta = document.querySelectorAll('.boton-apuesta');

// Botones y UI de los minijuegos
const btnDobleIzq = document.querySelectorAll('.btn-doble')[0];
const btnDobleDer = document.querySelectorAll('.btn-doble')[1];
const ledIzq = document.querySelector('.led-left');
const ledDer = document.querySelector('.led-right');
const centroUI = document.getElementById('startPressSequence');
const centroLegend = centroUI.querySelector('.sec-legend');
const centroNumber = centroUI.querySelector('.sec-number');

// 3. FUNCIONES DE UI
function actualizarUI() {
    uiCreditos.innerText = creditos;
    uiGanancias.innerText = ganancias;

    let totalApostado = 0;
    Object.keys(apuestas).forEach(fruta => {
        const boton = document.querySelector(`.bet-${fruta}`);
        const icono = boton.innerHTML.split('<br>')[0]; 
        boton.innerHTML = `${icono}<br>${apuestas[fruta]}`;
        totalApostado += apuestas[fruta];
    });

    if (totalApostado > 0 && !isSpinning && estadoJuego === 'NORMAL') {
        btnStart.disabled = false;
    } else if (estadoJuego === 'ESPERANDO_MINIJUEGO') {
        btnStart.disabled = false; // Habilitado para disparar el minijuego
    } else {
        btnStart.disabled = true;
    }
}

// 4. LÓGICA DE BOTONES BÁSICOS
btnInsertCoin.addEventListener('click', () => {
    if (estadoJuego !== 'NORMAL') return;
    creditos += 10; 
    actualizarUI();
});

btnCobrar.addEventListener('click', () => {
    if (ganancias > 0 && estadoJuego === 'NORMAL' && !isSpinning) {
        creditos += ganancias;
        ganancias = 0;
        actualizarUI();
    }
});

btnReset.addEventListener('click', () => {
    if (estadoJuego !== 'NORMAL' || isSpinning) return;
    if (ganancias > 0) { creditos += ganancias; ganancias = 0; }
    if (!esApuestaPersistente) {
        let dineroADevolver = Object.values(apuestas).reduce((a, b) => a + b, 0);
        creditos += dineroADevolver;
    }
    for (let key in apuestas) apuestas[key] = 0;
    esApuestaPersistente = false;
    actualizarUI();
});

botonesApuesta.forEach(boton => {
    boton.addEventListener('click', () => {
        if (estadoJuego !== 'NORMAL' || isSpinning) return;

        if (esApuestaPersistente) {
            for (let key in apuestas) apuestas[key] = 0;
            esApuestaPersistente = false;
        }

        const fruta = boton.dataset.fruta; 
        if (apuestas[fruta] < 9 && creditos > 0) {
            apuestas[fruta]++;
            creditos--;
            actualizarUI();
        }
    });
});

// 5. MECÁNICA DOBLE O NADA (Botones < y >)
function intentarDobleONada(eleccion) { // eleccion = 'left' o 'right'
    if (ganancias <= 0 || estadoJuego !== 'NORMAL' || isSpinning) return;
    
    estadoJuego = 'DOBLANDO';
    let parpadeos = 0;
    let actualLed = 'left';

    // Animación de parpadeo de LEDs
    let flashInterval = setInterval(() => {
        ledIzq.classList.remove('encendido');
        ledDer.classList.remove('encendido');
        
        if (actualLed === 'left') { ledIzq.classList.add('encendido'); actualLed = 'right'; }
        else { ledDer.classList.add('encendido'); actualLed = 'left'; }
        
        parpadeos++;
        if (parpadeos > 10) {
            clearInterval(flashInterval);
            resolverDobleONada(eleccion);
        }
    }, 150);
}

function resolverDobleONada(eleccion) {
    ledIzq.classList.remove('encendido');
    ledDer.classList.remove('encendido');

    // 50/50 Random
    const ganador = Math.random() < 0.5 ? 'left' : 'right';
    
    // Dejamos encendido permanentemente el ganador
    if (ganador === 'left') ledIzq.classList.add('encendido');
    else ledDer.classList.add('encendido');

    if (eleccion === ganador) {
        ganancias *= 2;
        console.log("¡Doblaste!");
    } else {
        ganancias = 0;
        console.log("¡Perdiste el doble o nada!");
    }

    estadoJuego = 'NORMAL';
    actualizarUI();
}

btnDobleIzq.addEventListener('click', () => intentarDobleONada('left'));
btnDobleDer.addEventListener('click', () => intentarDobleONada('right'));

// 6. GIRO Y BOTÓN START
btnStart.addEventListener('click', () => {
    // Si estamos esperando el número del minijuego
    if (estadoJuego === 'ESPERANDO_MINIJUEGO') {
        clearInterval(miniGameInterval);
        girosPendientesMinijuego = miniGameNum; 
        
        centroLegend.innerText = "¡TIROS!"; // <- CAMBIO DE TEXTO AQUÍ
        estadoJuego = 'NORMAL'; 
        
        setTimeout(() => {
            centroUI.style.display = 'none';
            ejecutarGirosMinijuego();
        }, 1000);
        return;
    }

    iniciarGiro(false); 
});

function ejecutarGirosMinijuego() {
    if (girosPendientesMinijuego > 0) {
        girosPendientesMinijuego--;
        iniciarGiro(true, true); // Giro gratis y más rápido
    }
}

function iniciarGiro(esGiroGratis = false, esRapido = false) {
    let costoTotal = Object.values(apuestas).reduce((a, b) => a + b, 0);
    if (costoTotal === 0 || isSpinning) return;

    if (!esGiroGratis) {
        if (ganancias > 0) { creditos += ganancias; ganancias = 0; }

        if (esApuestaPersistente) {
            if (creditos >= costoTotal) {
                creditos -= costoTotal;
                esApuestaPersistente = false; 
            } else {
                alert("¡No tienes créditos suficientes para repetir la apuesta!");
                return;
            }
        }
    } 
    // Si es giro gratis, MANTENEMOS la persistencia de la apuesta intacta

    isSpinning = true;
    actualizarUI(); 

    const casillaGanadora = Math.floor(Math.random() * 24) + 1;
    
    let girosExtra = esRapido ? 24 : 48; 
    let pasosTotales = girosExtra + casillaGanadora - currentLightIndex + 1; 
    if (pasosTotales <= girosExtra) pasosTotales += 24; 
    
    let pasoActual = 0;
    let velocidad = 30;

    function moverLuz() {
        document.querySelectorAll('.casilla').forEach(c => c.classList.remove('activa'));

        const casillaActiva = document.querySelector(`.casilla[data-id="${currentLightIndex}"]`);
        if(casillaActiva) casillaActiva.classList.add('activa');

        pasoActual++;
        currentLightIndex = currentLightIndex >= 24 ? 1 : currentLightIndex + 1;

        if (pasosTotales - pasoActual < 15) velocidad += (esRapido ? 5 : 15);
        if (pasosTotales - pasoActual < 5) velocidad += (esRapido ? 10 : 40);

        if (pasoActual < pasosTotales) {
            setTimeout(moverLuz, velocidad);
        } else {
            evaluarPremio(casillaGanadora, esRapido);
        }
    }
    moverLuz();
}

// 7. EVALUACIÓN Y EVENTOS
function evaluarPremio(idGanador, esParteDeMinijuego = false) {
    const resultado = tableroMap[idGanador];
    
    let frutaApostada = resultado;
    if (resultado === 'bar50' || resultado === 'bar100') frutaApostada = 'bar';
    
    // Disparador del Minijuego
    if ((resultado === 'oncemore' || resultado === 'bar50' || resultado === 'bar100') && !esParteDeMinijuego) {
        
        if (apuestas[frutaApostada] > 0) {
            ganancias += apuestas[frutaApostada] * paytable[resultado];
        }

        estadoJuego = 'ESPERANDO_MINIJUEGO';
        centroLegend.innerText = "PRESIONA START";
        centroUI.style.display = 'block';

        miniGameNum = 1;
        miniGameInterval = setInterval(() => {
            centroNumber.innerText = miniGameNum;
            miniGameNum++;
            if(miniGameNum > 3) miniGameNum = 1;
        }, 80);

        isSpinning = false; // <--- ¡EL BUGFIX MAESTRO! Liberamos el candado
        actualizarUI();
        return; 
    } 
    
    // Evaluación Normal
    if (apuestas[frutaApostada] > 0) {
        let premioObtenido = apuestas[frutaApostada] * paytable[resultado];
        ganancias += premioObtenido; 
        console.log(`¡Ganaste ${premioObtenido} con ${resultado}!`);
    }

    isSpinning = false;
    
    // Ráfaga de giros (si ganaste 3, ejecuta los que falten)
    if (girosPendientesMinijuego > 0) {
        setTimeout(ejecutarGirosMinijuego, 500); 
    } else {
        esApuestaPersistente = true; 
        actualizarUI();
    }
}

actualizarUI();