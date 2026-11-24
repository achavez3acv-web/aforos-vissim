const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.resolve('../herramienta/Aforos_a_Vissim.html'));
  await p.setInputFiles('#fXlsx', path.resolve('../datos/aforos.xlsx'));
  await p.waitForFunction(() => typeof AF !== 'undefined' && AF);
  const res = await p.evaluate(({ N, NFP, CFGS }) => {
    const mk = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const BASE = '15-10-26', X = 'TEST', giros = Object.values(AF.accesos).flat(), pers = ['M', 'T'];
    const base = JSON.parse(JSON.stringify(AF.data[BASE]));
    const baseTot = AF.totals.filter(t => t.dia === BASE).map(t => ({ ...t, dia: X }));
    const allTot = AF.totals;
    const sum = v => v.reduce((a, x) => a + (typeof x === 'number' ? x : 0), 0);
    const run = (data, tots) => { AF.data[X] = data; AF.totals = tots; const iss = qa(X).filter(i => i.sev !== 'info'); AF.totals = allTot; delete AF.data[X]; return iss; };
    const has = (iss, tipo, g, per, l) => iss.some(i => i.tipo === tipo && i.giro === g && i.per === per && (l == null || i.intervalo === l));
    const out = {};
    for (const [name, cfg] of Object.entries(CFGS)) {
      ZERO_MED = cfg[0]; REP_MIN = cfg[1]; REP_NZ = cfg[2]; OUT_K = cfg[3]; OUT_MIN = cfg[4] ?? Infinity;
      const R = mk(20261120); const ri = n => Math.floor(R() * n), pick = a => a[ri(a.length)];
      const loc = () => { const g = pick(giros), per = pick(pers), L = AF.labels[per], i = ri(L.length); return { g, per, L, i, l: L[i] }; };
      const det = (fn) => { let d = 0, n = 0; for (let k = 0; k < N; k++) { const dd = JSON.parse(JSON.stringify(base)); const e = fn(dd); if (!e) { k--; continue; } n++; if (has(run(dd, baseTot.map(t => ({ ...t, vals: [...t.vals] }))), e.tipo, e.g, e.per, e.l)) d++; } return +(d / n).toFixed(3); };
      const r = {};
      r.cero = det(d => { const { g, per, l } = loc(); d[g][l] = [0, 0, 0, 0]; return { tipo: 'Intervalo en cero', g, per, l }; });
      r.copia = det(d => { const { g, per, L, i, l } = loc(); if (i === 0 || sum(d[g][L[i - 1]]) === 0 || JSON.stringify(d[g][l]) === JSON.stringify(d[g][L[i - 1]])) return null; d[g][l] = [...d[g][L[i - 1]]]; return { tipo: 'Intervalo repetido', g, per, l }; });
      r.x10 = det(d => { const { g, per, l } = loc(); const k = ri(4); if (!(d[g][l][k] >= 1)) return null; d[g][l][k] *= 10; return { tipo: 'Valor atípico', g, per, l }; });
      const pois = lam => { if (lam <= 0) return 0; if (lam < 30) { let L = Math.exp(-lam), k = 0, q = 1; do { k++; q *= R(); } while (q > L); return k - 1; } const u = 1 - R(), v = R(); return Math.max(0, Math.round(lam + Math.sqrt(lam) * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v))); };
      let ds1 = 0, tot = 0; const by = {};
      for (let s = 0; s < NFP; s++) {
        const d = {}; for (const g of giros) { d[g] = {}; for (const l of [...AF.labels.M, ...AF.labels.T]) d[g][l] = base[g][l].map(x => pois(x)); }
        const tots = baseTot.map(t => { const per = /MA/i.test(t.label) ? 'M' : 'T'; return { ...t, vals: [0, 1, 2, 3].map(k => AF.labels[per].reduce((a, l) => a + d[t.giro][l][k], 0)) }; });
        const iss = run(d, tots); if (iss.length) ds1++; tot += iss.length; iss.forEach(i => by[i.tipo] = (by[i.tipo] || 0) + 1);
      }
      r.fpPorDataset = +(tot / NFP).toFixed(3); r.fpDatasets = +(ds1 / NFP).toFixed(3); r.fpTipo = by;
      const real = d => { const c = {}; qa(d).filter(i => i.sev !== 'info').forEach(i => c[i.tipo] = (c[i.tipo] || 0) + 1); return c; };
      r.real15 = real('15-10-26'); r.real16 = real('16-10-26');
      out[name] = r;
    }
    ZERO_MED = 10; REP_MIN = 10; REP_NZ = 2; OUT_K = 4; OUT_MIN = 10;
    return out;
  }, { N: 500, NFP: 1000, CFGS: { 'A_original': [5, 1, 1, 4, null], 'B': [10, 10, 2, 4, 10], 'C': [10, 10, 2, 4, 15], 'D': [10, 10, 2, 5, 15], 'E': [10, 20, 2, 5, 20] } });
  fs.writeFileSync('exp_grid.json', JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await b.close();
})();
