// Selector abreviado para elementos del DOM
const $ = id => document.getElementById(id);

// Funciones auxiliares y matemáticas
const f = (t, y, k) => -k * y;
const exact = (t, p, k) => p * Math.exp(-k * t);
const fmt = x => Number.isFinite(x) ? x.toFixed(6) : '—';

// Función para resolver la EDO usando el método numérico indicado (Heun o RK4)
function solve(method, p, k, T, h) {
    const N = T === 0 ? 0 : Math.ceil(T / h);
    const dt = N ? T / N : 0;
    let t = 0;
    let y = p;
    let out = [[0, p]];

    for (let i = 0; i < N; i++) {
        const a = f(t, y, k);
        let yn;

        if (method === 'heun') {
            const pred = y + dt * a;
            const b = f(t + dt, pred, k);
            yn = y + dt * (a + b) / 2;
        } else {
            const b = f(t + dt / 2, y + dt * a / 2, k);
            const c = f(t + dt / 2, y + dt * b / 2, k);
            const d = f(t + dt, y + dt * c, k);
            yn = y + dt * (a + 2 * b + 2 * c + d) / 6;
        }

        t = (i + 1) * dt;
        y = yn;
        out.push([t, y]);
    }

    return { out, dt, N };
}

// Cálculo del error absoluto y relativo
function err(num, ex) {
    const a = Math.abs(num - ex);
    return { 
        abs: a, 
        rel: ex !== 0 ? 100 * a / Math.abs(ex) : null 
    };
}

// Renderizado de la sección de verificación analítica
function renderVerification(p, k, T) {
    const end = exact(T, p, k);
    $('verification').innerHTML = `Sea P(t)=P₀e<sup>−kt</sup>.<br>` +
        `<b>1. Derivamos:</b> P′(t)=−kP₀e<sup>−kt</sup>.<br>` +
        `<b>2. Sustituimos en la EDO:</b> −kP₀e<sup>−kt</sup>=−k(P₀e<sup>−kt</sup>)=−kP(t). Se cumple P′=−kP.<br>` +
        `<b>3. Comprobamos la condición inicial:</b> P(0)=P₀e<sup>0</sup>=P₀.<br>` +
        `<b>4. En el tiempo final:</b> P(${T})=${p}·e<sup>−${k}·${T}</sup>=${fmt(end)} perros.`;
}

// Dibujo de la gráfica SVG con las curvas
function draw(p, k, T, H, R) {
    const svg = $('chart');
    const W = 900;
    const Hh = 400;
    const L = 65;
    const Rr = 20;
    const top = 20;
    const B = 55;
    const max = p || 1;

    const X = t => L + (T ? t / T : 0) * (W - L - Rr);
    const Y = y => top + (max - y) / max * (Hh - top - B);
    const pts = a => a.map(v => `${X(v[0])},${Y(v[1])}`).join(' ');

    const exactPts = Array.from({ length: 121 }, (_, i) => [T * i / 120, exact(T * i / 120, p, k)]);

    let grid = '';
    for (let j = 0; j <= 4; j++) {
        let v = max * j / 4;
        let yy = Y(v);
        grid += `<line x1="${L}" y1="${yy}" x2="${W - Rr}" y2="${yy}" stroke="#e3e9e4"/>` +
                `<text x="${L - 10}" y="${yy + 4}" text-anchor="end" font-size="12" fill="#66756e">${v.toFixed(0)}</text>`;
    }

    for (let j = 0; j <= 6; j++) {
        let t = T * j / 6;
        let xx = X(t);
        grid += `<line x1="${xx}" y1="${top}" x2="${xx}" y2="${Hh - B}" stroke="#eef1ee"/>` +
                `<text x="${xx}" y="${Hh - 28}" text-anchor="middle" font-size="12" fill="#66756e">${t.toFixed(1)}</text>`;
    }

    svg.innerHTML = `${grid}` +
        `<polyline points="${pts(exactPts)}" fill="none" stroke="#28745b" stroke-width="3"/>` +
        `<polyline points="${pts(H)}" fill="none" stroke="#d58a32" stroke-width="2.5"/>` +
        `<polyline points="${pts(R)}" fill="none" stroke="#4778bd" stroke-width="2.5"/>` +
        `<text x="${W / 2}" y="${Hh - 5}" text-anchor="middle" font-size="13">Tiempo (días)</text>` +
        `<text x="15" y="${Hh / 2}" transform="rotate(-90 15 ${Hh / 2})" text-anchor="middle" font-size="13">Población estimada</text>`;
}

// Generación de la bitácora paso a paso
function renderSteps(p, k, T, h) {
    const mode = $('procedure').value;
    const lines = [];
    const hs = [h, h / 2];

    lines.push(`DATOS: P₀=${p} perros; k=${k} día⁻¹; intervalo [0, ${T}] días; paso base h=${h}; segundo paso h/2=${h / 2}.`);
    lines.push('EDO: P′=−kP; f(t,P)=−kP.');

    if (mode === 'exact') {
        lines.push('\nSOLUCIÓN EXACTA');
        lines.push('Separación: dP/P=−k dt. Integración: ln|P|=−kt+C. Despejando: P(t)=Ce^(−kt).');
        lines.push(`Con P(0)=P₀=${p}: C=${p}. Por tanto P(t)=${p}e^(−${k}t).`);
        lines.push(`Comprobación: P′(t)=−${k}·${p}e^(−${k}t)=−kP(t), y P(0)=${p}e^0=${p}.`);
        lines.push(`P(${T})=${fmt(exact(T, p, k))} perros.`);
    } else if (mode === 'errors') {
        for (const step of hs) {
            lines.push(`\nENSAYO CON h=${step}`);
            for (const method of ['heun', 'rk4']) {
                const sol = solve(method, p, k, T, step);
                const v = sol.out.at(-1)[1];
                const ex = exact(T, p, k);
                const e = err(v, ex);
                lines.push(`${method.toUpperCase()}: N=${sol.N}; Pnum(T)=${fmt(v)}; Pexacta(T)=${fmt(ex)}; Eabs=|Pnum−Pexacta|=${e.abs.toExponential(8)}; Erel=${e.rel === null ? 'no definido porque exacta=0' : e.rel.toFixed(8) + '%'}.`);
            }
        }
        lines.push('\nComparación: un error menor indica una aproximación más precisa. En este ensayo, revisa los errores calculados para identificar el método más preciso y el efecto de reducir h.');
    } else {
        const method = mode;
        const sol = solve(method, p, k, T, h);
        lines.push(`\nDESARROLLO ${method === 'heun' ? 'HEUN' : 'RK4'} CON h=${h}; Δt efectivo=${sol.dt}; N=${sol.N}.`);
        
        let y = p;
        let t = 0;
        for (let i = 0; i < sol.N; i++) {
            const a = f(t, y, k);
            lines.push(`\nITERACIÓN ${i + 1}: tₙ=${fmt(t)}, Pₙ=${fmt(y)}.`);

            if (method === 'heun') {
                const pred = y + sol.dt * a;
                const b = f(t + sol.dt, pred, k);
                const yn = y + sol.dt * (a + b) / 2;
                lines.push(`1) k₁=f(tₙ,Pₙ)=−${k}(${fmt(y)})=${fmt(a)}.`);
                lines.push(`2) Predictor P*=Pₙ+Δt·k₁=${fmt(y)}+${sol.dt}(${fmt(a)})=${fmt(pred)}.`);
                lines.push(`3) k₂=f(tₙ+Δt,P*)=−${k}(${fmt(pred)})=${fmt(b)}.`);
                lines.push(`4) Corrector Pₙ₊₁=Pₙ+(Δt/2)(k₁+k₂)=${fmt(y)}+(${sol.dt}/2)(${fmt(a)}+${fmt(b)})=${fmt(yn)}.`);
                y = yn;
            } else {
                const b = f(t + sol.dt / 2, y + sol.dt * a / 2, k);
                const c = f(t + sol.dt / 2, y + sol.dt * b / 2, k);
                const d = f(t + sol.dt, y + sol.dt * c, k);
                const yn = y + sol.dt * (a + 2 * b + 2 * c + d) / 6;
                lines.push(`k₁=f(tₙ,Pₙ)=${fmt(a)}.`);
                lines.push(`k₂=f(tₙ+Δt/2,Pₙ+Δt·k₁/2)=${fmt(b)}.`);
                lines.push(`k₃=f(tₙ+Δt/2,Pₙ+Δt·k₂/2)=${fmt(c)}.`);
                lines.push(`k₄=f(tₙ+Δt,Pₙ+Δt·k₃)=${fmt(d)}.`);
                lines.push(`Pₙ₊₁=Pₙ+(Δt/6)(k₁+2k₂+2k₃+k₄)=${fmt(yn)}.`);
                y = yn;
            }
            t = (i + 1) * sol.dt;
        }
    }

    $('steps').textContent = lines.join('\n');
}

// Función principal de ejecución (orquestador de la interfaz)
function run() {
    const p = Number($('p0').value);
    const k = Number($('k').value);
    const T = Number($('T').value);
    const h = Number($('h').value);

    $('error').textContent = '';

    if (![p, k, T, h].every(Number.isFinite) || p < 0 || k < 0 || T < 0 || h <= 0) {
        $('error').textContent = 'Ingresa valores válidos: P₀, k y T deben ser ≥0; h debe ser >0.';
        return;
    }

    renderVerification(p, k, T);

    const H = solve('heun', p, k, T, h);
    const R = solve('rk4', p, k, T, h);
    const end = exact(T, p, k);
    const half = k > 0 ? Math.log(2) / k : null;

    const stats = [
        ['Población exacta en T', fmt(end) + ' perros'],
        ['Heun (h)', fmt(H.out.at(-1)[1]) + ' perros'],
        ['RK4 (h)', fmt(R.out.at(-1)[1]) + ' perros'],
        ['Reducción a la mitad', half === null ? 'No definida' : fmt(half) + ' días']
    ];

    $('stats').innerHTML = stats.map(s => `<div class="stat"><span class="muted">${s[0]}</span><strong>${s[1]}</strong></div>`).join('');
    
    draw(p, k, T, H.out, R.out);

    const errRows = [];
    for (const step of [h, h / 2]) {
        for (const method of ['heun', 'rk4']) {
            const sol = solve(method, p, k, T, step);
            const v = sol.out.at(-1)[1];
            const e = err(v, end);
            errRows.push(`<tr><td>${method === 'heun' ? 'Heun' : 'RK4'}</td><td>${step}</td><td>${fmt(v)}</td><td>${fmt(end)}</td><td>${e.abs.toExponential(5)}</td><td>${e.rel === null ? 'No definido' : e.rel.toFixed(8) + '%'}</td></tr>`);
        }
    }
    $('errorTable').querySelector('tbody').innerHTML = errRows.join('');

    const rows = [];
    for (let i = 0; i < H.out.length; i++) {
        const t = H.out[i][0];
        const ex = exact(t, p, k);
        const hv = H.out[i][1];
        const rv = R.out[i][1];
        const eh = err(hv, ex);
        const er = err(rv, ex);
        rows.push(`<tr><td>${i}</td><td>${fmt(t)}</td><td>${fmt(ex)}</td><td>${fmt(hv)}</td><td>${eh.abs.toExponential(3)}</td><td>${eh.rel === null ? '—' : eh.rel.toFixed(6)}</td><td>${fmt(rv)}</td><td>${er.abs.toExponential(3)}</td><td>${er.rel === null ? '—' : er.rel.toFixed(6)}</td></tr>`);
    }
    $('iterationTable').querySelector('tbody').innerHTML = rows.join('');

    const bestH = err(H.out.at(-1)[1], end);
    const bestR = err(R.out.at(-1)[1], end);
    const best = bestR.abs <= bestH.abs ? 'RK4' : 'Heun';

    const h2H = solve('heun', p, k, T, h / 2);
    const h2R = solve('rk4', p, k, T, h / 2);
    const eH2 = err(h2H.out.at(-1)[1], end);
    const eR2 = err(h2R.out.at(-1)[1], end);
    const bestHalf = eR2.abs <= eH2.abs ? 'RK4' : 'Heun';

    $('interpretation').innerHTML = `<p>En el escenario hipotético planteado para Arapata, el modelo estima que la cantidad de perros sin hogar o pendientes de adopción pasa de <b>${fmt(p)}</b> al inicio a <b>${fmt(end)}</b> al día ${T}. Según la hipótesis de tasa constante, la población disminuye de forma exponencial.</p>` +
        `<p>Con el paso h=${h}, el método con menor error absoluto al final del intervalo es <b>${best}</b> (Heun: ${bestH.abs.toExponential(4)}; RK4: ${bestR.abs.toExponential(4)}). Con h/2=${h / 2}, el método con menor error es <b>${bestHalf}</b> (Heun: ${eH2.abs.toExponential(4)}; RK4: ${eR2.abs.toExponential(4)}).</p>` +
        `<p>Para la población de Arapata, la pregunta del desafío se responde indicando que, bajo los supuestos del modelo, la cantidad estimada de perros sin hogar o pendientes de adopción disminuye exponencialmente; las aproximaciones numéricas siguen esa tendencia y pueden contrastarse con la solución exacta. Reducir el tamaño de paso suele mejorar la aproximación, aunque requiere más iteraciones.</p>`;

    renderSteps(p, k, T, h);
}

// Enlazado de eventos y carga inicial
$('run').addEventListener('click', run);
$('procedure').addEventListener('change', () => run());
run();