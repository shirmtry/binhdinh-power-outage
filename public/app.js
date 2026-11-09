/*
 * binhdinh-power-outage — HTK · 0396241674 · htk.contact@gmail.com
 * Cập nhật: 09/11/2026. Dữ liệu mô phỏng – cập nhật 09/11/2026.
 * Nạp C WebAssembly (outage.wasm), gọi outage_level cho 11 huyện/thị xã,
 * tô màu bản đồ SVG theo cấp độ mất điện sau bão 2026.
 */
'use strict';

// Dữ liệu mô phỏng – cập nhật 09/11/2026 (bão số 9, 10/2026 + lũ sông Kôn + sạt lở)
const DISTRICTS = [
  { name: 'An Lão',     initial: 70, note: 'Sạt lở vùng núi',      points: '60,40 240,30 260,150 90,170',                 label: [150, 100] },
  { name: 'Hoài Ân',    initial: 55, note: 'Lũ thượng sông Kôn',    points: '240,30 400,50 390,180 260,150',               label: [322, 108] },
  { name: 'Hoài Nhơn',  initial: 88, note: 'Bão đổ bộ trực tiếp',  points: '400,50 520,80 530,230 390,180',               label: [458, 140] },
  { name: 'Vĩnh Thạnh', initial: 72, note: 'Sạt lở, lưới điện núi',points: '40,180 260,150 250,330 60,340',               label: [150, 255] },
  { name: 'Phù Mỹ',     initial: 65, note: 'Bão + gió giật',       points: '260,150 390,180 530,230 520,360 280,330',     label: [398, 260] },
  { name: 'Tây Sơn',    initial: 68, note: 'Sạt lở, cây đổ',       points: '60,340 250,330 240,450 90,470',               label: [158, 398] },
  { name: 'Phù Cát',    initial: 90, note: 'Bão đổ bộ trực tiếp',  points: '280,330 520,360 510,470 270,460',             label: [392, 405] },
  { name: 'An Nhơn',    initial: 78, note: 'Lũ sông Kôn',          points: '240,450 270,460 430,480 420,560 230,560',     label: [325, 512] },
  { name: 'Tuy Phước',  initial: 80, note: 'Lũ sông Kôn',          points: '430,480 510,470 500,580 420,560',             label: [464, 528] },
  { name: 'Quy Nhơn',   initial: 95, note: 'Ngập úng đô thị',      points: '420,560 500,580 520,700 380,700 360,600',     label: [444, 640] },
  { name: 'Vân Canh',   initial: 50, note: 'Sự cố tuyến núi',      points: '90,470 230,560 360,600 380,700 150,700 80,590', label: [220, 625] }
];

const LEVELS = [
  { color: '#2e9e5b', label: 'Cấp 0 — Có điện (≤5% còn mất)' },
  { color: '#f2c53d', label: 'Cấp 1 — Nhẹ (≤25%)' },
  { color: '#ef8f2f', label: 'Cấp 2 — Trung bình (≤50%)' },
  { color: '#d94a3d', label: 'Cấp 3 — Nặng (≤75%)' },
  { color: '#8b1e2d', label: 'Cấp 4 — Rất nặng (>75%)' }
];
const LEVEL_NAMES = ['Có điện', 'Nhẹ', 'Trung bình', 'Nặng', 'Rất nặng'];

const SVG_NS = 'http://www.w3.org/2000/svg';
const $ = (sel) => document.querySelector(sel);

function buildMapSkeleton() {
  const svg = $('#map');
  DISTRICTS.forEach((d, i) => {
    const poly = document.createElementNS(SVG_NS, 'polygon');
    poly.setAttribute('points', d.points);
    poly.setAttribute('id', 'district-' + i);
    poly.setAttribute('fill', '#c8d6e5');
    svg.appendChild(poly);

    const t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('x', d.label[0]);
    t.setAttribute('y', d.label[1]);
    t.setAttribute('text-anchor', 'middle');
    t.textContent = d.name;
    svg.appendChild(t);

    const p = document.createElementNS(SVG_NS, 'text');
    p.setAttribute('x', d.label[0]);
    p.setAttribute('y', d.label[1] + 18);
    p.setAttribute('text-anchor', 'middle');
    p.setAttribute('class', 'pct');
    p.setAttribute('id', 'pct-' + i);
    p.textContent = '…';
    svg.appendChild(p);
  });

  const legend = $('#legend-list');
  LEVELS.forEach((lv) => {
    const li = document.createElement('li');
    const sw = document.createElement('span');
    sw.className = 'swatch';
    sw.style.background = lv.color;
    li.appendChild(sw);
    li.appendChild(document.createTextNode(lv.label));
    legend.appendChild(li);
  });
}

function render(exportsObj) {
  const days = Math.max(0, Math.min(10, parseInt($('#days').value, 10) || 0));
  let decay = parseFloat($('#decay').value);
  if (!isFinite(decay)) decay = 0.3;
  decay = Math.max(0, Math.min(0.9, decay));
  $('#days-value').textContent = String(days);
  $('#decay-value').textContent = decay.toFixed(2);

  const tbody = $('#result-table tbody');
  tbody.innerHTML = '';

  DISTRICTS.forEach((d, i) => {
    const level = exportsObj.outage_level(d.initial, days, decay);
    const pct = exportsObj.outage_percent(d.initial, days, decay);
    const restore = exportsObj.days_to_restore(d.initial, decay);

    const poly = $('#district-' + i);
    poly.setAttribute('fill', LEVELS[level].color);
    poly.setAttribute('aria-label', d.name + ': ' + LEVEL_NAMES[level]);
    $('#pct-' + i).textContent = pct + '% mất điện';

    const tr = document.createElement('tr');
    const restoreText = restore < 0 ? 'Không xác định' : (restore === 0 ? 'Đã khôi phục' : '~' + restore + ' ngày');
    tr.innerHTML =
      '<td><strong>' + d.name + '</strong><br><small>' + d.note + '</small></td>' +
      '<td>' + d.initial + '%</td>' +
      '<td>' + pct + '%</td>' +
      '<td><span class="badge" style="background:' + LEVELS[level].color + '">' + LEVEL_NAMES[level] + '</span></td>' +
      '<td>' + restoreText + '</td>';
    tbody.appendChild(tr);
  });
}

async function main() {
  buildMapSkeleton();
  const status = $('#wasm-status');
  try {
    const res = await fetch('outage.wasm');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const bytes = await res.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(bytes);
    const ex = instance.exports;
    if (typeof ex.outage_level !== 'function') throw new Error('Thiếu export outage_level');
    status.textContent = '✅ WebAssembly (C) đã nạp — tính toán chạy hoàn toàn trong trình duyệt.';
    status.className = 'status ok';
    const update = () => render(ex);
    $('#days').addEventListener('input', update);
    $('#decay').addEventListener('input', update);
    $('#btn-run').addEventListener('click', update);
    update();
  } catch (err) {
    status.textContent = '❌ Không nạp được outage.wasm: ' + err.message;
    status.className = 'status err';
  }
}

main();