// Gắn giao diện với classify(). Không lưu gì: tải lại trang là bắt đầu lại.
import { classify } from './classify.js';
import { RULES } from './rules.js';
import { TEXTS } from '../content/texts.js';

const $ = (sel, root = document) => root.querySelector(sel);
const KEYS = ['vua', 'nang', 'longDinh'];

// ---------- Trạng thái ----------
const blank = () => ({
  moiMot: false,
  mat: { vua: 0, nang: 0, longDinh: 0 },
  ganh: { vua: 0, nang: 0, longDinh: 0 },
  gu: { vua: 0, nang: 0 },
  day: { vua: 0, nang: 0, longDinh: 0 },
});
let state = blank();
let last = null; // kết quả lần trước, để biết khi nào rung

const used = (g) => KEYS.reduce((s, k) => s + (state[g][k] || 0), 0);
const isDirty = () =>
  state.moiMot || Object.keys(RULES).some((g) => used(g) > 0);

// Thoát ký tự HTML khi chèn chuỗi
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- Dựng giao diện tĩnh ----------
function buildStatic() {
  $('#app-name').textContent = TEXTS.appName;
  $('#app-sub').textContent = TEXTS.appSubtitle;
  $('#btn-help').setAttribute('aria-label', TEXTS.ui.help);
  $('#q-moimot').textContent = TEXTS.moiMot.question;
  $('#q-moimot-hint').textContent = TEXTS.moiMot.hint;
  $('#moimot-no').textContent = TEXTS.moiMot.no;
  $('#moimot-yes').textContent = TEXTS.moiMot.yes;
  $('#btn-reset').textContent = TEXTS.ui.newPallet;
  $('#privacy').textContent = TEXTS.help.privacy;
  document.querySelectorAll('[data-close]').forEach((b) => b.setAttribute('aria-label', TEXTS.ui.close));

  // 4 thẻ nhóm
  const html = Object.entries(RULES).map(([g, r]) => {
    const t = TEXTS.groups[g];
    const keys = r.canRenail ? KEYS : ['vua', 'nang'];
    const rows = keys.map((k) => {
      const id = `${g}-${k}`;
      return `
      <div class="counter" data-g="${g}" data-k="${k}">
        <div class="info">
          <span class="name" id="${id}-name">${esc(TEXTS.counters[k])}</span>
          <span class="hint" id="${id}-hint">${esc(TEXTS.hints[g][k])}</span>
        </div>
        <div class="stepper" role="group" aria-labelledby="${id}-name">
          <button type="button" class="step" data-act="dec" aria-label="${esc(TEXTS.ui.decrease)} ${esc(TEXTS.counters[k])} ${esc(t.name)}">−</button>
          <output class="val zero" id="${id}-val" aria-live="off">0</output>
          <button type="button" class="step" data-act="inc" aria-label="${esc(TEXTS.ui.increase)} ${esc(TEXTS.counters[k])} ${esc(t.name)}">+</button>
        </div>
      </div>`;
    }).join('');
    return `
    <section class="card group" id="card-${g}" aria-labelledby="h-${g}">
      <div class="group-head">
        <span class="swatch sw-${g}" aria-hidden="true"></span>
        <h2 id="h-${g}">${esc(t.name)} <span class="total">— ${r.total} ${esc(t.unit)}</span></h2>
      </div>
      <p class="group-desc">${esc(t.desc)}</p>
      ${rows}
    </section>`;
  }).join('');
  $('#groups').innerHTML = html;

  buildHelp();
}

function buildHelp() {
  const h = TEXTS.help;
  $('#help-title').textContent = h.title;
  const lv = TEXTS.levels;
  $('#help-body').innerHTML = `
    <h3>${esc(h.stepsTitle)}</h3>
    <ol>${h.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
    <h3>${esc(h.diagramTitle)}</h3>
    <img src="assets/pallet-diagram.svg" alt="${esc(h.diagramAlt)}" width="360" height="470" loading="lazy">
    <h3>${esc(h.levelsTitle)}</h3>
    <dl>${['nhe', 'vua', 'nang', 'longDinh'].map((k) => `<dt>${esc(lv[k].name)}</dt><dd>${esc(lv[k].text)}</dd>`).join('')}</dl>
    <h3>${esc(h.rulesTitle)}</h3>
    <ul>${h.rules.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
    <h3>Ý nghĩa kết quả</h3>
    <dl>${[1, 2, 3, 4].map((n) => `<dt><span class="badge lv${n}">TH${n}</span> ${esc(TEXTS.results[n].meaning)}</dt><dd>${esc(TEXTS.results[n].action)}</dd>`).join('')}</dl>
    <h3>${esc(h.gaugeTitle)}</h3>
    <ol>${h.gauge.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
    <a class="btn btn-outline" href="assets/gauge-card.svg" target="_blank" rel="noopener">${esc(h.gaugeLink)}</a>
    <p class="privacy">${esc(h.privacy)}</p>`;
}

// ---------- Vẽ trạng thái ----------
function render() {
  // Công tắc mối mọt
  $('#moimot-no').setAttribute('aria-pressed', String(!state.moiMot));
  $('#moimot-yes').setAttribute('aria-pressed', String(state.moiMot));

  // Bộ đếm
  for (const [g, r] of Object.entries(RULES)) {
    const full = used(g) >= r.total;
    document.querySelectorAll(`#card-${g} .counter`).forEach((row) => {
      const k = row.dataset.k;
      const v = state[g][k];
      const out = row.querySelector('.val');
      out.textContent = v;
      out.classList.toggle('zero', v === 0);
      row.classList.toggle('has-value', v > 0);
      row.querySelector('[data-act="dec"]').disabled = v === 0;
      const inc = row.querySelector('[data-act="inc"]');
      inc.disabled = full;
      inc.title = full ? TEXTS.ui.full : '';
    });
  }

  let res;
  try {
    res = classify(state);
  } catch (e) {
    // Giao diện đã chặn dữ liệu sai; đây chỉ là phòng hờ
    console.error(e);
    showToast(e.message);
    return;
  }
  renderResult(res);

  // Rung nhẹ khi đổi loại kết quả hoặc trạng thái (chỉ khi người dùng đã chạm màn hình)
  const canVibrate = navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive);
  if (last && (last.level !== res.level || last.status !== res.status) && canVibrate) {
    navigator.vibrate(res.level === 4 ? [60, 40, 60] : 40);
  }
  last = res;
}

function renderResult(res) {
  const bar = $('#result');
  const R = TEXTS.results[res.level];
  bar.className = 'result';

  if (res.status === 'recheck') {
    bar.classList.add('recheck');
    const items = res.recheckGroups
      .map((x) => `${esc(TEXTS.groups[x.group].name)}: ${x.count} ${esc(TEXTS.groups[x.group].unit)}`)
      .join(' · ');
    bar.innerHTML = `
      <div class="result-inner">
        <p class="rc-title">${esc(TEXTS.recheck.title)}</p>
        <p class="rc-prov">${esc(TEXTS.recheck.provisional)}: <strong>${res.label}</strong> — ${esc(R.meaning)}</p>
        <p class="rc-list">${esc(TEXTS.recheck.listTitle)} ${items}</p>
        <div class="rc-actions">
          <button type="button" class="btn btn-warn" data-act="renailed">${esc(TEXTS.recheck.button)}</button>
          <button type="button" class="btn btn-light" data-act="details">${esc(TEXTS.ui.details)}</button>
        </div>
      </div>`;
  } else {
    bar.classList.add('lv' + res.level);
    bar.innerHTML = `
      <div class="result-inner res-row">
        <span class="res-label">${res.label}</span>
        <span class="res-meaning">${esc(R.meaning)}</span>
        <button type="button" class="btn btn-light" data-act="details">${esc(TEXTS.ui.details)}</button>
      </div>`;
  }
  bar._res = res;
  if ($('#dlg-details').open) fillDetails(res);
}

function fillDetails(res) {
  const R = TEXTS.results[res.level];
  const recheck = res.status === 'recheck';
  $('#details-title').textContent = recheck ? TEXTS.recheck.title : `${res.label} — ${R.meaning}`;
  const reasons = res.reasons.length
    ? `<ul>${res.reasons.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`
    : `<p>${esc(TEXTS.ui.noReasons)}</p>`;
  const rcList = recheck
    ? `<h3>${esc(TEXTS.recheck.listTitle)}</h3><ul>${res.recheckGroups.map((x) => `<li>${esc(TEXTS.groups[x.group].name)}: ${x.count} ${esc(TEXTS.groups[x.group].unit)}</li>`).join('')}</ul><p>${esc(TEXTS.recheck.reminder)}</p>`
    : '';
  $('#details-body').innerHTML = `
    <p>${recheck ? `<span class="badge recheck">CHƯA CHỐT</span> ${esc(TEXTS.recheck.provisional)}: ` : ''}<span class="badge lv${res.level}">${res.label}</span></p>
    <p><strong>${esc(R.meaning)}</strong></p>
    <h3>${esc(TEXTS.ui.actionTitle)}</h3>
    <p>${esc(recheck ? TEXTS.recheck.action : R.action)}</p>
    ${rcList}
    <h3>${esc(TEXTS.ui.reasonsTitle)}</h3>
    ${reasons}
    <p>${esc(TEXTS.ui.totalDamaged)}: <strong>${res.totalDamaged}</strong> / 26</p>`;
}

// ---------- Thông báo ----------
let toastTimer;
function showToast(msg, ms = 6000) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, ms);
}

// Giữ chỗ dưới cùng bằng chiều cao thanh kết quả
function trackBarHeight() {
  const bar = $('#result');
  const set = () => document.documentElement.style.setProperty('--bar-h', bar.offsetHeight + 'px');
  if ('ResizeObserver' in window) new ResizeObserver(set).observe(bar);
  else window.addEventListener('resize', set);
  set();
}

function openDialog(dlg) {
  if (typeof dlg.showModal === 'function') dlg.showModal();
  else dlg.setAttribute('open', '');
}

// ---------- Sự kiện ----------
function bind() {
  $('#moimot-no').addEventListener('click', () => { state.moiMot = false; render(); });
  $('#moimot-yes').addEventListener('click', () => { state.moiMot = true; render(); });

  $('#groups').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn || btn.disabled) return;
    const row = btn.closest('.counter');
    const { g, k } = row.dataset;
    if (btn.dataset.act === 'inc' && used(g) < RULES[g].total) state[g][k]++;
    if (btn.dataset.act === 'dec' && state[g][k] > 0) state[g][k]--;
    render();
  });

  $('#result').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    if (btn.dataset.act === 'details') {
      fillDetails($('#result')._res);
      openDialog($('#dlg-details'));
    }
    if (btn.dataset.act === 'renailed') {
      // Đã đóng lại đinh: xóa bung đinh, tính lại, nhắc nhập hỏng nặng nếu có thanh không đóng được
      for (const g of Object.keys(RULES)) if ('longDinh' in state[g]) state[g].longDinh = 0;
      render();
      showToast(TEXTS.recheck.reminder, 8000);
    }
  });

  $('#btn-reset').addEventListener('click', () => {
    if (isDirty() && !window.confirm(TEXTS.ui.confirmReset)) return;
    state = blank();
    last = null;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(TEXTS.ui.resetDone, 2500);
  });

  $('#btn-help').addEventListener('click', () => openDialog($('#dlg-help')));

  document.querySelectorAll('dialog').forEach((dlg) => {
    dlg.addEventListener('click', (e) => {
      // Bấm nút đóng hoặc bấm ra nền ngoài hộp
      if (e.target.closest('[data-close]') || e.target === dlg) dlg.close ? dlg.close() : dlg.removeAttribute('open');
    });
  });
}

// ---------- Service worker (offline) ----------
function registerSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('SW lỗi:', e));
  });
}

buildStatic();
bind();
render();
trackBarHeight();
registerSW();
