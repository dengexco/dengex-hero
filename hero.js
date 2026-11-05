const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
'use strict';

// Native controls over an animated signal diagram; autoplay never changes the route.
(() => {
  const scene = document.querySelector('#intro-scene');
  const wires = document.querySelector('#flow-wires');
  const services = document.querySelector('#flow-services');
  const core = document.querySelector('#flow-core');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const playback = document.querySelector('#flow-playback');
  let phase = 'initial', chosenId = 'ai', paused = reduced.matches;
  let manualUntil = 0;
  let overControl = false, focusedControl = false;

  let beamNodes = [], beamFrame = null, beamLast = 0, beamTime = 0, lastBeamCycle = 0;
  const scenarios = {
    ai: [['VERİ', 'MODEL', 'GÖRSEL'], ['ANALİZ', 'KARAR', 'ENTEGRASYON']],
    balancex: [['GİRİŞ', 'ÖLÇÜM', 'TÜKETİM'], ['DENGE', 'FARK', 'RAPOR']],
    crm: [['MÜŞTERİ', 'TALEP', 'İLETİŞİM'], ['GÖREV', 'ÇÖZÜM', 'TAKİP']],
    erp: [['KAYNAK', 'STOK', 'İŞ EMRİ'], ['PLAN', 'MALİYET', 'OPERASYON']],
    archive: [['BELGE', 'ÇİZİM', 'KAYIT'], ['ARŞİV', 'REVİZYON', 'ERİŞİM']],
    cyber: [['VARLIK', 'ERİŞİM', 'OLAY'], ['RİSK', 'KORUMA', 'İZLEME']],
    infrastructure: [['SUNUCU', 'SİSTEM', 'YEDEK'], ['İZLEME', 'KORUMA', 'SÜREKLİLİK']],
    seo: [['İÇERİK', 'SİTE', 'ARAMA'], ['ANALİZ', 'İYİLEŞTİRME', 'GÖRÜNÜRLÜK']],
    automation: [['OLAY', 'VERİ', 'SİSTEM'], ['İŞ AKIŞI', 'ONAY', 'ENTEGRASYON']],
    sector: [['SEKTÖR', 'İHTİYAÇ', 'VERİ'], ['ANALİZ', 'ETKİ', 'STRATEJİ']]
  };
  function buildWires() {
    // Reference geometry: seven converging inputs, one shared output.
    const inputPaths = [
      'M843.505 284.659L752.638 284.659C718.596 284.659 684.866 280.049 653.251 271.077L598.822 255.629L0.675021 1.00011',
      'M843.505 298.181L724.342 297.36C708.881 297.36 693.45 296.409 678.22 294.518L598.822 284.659C592.82 284.659 200.538 190.002 0.675028 164.892',
      'M843.505 311.703L701.108 310.061L598.822 305.136L0.675049 256.071',
      'M843.505 325.224L598.822 326.002L0.675049 321.858',
      'M843.505 338.746L701.108 340.388L598.822 345.442L0.675038 387.646',
      'M843.505 352.268L724.342 353.088C708.881 353.088 693.45 354.039 678.22 355.93L598.822 365.789L0.675067 478.825',
      'M843.505 365.789L752.638 365.789C718.596 365.789 684.866 370.399 653.251 379.372L598.822 394.82L0.675049 642.717'
    ].map(d => { let axis = 0; return d.replace(/\d+(?:\.\d+)?/g, value => String((axis++ % 2 === 0 ? Number(value) * .95 : Number(value) * .65 + 40).toFixed(3))); });
    const outputPath = 'M 800 251 L 1045 252 L 1600 249';
    let defs = '<linearGradient id="flow-base-in" x1="0" y1="0" x2="805" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="#9fc0d9" stop-opacity="0"/><stop offset=".48" stop-color="#9fc0d9" stop-opacity=".34"/><stop offset="1" stop-color="#9fc0d9" stop-opacity=".08"/></linearGradient><linearGradient id="flow-base-out" x1="800" y1="0" x2="1600" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="#9fc0d9" stop-opacity=".12"/><stop offset=".45" stop-color="#9fc0d9" stop-opacity=".3"/><stop offset="1" stop-color="#9fc0d9" stop-opacity="0"/></linearGradient>';
    let markup = inputPaths.map(d => `<path class="flow-reference-line" d="${d}" stroke="url(#flow-base-in)"/>`).join('') + `<path class="flow-reference-line" d="${outputPath}" stroke="url(#flow-base-out)"/>`;
    [...inputPaths, outputPath, outputPath, outputPath].forEach((d, i) => {
      const color = i < 7 ? '#00b8f8' : '#b9c1cc';
      defs += `<radialGradient id="beam-glow-${i}" gradientUnits="userSpaceOnUse" r="33"><stop stop-color="${color}" stop-opacity="1"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient><mask id="beam-mask-${i}" maskUnits="userSpaceOnUse" x="-50" y="-50" width="1750" height="650"><circle class="beam-mask-circle" r="33" fill="white"/></mask>`;
      markup += `<g class="flow-light-node" data-beam="${i}" opacity="0"><path class="beam-light-path" d="${d}" stroke="url(#beam-glow-${i})" mask="url(#beam-mask-${i})"/><circle class="beam-dot-glow" r="7" fill="${color}"/><circle class="beam-dot" r="2.3" fill="${i < 7 ? '#c9f2ff' : '#f0f2f5'}"/><text class="beam-label" text-anchor="middle">${i < 7 ? ['VERİ','MODEL','BELGE','SÜREÇ','ANALİZ','KAYIT','SİSTEM'][i] : ['KARAR','ÇÖZÜM','DEĞER'][i - 7]}</text></g>`;
    });
    wires.innerHTML = `<defs>${defs}</defs>${markup}<path class="satellite-wire" d="M 680 425 H 760 Q 800 425 800 385 V 320"/><path class="satellite-wire" d="M 800 180 V 120 Q 800 90 830 90 H 920"/>`;
    beamNodes = [...wires.querySelectorAll('[data-beam]')].map((node, i) => ({
      node, path: node.querySelector('path'), length: node.querySelector('path').getTotalLength(),
      gradient: wires.querySelector(`#beam-glow-${i}`), mask: wires.querySelector(`#beam-mask-${i} circle`),
      dot: node.querySelector('.beam-dot'), glow: node.querySelector('.beam-dot-glow'), label: node.querySelector('text')
    }));
  }
  function drawBeams(time) {
    const cycle = Math.floor(time / 6800), local = time % 6800;
    if (cycle !== lastBeamCycle) {
      lastBeamCycle = cycle;
      if (!overControl && !focusedControl && Date.now() >= manualUntil) step(1, false);
    }
    const active = [cycle % 7, (cycle + 2) % 7, (cycle + 5) % 7];
    const scenario = scenarios[chosenId] || scenarios.ai;
    scene.style.setProperty('--flow-progress', String(local / 6800));
    beamNodes.forEach((beam, i) => {
      const slot = i < 7 ? active.indexOf(i) : i - 7;
      const elapsed = local - (i < 7 ? slot * 220 : 2600 + slot * 140);
      const duration = i < 7 ? 2400 : 3400;
      beam.label.textContent = scenario[i < 7 ? 0 : 1][Math.max(0, slot)];
      if (slot < 0 || elapsed < 0 || elapsed > duration) { beam.node.setAttribute('opacity', '0'); return; }
      let position;
      if (i < 7) {
        // Ease into a brief stop, then accelerate into the chip.
        if (elapsed < 1000) position = .46 * (1 - Math.pow(2, -10 * elapsed / 1000));
        else if (elapsed < 1200) position = .46;
        else position = .46 + .54 * Math.pow((elapsed - 1200) / 1200, 3);
      } else {
        const hold = .22 * (slot + 1);
        position = elapsed < 1300 ? hold * (1 - Math.pow(2, -10 * elapsed / 1300)) : elapsed < 1900 ? hold : hold + (1 - hold) * Math.pow((elapsed - 1900) / 1500, 3);
      }
      const point = beam.path.getPointAtLength(beam.length * (i < 7 ? 1 - position : position));
      const opacity = Math.min(1, elapsed / 180, (duration - elapsed) / 260);
      beam.node.setAttribute('opacity', String(Math.max(0, opacity)));
      [beam.mask, beam.dot, beam.glow].forEach(element => { element.setAttribute('cx', point.x); element.setAttribute('cy', point.y); });
      beam.gradient.setAttribute('cx', point.x); beam.gradient.setAttribute('cy', point.y);
      beam.label.setAttribute('x', point.x); beam.label.setAttribute('y', point.y + 18);
      beam.label.setAttribute('opacity', elapsed > 250 && elapsed < duration - 550 ? '.8' : '0');
    });
    scene.classList.toggle('flow-processing', local > 2050 && local < 5650);
    scene.classList.toggle('flow-receiving', local < 2500);
    scene.classList.toggle('flow-delivering', local > 2900 && local < 6100);
  }
  function syncBeams(stopped) {
    if (beamFrame !== null) cancelAnimationFrame(beamFrame);
    beamFrame = null; beamLast = 0;
    if (reduced.matches) { beamNodes.forEach(beam => beam.node.setAttribute('opacity', '0')); return; }
    if (stopped) return;
    const tick = now => {
      beamTime += beamLast ? Math.min(now - beamLast, 50) : 16;
      beamLast = now; drawBeams(beamTime);
      beamFrame = requestAnimationFrame(tick);
    };
    beamFrame = requestAnimationFrame(tick);
  }
  services.innerHTML = capabilities.map((c, i) => `<button type="button" data-flow-service="${c.id}" aria-label="${esc(c.hub.label)} detaylarını aç" style="--service-index:${i}"><span class="flow-service-dot"></span>${esc(c.hub.label)}<span class="flow-service-progress" aria-hidden="true"></span></button>`).join('');

  function select(id, manual = false) {
    const c = capabilities.find(c => c.id === id);
    if (!c) return;
    chosenId = id;
    if (manual) manualUntil = Date.now() + 12000;
    document.querySelector('#flow-index').textContent = `${String(capabilities.indexOf(c) + 1).padStart(2, '0')} / ${capabilities.length}`;
    document.querySelector('#flow-service-title').textContent = c.hub.label;
    document.querySelector('#flow-service-description').textContent = c.subtitle;
    core.setAttribute('aria-label', `${c.hub.label} çözümünü aç`);
    services.querySelectorAll('button').forEach(button => {
      const active = button.dataset.flowService === id;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'true'); else button.removeAttribute('aria-current');
    });
    // Explicit feedback on a selected preview without rebuilding the animated SVG.
    scene.classList.remove('flow-signal-arriving');
    void core.offsetWidth;
    scene.classList.add('flow-signal-arriving');
  }
  function step(direction, manual = true) {
    const index = capabilities.findIndex(c => c.id === chosenId);
    select(capabilities[(index + direction + capabilities.length) % capabilities.length].id, manual);
  }
  function updatePlayback() {
    const stopped = paused || reduced.matches || document.hidden || phase !== 'hub';
    scene.classList.toggle('flow-paused', stopped);
    syncBeams(stopped);
    playback.disabled = reduced.matches;
    playback.setAttribute('aria-pressed', String(paused || reduced.matches));
    playback.setAttribute('aria-label', reduced.matches ? 'Azaltılmış hareket tercihi etkin' : paused ? 'Otomatik önizlemeyi sürdür' : 'Otomatik önizlemeyi duraklat');
    playback.innerHTML = paused || reduced.matches ? '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 5 10 7-10 7z"/></svg>' : '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 6v12M15 6v12"/></svg>';

  }
  // Integration point: listen on #intro-scene for the bubbling hero-select event.
  function choose(id, present = false) {
    select(id, true);
    scene.dispatchEvent(new CustomEvent('hero-select', {
      bubbles: true, detail: { id, present }
    }));
  }
  services.addEventListener('click', event => { const button = event.target.closest('[data-flow-service]'); if (button) choose(button.dataset.flowService); });
  services.addEventListener('pointerover', event => { const button = event.target.closest('[data-flow-service]'); if (button) select(button.dataset.flowService, true); });
  services.addEventListener('focusin', event => { const button = event.target.closest('[data-flow-service]'); if (button) select(button.dataset.flowService, true); });
  document.querySelector('#flow-start').addEventListener('click', () => choose(chosenId));
  document.querySelector('#flow-present').addEventListener('click', () => choose(chosenId, true));
  core.addEventListener('click', () => choose(chosenId));
  document.querySelector('#flow-selected').addEventListener('click', () => choose(chosenId));
  document.querySelector('#flow-prev').addEventListener('click', () => step(-1));
  document.querySelector('#flow-next').addEventListener('click', () => step(1));
  playback.addEventListener('click', () => { paused = !(paused || reduced.matches); if (reduced.matches) paused = true; updatePlayback(); });
  scene.querySelectorAll('button').forEach(button => {
    button.addEventListener('pointerenter', () => { overControl = true; });
    button.addEventListener('pointerleave', () => { overControl = false; });
  });
  scene.addEventListener('focusin', () => { focusedControl = true; });
  scene.addEventListener('focusout', event => { focusedControl = scene.contains(event.relatedTarget); });
  scene.addEventListener('pointermove', event => {
    if (reduced.matches || event.pointerType === 'touch') return;
    const rect = scene.getBoundingClientRect();
    core.style.setProperty('--tilt-x', `${-((event.clientY - rect.top) / rect.height - .5) * 6}deg`);
    core.style.setProperty('--tilt-y', `${((event.clientX - rect.left) / rect.width - .5) * 6}deg`);
  });
  scene.addEventListener('pointerleave', () => { core.style.setProperty('--tilt-x', '0deg'); core.style.setProperty('--tilt-y', '0deg'); overControl = false; });
  reduced.addEventListener('change', () => { paused = reduced.matches; updatePlayback(); });
  document.addEventListener('visibilitychange', updatePlayback);
  window.addEventListener('pagehide', () => syncBeams(true));
  window.addEventListener('pageshow', updatePlayback);
  buildWires(); phase = 'hub'; select(chosenId); updatePlayback();
})();
