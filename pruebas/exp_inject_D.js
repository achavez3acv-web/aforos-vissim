const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.resolve('../herramienta/Aforos_a_Vissim.html'));
  await p.setInputFiles('#fXlsx', path.resolve('../datos/aforos.xlsx'));
  await p.waitForFunction(() => typeof AF !== 'undefined' && AF);
  const res = await p.evaluate(({ N, NFP, KS }) => {
    const mk = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const R = mk(20261120);
    const ri = n => Math.floor(R() * n), pick = a => a[ri(a.length)];
    const BASE = '15-10-26', X = 'TEST';
    const base = JSON.parse(JSON.stringify(AF.data[BASE]));
    const baseTot = AF.totals.filter(t => t.dia === BASE).map(t => ({ ...t, dia: X, vals: [...t.vals] }));
    const allTot = AF.totals;
    const giros = Object.values(AF.accesos).flat(); const pers = ['M', 'T'];
    const sum = v => v.reduce((a, x) => a + (typeof x === 'number' ? x : 0), 0);
    const median = arr => { const s = [...arr].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
    const run = (data, tots) => { AF.data[X] = data; AF.totals = tots; const iss = qa(X).filter(i => i.sev !== 'info'); AF.totals = allTot; delete AF.data[X]; return iss; };
    const has = (iss, tipo, g, per, l) => iss.some(i => i.tipo === tipo && i.giro === g && i.per === per && (l == null || i.intervalo === l));
    const baseIss = run(JSON.parse(JSON.stringify(base)), baseTot.map(t => ({ ...t, vals: [...t.vals] })));
    const out = { baseAlerts: baseIss.length, types: {}, fp: {} };
    const T = (name, fn) => { let det = 0, n = 0, extra = {}; for (let k = 0; k < N; k++) { const d = JSON.parse(JSON.stringify(base)); const tots = baseTot.map(t => ({ ...t, vals: [...t.vals] })); const exp = fn(d, tots); if (!exp) { k--; continue; } n++; const iss = run(d, tots); if (has(iss, exp.tipo, exp.g, exp.per, exp.l)) det++; if (exp.group) { (extra[exp.group] ||= [0, 0]); extra[exp.group][1]++; if (has(iss, exp.tipo, exp.g, exp.per, exp.l)) extra[exp.group][0]++; } } out.types[name] = { n, det, rate: det / n, extra }; };
    const loc = () => { const g = pick(giros), per = pick(pers), L = AF.labels[per], i = ri(L.length); return { g, per, L, i, l: L[i] }; };
    T('Intervalo vacío', d => { const { g, per, l } = loc(); d[g][l] = [null, null, null, null]; return { tipo: 'Intervalo vacío', g, per, l }; });
    T('Celda vacía', d => { const { g, per, l } = loc(); d[g][l][ri(4)] = null; return { tipo: 'Celda vacía', g, per, l }; });
    T('Valor con texto', d => { const { g, per, l } = loc(); const k = ri(4); d[g][l][k] = pick(['O', 'l2', String(d[g][l][k]) + ' ', '-']); return { tipo: 'Valor no numérico', g, per, l }; });
    T('Intervalo en cero', d => { const { g, per, L, l } = loc(); const m = median(L.map(x => sum(d[g][x]))); d[g][l] = [0, 0, 0, 0]; return { tipo: 'Intervalo en cero', g, per, l, group: m >= 5 ? 'mediana>=5' : 'mediana<5' }; });
    T('Intervalo copiado', d => { const { g, per, L, i, l } = loc(); if (i === 0 || sum(d[g][L[i - 1]]) === 0 || JSON.stringify(d[g][l]) === JSON.stringify(d[g][L[i - 1]])) return null; d[g][l] = [...d[g][L[i - 1]]]; return { tipo: 'Intervalo repetido', g, per, l }; });
    T('Periodo copiado', d => { const g = pick(giros); AF.labels.M.forEach((l, i) => d[g][AF.labels.T[i]] = [...d[g][l]]); return { tipo: 'Periodo copiado', g, per: 'T' }; });
    T('Total alterado', (d, tots) => { const t = pick(tots); const k = ri(4); t.vals[k] = t.vals[k] + pick([1, 2, 5, 10, -1, -2]); return { tipo: 'Total inconsistente', g: t.giro, per: /MA/i.test(t.label) ? 'M' : 'T' }; });
    T('Cero de más (×10)', d => { const { g, per, l } = loc(); const k = ri(4); if (!(d[g][l][k] >= 1)) return null; d[g][l][k] *= 10; return { tipo: 'Valor atípico', g, per, l, group: d[g][l][k] >= 10 ? 'resultado>=10' : 'resultado<10' }; });
    T('Dígito transpuesto', d => { const { g, per, l } = loc(); const k = ri(4); const v = d[g][l][k]; if (!(v >= 10 && v < 100) || v % 10 === Math.floor(v / 10)) return null; d[g][l][k] = (v % 10) * 10 + Math.floor(v / 10); return { tipo: 'Valor atípico', g, per, l }; });
    // falsas alarmas: datos limpios simulados (Poisson con la media observada del día 15)
    const pois = lam => { if (lam <= 0) return 0; if (lam < 30) { let L = Math.exp(-lam), k = 0, q = 1; do { k++; q *= R(); } while (q > L); return k - 1; } const u = 1 - R(), v = R(); return Math.max(0, Math.round(lam + Math.sqrt(lam) * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v))); };
    for (const K of KS) {
      OUT_K = K; const byType = {}; let ds1 = 0, total = 0;
      for (let s = 0; s < NFP; s++) {
        const d = {}; for (const g of giros) { d[g] = {}; for (const l of [...AF.labels.M, ...AF.labels.T]) d[g][l] = base[g][l].map(x => pois(x)); }
        const tots = baseTot.map(t => { const per = /MA/i.test(t.label) ? 'M' : 'T'; return { ...t, vals: [0, 1, 2, 3].map(k => AF.labels[per].reduce((a, l) => a + d[t.giro][l][k], 0)) }; });
        const iss = run(d, tots); if (iss.length) ds1++; total += iss.length; iss.forEach(i => byType[i.tipo] = (byType[i.tipo] || 0) + 1);
        if (K === KS[0]) iss.filter(i => i.tipo === 'Intervalo repetido').forEach(i => (out.repEx ||= []).length < 5 && out.repEx.push(i.giro + ' ' + i.detalle));
      }
      // detección de ×10 con este K
      let det = 0, n = 0;
      for (let k2 = 0; k2 < N; k2++) { const d = JSON.parse(JSON.stringify(base)); const { g, per, l } = loc(); const k = ri(4); if (!(d[g][l][k] >= 1)) { k2--; continue; } d[g][l][k] *= 10; n++; if (has(run(d, baseTot.map(t => ({ ...t, vals: [...t.vals] }))), 'Valor atípico', g, per, l)) det++; }
      out.fp['K=' + K] = { datasets: NFP, datasetsWithAlert: ds1, alerts: total, byType, x10det: det / n };
    }
    OUT_K = 5;
    return out;
  }, { N: 500, NFP: 1000, KS: [5] });
  fs.writeFileSync('exp_results_D.json', JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await b.close();
})();
