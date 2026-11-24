const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.resolve('../herramienta/Aforos_a_Vissim.html'));
  await p.setInputFiles('#fXlsx', path.resolve('../datos/aforos.xlsx')); await p.setInputFiles('#fInpx', path.resolve('../datos/modelo.inpx'));
  await p.waitForSelector('#secCfg:not(.hidden)'); await p.selectOption('[data-route="2|1"]', '22');
  const out = {};
  for (const per of ['M', 'T']) for (const pico of ['int', 'acc']) for (const vol of ['hp', 'q15']) {
    await p.selectOption('#selDia', '15-10-26'); await p.selectOption('#selPer', per); await p.selectOption('#selPico', pico); await p.selectOption('#selVol', vol);
    await p.click('#btnRun');
    out[`${per}_${pico}_${vol}`] = await p.evaluate(() => ({
      vols: OUT.res.changes.filter(c => c.attr.startsWith('Volumen')).map(c => [c.obj, c.nw]),
      picos: Object.fromEntries(Object.entries(OUT.calc.acc).map(([a, A]) => [a, A.pk.labels[0].slice(0, 5) + '-' + A.pk.labels[3].slice(-5)])),
      rutas: OUT.res.changes.filter(c => c.attr === 'Proporción' && c.check).map(c => [c.obj, c.nw]) }));
  }
  fs.writeFileSync('exp_sens.json', JSON.stringify(out, null, 1));
  for (const [k, v] of Object.entries(out)) console.log(k, JSON.stringify(v.picos), v.vols.map(x => x[1]).join(' / '), v.rutas.map(x => x[1]).join(' '));
  await b.close();
})();
