// Gắn giao diện với classify(). Không lưu gì: tải lại trang là bắt đầu lại.
import { classify } from './classify.js';
import { RULES, TOTAL_TH4 } from './rules.js';
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
  Object.keys(RULES).some((g) => used(g) > 0);

// Thoát ký tự HTML khi chèn chuỗi
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- Dựng giao diện tĩnh ----------
function buildStatic() {
  $('#app-name').textContent = TEXTS.appName;
  $('#app-sub').textContent = TEXTS.appSubtitle;
  $('#btn-help').setAttribute('aria-label', TEXTS.ui.help);
  $('#btn-reset').textContent = TEXTS.ui.newPallet;
  $('#privacy').textContent = TEXTS.help.privacy;
  document.querySelectorAll('[data-close]').forEach((b) => b.setAttribute('aria-label', TEXTS.ui.close));

  // 4 thẻ nhóm gọn gàng
  const html = Object.entries(RULES).map(([g, r]) => {
    const t = TEXTS.groups[g];
    const keys = r.canRenail ? KEYS : ['vua', 'nang'];
    const rows = keys.map((k) => {
      const id = `${g}-${k}`;
      return `
      <div class="counter" data-g="${g}" data-k="${k}">
        <div class="info">
          <span class="name" id="${id}-name">${esc(TEXTS.counters[k])}</span>
          <span class="hint" id="${id}-hint">${esc(TEXTS.shortHints[g][k])}</span>
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
        <div class="head-left">
          <span class="swatch sw-${g}" aria-hidden="true"></span>
          <h2 id="h-${g}">${esc(t.name)} <span class="total">(${r.total} thanh)</span></h2>
        </div>
        <div class="head-right" id="badge-${g}"></div>
      </div>
      <div class="counters-wrap">
        ${rows}
      </div>
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

// Xây dựng danh sách giải thích chi tiết nguyên nhân
function buildExplanations(res) {
  if (res.level === 1) {
    return ['Pallet đạt chuẩn sử dụng: Không có cấu kiện sứt lớn hoặc hỏng nặng.'];
  }

  const list = [];

  for (const [g, r] of Object.entries(RULES)) {
    const { vua = 0, nang = 0 } = state[g];
    const name = TEXTS.groups[g].name;
    const unit = TEXTS.groups[g].unit;

    if (nang > 0) {
      if (nang >= r.th4) {
        list.push(`<strong>${esc(name)}</strong> hỏng nặng: <strong>${nang} ${esc(unit)}</strong> (vượt ngưỡng TH4: ≥ ${r.th4} ${esc(unit)})`);
      } else if (nang >= r.th3) {
        const range = r.th4 - 1 > r.th3 ? `${r.th3}–${r.th4 - 1}` : `${r.th3}`;
        list.push(`<strong>${esc(name)}</strong> hỏng nặng: <strong>${nang} ${esc(unit)}</strong> (thuộc ngưỡng TH3: ${range} ${esc(unit)})`);
      } else if (nang >= r.th2) {
        const range = r.th3 - 1 > r.th2 ? `${r.th2}–${r.th3 - 1}` : `${r.th2}`;
        list.push(`<strong>${esc(name)}</strong> hỏng nặng: <strong>${nang} ${esc(unit)}</strong> (thuộc ngưỡng TH2: ${range} ${esc(unit)})`);
      }
    }

    if (vua > 0) {
      const ruleHint = g === 'gu' ? 'sâu ≥20mm hoặc rộng ≥1/3 mặt' : 'sâu ≥25mm hoặc dài ≥300mm';
      list.push(`<strong>${esc(name)}</strong> sứt lớn: <strong>${vua} ${esc(unit)}</strong> (${ruleHint} → quy định tối thiểu TH2)`);
    }
  }

  if (res.totalDamaged >= TOTAL_TH4) {
    list.push(`Tổng cấu kiện sứt lớn + hỏng nặng: <strong>${res.totalDamaged}/26 thanh</strong> (≥ 7 thanh, chiếm từ 25% pallet → nâng lên TH4)`);
  }

  return list;
}

// Tính toán đề xuất sửa 1-2 chi tiết để đưa về trạng thái tốt hơn
function buildRepairSuggestions(state, currentRes) {
  if (currentRes.level <= 1) {
    return ['Pallet đã đạt chuẩn TH1 (sẵn sàng sử dụng), không cần sửa chữa cấu kiện.'];
  }

  const currentLevel = currentRes.level;
  const repairable = [];

  for (const [g, r] of Object.entries(RULES)) {
    if (state[g].nang > 0) {
      repairable.push({ group: g, type: 'nang', count: state[g].nang, label: r.label, unit: TEXTS.groups[g].unit });
    }
    if (state[g].vua > 0) {
      repairable.push({ group: g, type: 'vua', count: state[g].vua, label: r.label, unit: TEXTS.groups[g].unit });
    }
  }

  if (repairable.length === 0) return [];

  const clone = (s) => JSON.parse(JSON.stringify(s));
  const fixes1 = [];
  const fixes2 = [];

  // 1. Thử sửa 1 cấu kiện
  for (const it of repairable) {
    const next = clone(state);
    next[it.group][it.type]--;
    const r = classify(next);
    if (r.level < currentLevel) {
      fixes1.push({
        group: it.group,
        type: it.type,
        label: it.label,
        targetLevel: r.level,
        targetLabel: r.label,
        action: it.type === 'nang' ? `thay 1 ${it.label}` : `sửa 1 ${it.label} sứt lớn`,
      });
    }
  }

  // 2. Thử sửa 2 cấu kiện (chỉ quan tâm nếu tốt hơn kết quả của sửa 1 hoặc khi chưa sửa 1 được)
  const bestLevel1 = fixes1.length ? Math.min(...fixes1.map(f => f.targetLevel)) : currentLevel;
  for (let i = 0; i < repairable.length; i++) {
    for (let j = i; j < repairable.length; j++) {
      const it1 = repairable[i], it2 = repairable[j];
      if (i === j && it1.count < 2) continue;
      const next = clone(state);
      next[it1.group][it1.type]--;
      next[it2.group][it2.type]--;
      const r = classify(next);

      if (r.level < bestLevel1 || (fixes1.length === 0 && r.level < currentLevel)) {
        const desc = i === j
          ? (it1.type === 'nang' ? `thay 2 ${it1.label}` : `sửa 2 ${it1.label} sứt lớn`)
          : (it1.type === 'nang' ? `thay 1 ${it1.label}` : `sửa 1 ${it1.label}`) + ' và ' + (it2.type === 'nang' ? `thay 1 ${it2.label}` : `sửa 1 ${it2.label}`);
        fixes2.push({
          targetLevel: r.level,
          targetLabel: r.label,
          desc,
        });
      }
    }
  }

  const suggestions = [];

  // Gom nhóm gợi ý 1 chi tiết
  const grouped1 = {};
  for (const f of fixes1) {
    if (!grouped1[f.targetLabel]) grouped1[f.targetLabel] = [];
    grouped1[f.targetLabel].push(f.action);
  }
  for (const [targetLabel, actions] of Object.entries(grouped1)) {
    const text = actions.join(' <em>HOẶC</em> ');
    suggestions.push(`<strong>Sửa 1 chi tiết để lên ${targetLabel}:</strong> ${text}.`);
  }

  // Gom nhóm gợi ý 2 chi tiết
  const grouped2 = {};
  for (const f of fixes2) {
    if (!grouped2[f.targetLabel]) grouped2[f.targetLabel] = new Set();
    grouped2[f.targetLabel].add(f.desc);
  }
  for (const [targetLabel, descSet] of Object.entries(grouped2)) {
    const text = Array.from(descSet).slice(0, 3).join('; ');
    suggestions.push(`<strong>Sửa 2 chi tiết để lên ${targetLabel}:</strong> ${text}.`);
  }

  // Nếu không thể về TH2 hay TH1 chỉ với 1-2 sửa chữa: tính số lượng tối thiểu để về TH2/TH1
  if (suggestions.length === 0) {
    // Tìm cấu kiện hư hỏng nặng nhất
    suggestions.push(`Hư hỏng quá nhiều cấu kiện, cần thay thế toàn diện các cấu kiện hỏng nặng để hạ cấp về TH2.`);
  }

  return suggestions;
}

// ---------- Vẽ trạng thái ----------
function render() {
  for (const [g, r] of Object.entries(RULES)) {
    const full = used(g) >= r.total;
    const { vua = 0, nang = 0, longDinh = 0 } = state[g];

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

    const bg = $(`#badge-${g}`);
    if (bg) {
      if (nang >= r.th4) bg.innerHTML = `<span class="grp-badge lv4">TH4 (${nang} hỏng)</span>`;
      else if (nang >= r.th3) bg.innerHTML = `<span class="grp-badge lv3">TH3 (${nang} hỏng)</span>`;
      else if (nang >= r.th2) bg.innerHTML = `<span class="grp-badge lv2">TH2 (${nang} hỏng)</span>`;
      else if (vua > 0) bg.innerHTML = `<span class="grp-badge lv2">TH2 (${vua} sứt)</span>`;
      else if (longDinh > 0) bg.innerHTML = `<span class="grp-badge warn">${longDinh} bung đinh</span>`;
      else bg.innerHTML = '';
    }
  }

  let res;
  try {
    res = classify(state);
  } catch (e) {
    console.error(e);
    showToast(e.message);
    return;
  }
  renderResult(res);

  const canVibrate = navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive);
  if (last && (last.level !== res.level || last.status !== res.status) && canVibrate) {
    navigator.vibrate(res.level === 4 ? [60, 40, 60] : 40);
  }
  last = res;
}

// Hiển thị thanh kết quả dính đáy (Gọn gàng giống cũ)
function renderResult(res) {
  const bar = $('#result');
  const R = TEXTS.results[res.level];
  bar.className = 'result';

  if (res.status === 'recheck') {
    bar.classList.add('recheck');
    const items = res.recheckGroups
      .map((x) => `${esc(TEXTS.groups[x.group].name)} (${x.count})`)
      .join(', ');

    bar.innerHTML = `
      <div class="result-inner res-recheck-wrap">
        <div class="res-row">
          <div class="res-left" data-act="details">
            <span class="res-badge res-label recheck">CHƯA CHỐT</span>
            <div class="res-text">
              <span class="res-meaning">${esc(TEXTS.recheck.title)}</span>
              <span class="res-sub rc-prov">Tạm tính: <strong>${res.label}</strong> · ${items}</span>
            </div>
          </div>
          <div class="res-right">
            <button type="button" class="btn btn-light btn-sm" data-act="details">${esc(TEXTS.ui.details)}</button>
          </div>
        </div>
        <div class="res-recheck-action">
          <button type="button" class="btn btn-warn wide" data-act="renailed">🔨 ${esc(TEXTS.recheck.button)}</button>
        </div>
      </div>`;
  } else {
    bar.classList.add('lv' + res.level);

    bar.innerHTML = `
      <div class="result-inner res-row">
        <div class="res-left" data-act="details">
          <span class="res-badge res-label lv${res.level}">${res.label}</span>
          <div class="res-text">
            <span class="res-meaning">${esc(R.meaning)}</span>
            <span class="res-sub">Hư hỏng: <strong>${res.totalDamaged}/26</strong> thanh</span>
          </div>
        </div>
        <div class="res-right">
          <button type="button" class="btn btn-light btn-sm" data-act="details">${esc(TEXTS.ui.details)}</button>
        </div>
      </div>`;
  }
  bar._res = res;
  if ($('#dlg-details').open) fillDetails(res);
}

// Điền nội dung hộp thoại chi tiết kết quả & đề xuất sửa chữa
function fillDetails(res) {
  const R = TEXTS.results[res.level];
  const recheck = res.status === 'recheck';
  $('#details-title').textContent = recheck ? TEXTS.recheck.title : `${res.label} — ${R.meaning}`;

  const explanations = buildExplanations(res);
  const repairSuggestions = buildRepairSuggestions(state, res);

  const recheckSection = recheck
    ? `<div class="dlg-section dlg-box-warn">
        <h4>⚠️ Cần đóng lại đinh trước khi chốt:</h4>
        <ul class="dlg-list">
          ${res.recheckGroups.map((x) => `<li><strong>${esc(TEXTS.groups[x.group].name)}</strong>: ${x.count} ${esc(TEXTS.groups[x.group].unit)}</li>`).join('')}
        </ul>
        <p style="margin: 6px 0 0; font-size: 0.8125rem;">${esc(TEXTS.recheck.reminder)}</p>
      </div>`
    : '';

  const repairSection = repairSuggestions && repairSuggestions.length
    ? `<div class="dlg-section repair-box">
        <h4>💡 Đề xuất sửa chữa để nâng cấp pallet:</h4>
        <ul class="repair-list">
          ${repairSuggestions.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>`
    : '';

  $('#details-body').innerHTML = `
    <div class="dlg-status-banner lv${res.level} ${recheck ? 'recheck' : ''}">
      <span class="dlg-badge">${recheck ? 'CHƯA CHỐT' : res.label}</span>
      <div class="dlg-status-info">
        <h3>${esc(recheck ? 'Tạm tính: ' + res.label + ' — ' + R.meaning : R.meaning)}</h3>
        <p>Tổng cấu kiện hư hỏng: <strong>${res.totalDamaged}/26</strong> thanh</p>
      </div>
    </div>

    ${recheckSection}

    <div class="dlg-section">
      <h4>📌 Nguyên nhân xếp loại ${res.label}:</h4>
      <ul class="dlg-list">
        ${explanations.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>

    ${repairSection}

    <div class="dlg-section">
      <h4>👉 Hành động khuyến nghị:</h4>
      <p class="dlg-action-text">${esc(recheck ? TEXTS.recheck.action : R.action)}</p>
    </div>

    <button type="button" class="btn btn-outline wide" data-close style="margin-top: 12px;">Đóng</button>
  `;
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

// Đặt lại dữ liệu pallet
function resetPallet() {
  if (isDirty() && !window.confirm(TEXTS.ui.confirmReset)) return;
  state = blank();
  last = null;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast(TEXTS.ui.resetDone, 2500);
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
    const target = e.target;
    const actBtn = target.closest('[data-act]');
    if (actBtn) {
      if (actBtn.dataset.act === 'details') {
        fillDetails($('#result')._res);
        openDialog($('#dlg-details'));
      }
      if (actBtn.dataset.act === 'renailed') {
        for (const g of Object.keys(RULES)) if ('longDinh' in state[g]) state[g].longDinh = 0;
        render();
        showToast(TEXTS.recheck.reminder, 8000);
      }
      return;
    }
    // Bấm vào vùng thanh kết quả cũng mở chi tiết
    fillDetails($('#result')._res);
    openDialog($('#dlg-details'));
  });

  $('#btn-reset').addEventListener('click', resetPallet);
  const quickReset = $('#btn-quick-reset');
  if (quickReset) quickReset.addEventListener('click', resetPallet);

  $('#btn-help').addEventListener('click', () => openDialog($('#dlg-help')));

  document.querySelectorAll('dialog').forEach((dlg) => {
    dlg.addEventListener('click', (e) => {
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
