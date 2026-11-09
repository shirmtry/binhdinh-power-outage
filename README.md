# ⚡ binhdinh-power-outage — Bản đồ mất điện Bình Định sau bão 2026

**C → WebAssembly** · Tác giả: **HTK** · Cập nhật: 09/11/2026

🌐 **Deploy:** https://binhdinh-power-outage.vercel.app

## Vấn đề (mùa mưa lũ 2026)

Bão số 9, số 10 tháng 10–11/2026 đổ bộ Quy Nhơn – Phù Cát – Hoài Nhơn, lũ sông Kôn
nhấn chìm Tuy Phước – An Nhơn, sạt lở An Lão – Vĩnh Thạnh – Tây Sơn khiến Bình Định
**mất điện diện rộng 3–7 ngày**. Dự án mô phỏng lan truyền và phục hồi mất điện
trên 11 huyện/thị xã/thành phố: Quy Nhơn, An Nhơn, Tuy Phước, Phù Cát, Phù Mỹ,
Hoài Nhơn, Hoài Ân, Vĩnh Thạnh, Tây Sơn, An Lão, Vân Canh.

> **Dữ liệu mô phỏng – cập nhật 09/11/2026** — không phải số liệu chính thức của ngành điện.

## Tính năng

- Hàm C thuần số học (không stdlib) biên dịch sang WASM:
  - `int outage_level(int initial_down, int days, double decay)` → cấp độ 0–4
  - `int outage_percent(int initial_down, int days, double decay)` → % còn mất điện
  - `int days_to_restore(int initial_down, double decay)` → số ngày ước tính khôi phục
- Mô hình: `remaining(d) = initial_down × (1 − decay)^d`
- JS nạp `outage.wasm` bằng `fetch` + `WebAssembly.instantiate`, gọi cho từng huyện
- Bản đồ SVG cách điệu 11 huyện tô màu theo 5 cấp độ + bảng chi tiết
- Điều khiển: slider số ngày sau bão (0–10), input tốc độ phục hồi (decay 0–0.9)
- Trang chủ, About, 404 tiếng Việt; responsive 375px → 1440px

## Công nghệ

- C (clang 23, `--target=wasm32 -nostdlib`) → WebAssembly
- Vanilla JS + SVG + CSS, site tĩnh trên Vercel (`outputDirectory: public`)

## Cách chạy local

```powershell
# Build WASM (cần LLVM/clang)
./build.ps1
# hoặc:
clang --target=wasm32 -nostdlib -Wl,--no-entry -Wl,--export-all -O2 -o public/outage.wasm c/outage.c

# Serve tĩnh
npx serve public -l 3100
# Mở http://localhost:3100
```

## Cấu trúc

```
c/outage.c          # logic C thuần số học
public/index.html   # trang chủ + bản đồ
public/about.html   # giới thiệu + liên hệ HTK
public/404.html     # trang 404 có hotline
public/app.js       # nạp WASM, render SVG
public/style.css
public/outage.wasm  # build output (commit để deploy tĩnh)
build.ps1
vercel.json
```

## 📞 Liên hệ HTK – 0396241674 – 09/11/2026

- Hotline/Zalo: **0396241674** — https://zalo.me/0396241674
- Email: **htk.contact@gmail.com**
- © 2026 HTK · Mùa mưa lũ 2026 · Cập nhật: 09/11/2026