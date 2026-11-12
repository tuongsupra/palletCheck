// Kiểm thử giao diện qua Chrome DevTools Protocol (không cần thư viện ngoài).
// Chạy: node e2e.mjs  (cần server http://localhost:8080 đang chạy)
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.argv[2] || '.';
const PORT = 9333;
const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'pc-'))}`, 'about:blank'], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); break; } catch { await sleep(200); }
}
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pending = new Map(); const events = [];
ws.addEventListener('message', (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  else if (d.method) events.push(d);
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
  return r.result.result.value;
};
const shot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, name), Buffer.from(r.result.data, 'base64'));
};

await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');

const CASES = [
  [1, {}, 'TH1', 'final'], [2, { 'mat-nang': 1 }, 'TH2', 'final'], [3, { 'mat-nang': 3 }, 'TH2', 'final'],
  [4, { 'mat-nang': 4 }, 'TH3', 'final'], [5, { 'mat-nang': 5 }, 'TH3', 'final'], [6, { 'mat-nang': 6 }, 'TH4', 'final'],
  [7, { 'ganh-vua': 1 }, 'TH2', 'final'], [8, { 'ganh-nang': 1 }, 'TH3', 'final'], [9, { 'ganh-nang': 2 }, 'TH4', 'final'],
  [10, { 'gu-nang': 1 }, 'TH2', 'final'], [11, { 'gu-nang': 2 }, 'TH3', 'final'], [12, { 'gu-nang': 3 }, 'TH3', 'final'],
  [13, { 'gu-nang': 4 }, 'TH4', 'final'], [14, { 'day-nang': 3 }, 'TH2', 'final'], [15, { 'day-nang': 4 }, 'TH3', 'final'],
  [16, { 'day-nang': 5 }, 'TH4', 'final'],
  [18, { 'mat-vua': 2, 'gu-vua': 1 }, 'TH2', 'final'], [19, { 'mat-nang': 3, 'day-nang': 3 }, 'TH2', 'final'],
  [20, { 'mat-nang': 3, 'gu-nang': 1, 'day-nang': 3 }, 'TH4', 'final'], [21, { 'mat-vua': 4, 'gu-vua': 3 }, 'TH4', 'final'],
  [22, { 'mat-nang': 4, 'gu-nang': 1 }, 'TH3', 'final'],
  [27, { 'mat-longDinh': 2 }, 'TH1', 'recheck'], [28, { 'ganh-longDinh': 1 }, 'TH1', 'recheck'],
  [29, { 'mat-nang': 6, 'day-longDinh': 1 }, 'TH4', 'final'],
  [31, { 'mat-longDinh': 3, 'gu-nang': 2 }, 'TH3', 'recheck'], [34, { 'mat-vua': 1, 'mat-longDinh': 1 }, 'TH2', 'recheck'],
  [35, { 'mat-nang': 3, 'mat-longDinh': 2, 'day-nang': 3 }, 'TH2', 'recheck'], [36, { 'mat-longDinh': 9 }, 'TH1', 'recheck'],
];

// Hàm trong trang: đặt lại rồi bấm nút theo ca
const HELPERS = `
window.confirm = () => true;
window.__reset = () => document.querySelector('#btn-reset').click();
window.__set = (spec) => {
  __reset();
  for (const [key, n] of Object.entries(spec)) {
    const [g, k] = key.split('-');
    const inc = document.querySelector('.counter[data-g="'+g+'"][data-k="'+k+'"] [data-act=inc]');
    for (let i = 0; i < n; i++) inc.click();
  }
  const bar = document.querySelector('#result');
  const recheck = bar.classList.contains('recheck');
  const label = recheck ? bar.querySelector('.rc-prov strong').textContent : bar.querySelector('.res-label').textContent;
  return { label, status: recheck ? 'recheck' : 'final', text: bar.innerText };
};`;

let fail = 0;
for (const [w, h] of [[360, 640], [412, 915]]) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await send('Page.navigate', { url: 'http://localhost:8080/' });
  await sleep(1500);
  await evalJs(HELPERS);
  console.log(`\n=== Viewport ${w}x${h} ===`);
  const vw = await evalJs('[innerWidth, document.documentElement.scrollWidth]');
  console.log('innerWidth / scrollWidth:', vw, vw[1] > vw[0] ? 'CUỘN NGANG!' : 'OK');
  await shot(`ui-${w}-initial.png`);

  for (const [no, spec, lab, st] of CASES) {
    const r = await evalJs(`__set(${JSON.stringify(spec)})`);
    const ok = r.label === lab && r.status === st;
    if (!ok) { fail++; console.log(`ca ${no}: SAI → ${r.label}/${r.status}, mong đợi ${lab}/${st}`); }
  }
  console.log(`36 ca (trừ 5 ca lỗi nhập): ${CASES.length} ca đã chạy qua UI`);

  // Ca lỗi: nút + bị vô hiệu khi đạt tổng nhóm
  const lim = await evalJs(`(() => {
    __reset();
    const q = (g,k) => document.querySelector('.counter[data-g="'+g+'"][data-k="'+k+'"] [data-act=inc]');
    for (let i=0;i<5;i++) q('mat','vua').click();
    for (let i=0;i<10;i++) q('mat','nang').click();
    const nang = +document.querySelector('#mat-nang-val').textContent;
    const dis = q('mat','nang').disabled && q('mat','longDinh').disabled && q('mat','vua').disabled;
    const gu = document.querySelector('.counter[data-g="gu"][data-k="longDinh"]');
    const dec = document.querySelector('.counter[data-g="day"][data-k="vua"] [data-act=dec]').disabled;
    return { nang, dis, guNoLongDinh: !gu, decDisabledAt0: dec };
  })()`);
  console.log('chặn vượt tổng (ca 23/33):', JSON.stringify(lim), lim.nang === 4 && lim.dis && lim.guNoLongDinh && lim.decDisabledAt0 ? 'OK' : 'SAI');
  if (!(lim.nang === 4 && lim.dis && lim.guNoLongDinh)) fail++;

  // Kích thước nút và cỡ chữ
  const sizes = await evalJs(`(() => {
    const small = [...document.querySelectorAll('button')].filter(b => b.offsetParent && (b.offsetWidth < 48 || b.offsetHeight < 48)).map(b => b.textContent.trim()+':'+b.offsetWidth+'x'+b.offsetHeight);
    const fonts = [...document.querySelectorAll('main *, header *, #result *')].filter(e => e.offsetParent && e.childNodes.length && [...e.childNodes].some(n => n.nodeType===3 && n.textContent.trim())).map(e => parseFloat(getComputedStyle(e).fontSize));
    return { small, minFont: Math.min(...fonts) };
  })()`);
  console.log('nút < 48px:', sizes.small.length ? sizes.small : 'không có', '| cỡ chữ nhỏ nhất:', sizes.minFont + 'px');

  // Luồng recheck: bung đinh → đóng lại → kiểm lại
  const r1 = await evalJs(`__set({'mat-longDinh':2,'gu-nang':2})`);
  await shot(`ui-${w}-recheck.png`);
  const r2 = await evalJs(`(() => {
    document.querySelector('[data-act=renailed]').click();
    const bar = document.querySelector('#result');
    return { cls: bar.className, label: bar.querySelector('.res-label')?.textContent, toast: document.querySelector('#toast').hidden ? '' : document.querySelector('#toast').textContent, mat: document.querySelector('#mat-longDinh-val').textContent };
  })()`);
  console.log('recheck:', r1.status, r1.label, '→ sau "Đã đóng lại":', JSON.stringify(r2));
  if (!(r1.status === 'recheck' && r2.label === 'TH3' && r2.mat === '0' && r2.toast)) fail++;
  await shot(`ui-${w}-after-renail.png`);

  const sw2 = await evalJs('[innerWidth, document.documentElement.scrollWidth]');
  console.log('cuộn ngang ở trạng thái recheck:', sw2[1] > sw2[0] ? 'CÓ!' : 'không');

  // Chi tiết & Đề xuất sửa chữa trong dialog
  await evalJs(`__set({'mat-nang':4,'gu-vua':1}); document.querySelector('#result [data-act=details]').click();`);
  await sleep(200);
  await shot(`ui-${w}-details.png`);
  console.log('chi tiết trong dialog:', (await evalJs(`document.querySelector('#details-body').innerText`)).replace(/\n+/g, ' | '));
  await evalJs(`document.querySelector('#dlg-details').close()`);

  // Test case tổng 7 (ví dụ của người dùng: TH4 -> sửa 1 thanh về TH2)
  await evalJs(`__set({'mat-nang':3,'gu-nang':1,'day-nang':3}); document.querySelector('#result [data-act=details]').click();`);
  await sleep(300);
  await shot(`ui-${w}-total7-repair.png`);
  console.log('đề xuất sửa chữa case tổng 7:', (await evalJs(`document.querySelector('.repair-box').innerText`)).replace(/\n+/g, ' | '));
  await evalJs(`document.querySelector('#dlg-details').close(); document.querySelector('#btn-help').click()`);
  await sleep(500);
  await shot(`ui-${w}-help.png`);
  await evalJs(`document.querySelector('#dlg-help').close(); __set({'mat-nang': 6})`);
  await shot(`ui-${w}-th4.png`);
}

// Service worker / offline
await send('Emulation.clearDeviceMetricsOverride');
await send('Page.navigate', { url: 'http://localhost:8080/' });
await sleep(2500);
const swState = await evalJs(`navigator.serviceWorker.ready.then(r => r.active && r.active.state)`);
const cached = await evalJs(`caches.keys().then(async ks => { const c = await caches.open(ks[0]); return [ks, (await c.keys()).length]; })`);
console.log('\nSW:', swState, '| cache:', JSON.stringify(cached));
await send('Network.enable');
await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
await send('Page.reload', { ignoreCache: false });
await sleep(1500);
const off = await evalJs(`(() => { const b = document.querySelector('#result'); return b ? b.innerText.split('\\n')[0] : 'KHÔNG TẢI ĐƯỢC'; })()`);
console.log('offline reload:', off);
if (!off.startsWith('TH1')) fail++;

const errs = events.filter((e) => e.method === 'Runtime.exceptionThrown' || (e.method === 'Log.entryAdded' && e.params.entry.level === 'error'));
console.log('lỗi console:', errs.length ? errs.map((e) => JSON.stringify(e.params).slice(0, 200)) : 'không có');

console.log(fail ? `\nTHẤT BẠI: ${fail}` : '\nTẤT CẢ ĐẠT');
ws.close(); proc.kill();
process.exit(fail ? 1 : 0);
