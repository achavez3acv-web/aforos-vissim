const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.resolve('../herramienta/Aforos_a_Vissim.html'));
  await p.setInputFiles('#fXlsx', path.resolve('../datos/aforos.xlsx'));
  await p.waitForFunction(() => typeof AF !== 'undefined' && AF);
  const res = await p.evaluate(({ NFP, KS }) => {
    const mk = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const R = mk(424242);
    const norm = () => { const u = 1 - R(), v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const gamma = (k, th) => { if (k < 1) return gamma(k + 1, th) * Math.pow(R(), 1 / k); const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d); for (;;) { let x, v; do { x = norm(); v = 1 + c * x; } while (v <= 0); v = v * v * v; const u = R(); if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v * th; } };
    const pois = lam => { if (lam <= 0) return 0; if (lam < 30) { let L = Math.exp(-lam), k = 0, q = 1; do { k++; q *= R(); } while (q > L); return k - 1; } return Math.max(0, Math.round(lam + Math.sqrt(lam) * norm())); };
    const nb = (lam, k) => lam <= 0 ? 0 : (k === Infinity ? pois(lam) : pois(gamma(k, lam / k)));
    const base = AF.data['15-10-26'], giros = Object.values(AF.accesos).flat(), allTot = AF.totals, X = 'TEST';
    const baseTot = AF.totals.filter(t => t.dia === '15-10-26').map(t => ({ ...t, dia: X }));
    const out = {};
    for (const K0 of KS) { const K = K0 === null ? Infinity : K0;
      let ds1 = 0, tot = 0; const by = {};
      for (let s = 0; s < NFP; s++) {
        const d = {}; for (const g of giros) { d[g] = {}; for (const l of [...AF.labels.M, ...AF.labels.T]) d[g][l] = base[g][l].map(x => nb(x, K)); }
        const tots = baseTot.map(t => { const per = /MA/i.test(t.label) ? 'M' : 'T'; return { ...t, vals: [0, 1, 2, 3].map(k => AF.labels[per].reduce((a, l) => a + d[t.giro][l][k], 0)) }; });
        AF.data[X] = d; AF.totals = tots; const iss = qa(X).filter(i => i.sev !== 'info'); AF.totals = allTot; delete AF.data[X];
        if (iss.length) ds1++; tot += iss.length; iss.forEach(i => by[i.tipo] = (by[i.tipo] || 0) + 1);
      }
      out[K === Infinity ? 'Poisson' : 'k=' + K] = { alarmasPorDia: +(tot / NFP).toFixed(3), diasConAlarma: ds1, byType: by };
    }
    return out;
  }, { NFP: 1000, KS: [null, 50, 20, 10] });
  fs.writeFileSync('exp_nb.json', JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await b.close();
})();
