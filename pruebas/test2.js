const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  await p.goto('file://' + path.resolve('../herramienta/Aforos_a_Vissim.html'));
  const base = path.resolve('../datos');
  await p.setInputFiles('#fXlsx', base + '/aforos.xlsx'); await p.setInputFiles('#fInpx', base + '/modelo.inpx');
  await p.waitForSelector('#secCfg:not(.hidden)'); await p.selectOption('[data-route="2|1"]', '22');
  const out = {};
  for (const dia of ['15-10-26', '16-10-26']) for (const per of ['M', 'T']) {
    await p.selectOption('#selDia', dia); await p.selectOption('#selPer', per);
    const times = [];
    for (let k = 0; k < 10; k++) { await p.click('#btnRun'); times.push(await p.evaluate(() => OUT.ms)); }
    const r = await p.evaluate(() => ({
      issues: OUT.issues.map(i => [i.sev, i.tipo, i.giro, i.per, i.intervalo, i.afectaHP]),
      pk: OUT.calc ? [OUT.calc.pkInt.labels[0], OUT.calc.pkInt.labels[3], OUT.calc.pkInt.vol, OUT.calc.pkInt.q15max] : null,
      changes: OUT.res ? OUT.res.changes.map(c => [c.obj, c.attr, c.old, c.nw]) : null,
      verify: OUT.res ? OUT.res.verify : null, warns: OUT.res ? OUT.res.warns : null }));
    r.times = times; out[dia + '_' + per] = r;
  }
  require('fs').writeFileSync('results.json', JSON.stringify(out, null, 1));
  // captura de la interfaz para la figura
  await p.selectOption('#selDia', '15-10-26'); await p.selectOption('#selPer', 'M'); await p.click('#btnRun');
  await p.screenshot({ path: 'ui_full.png', fullPage: true });
  await b.close();
})();
