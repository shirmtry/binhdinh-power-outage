/*
 * binhdinh-power-outage — Bản đồ mất điện sau bão Bình Định 2026
 * Tác giả: HTK · Hotline/Zalo: 0396241674 · Email: htk.contact@gmail.com
 * Cập nhật: 09/11/2026
 *
 * Pure arithmetic, no stdlib. Compiled to WebAssembly:
 *   clang --target=wasm32 -nostdlib -Wl,--no-entry -Wl,--export-all -O2 \
 *         -o public/outage.wasm c/outage.c
 *
 * Mô hình lan truyền mất điện: mỗi ngày sau bão, tỷ lệ mất điện còn lại
 * giảm theo hệ số phục hồi `decay` (0..1):
 *   remaining(d) = initial_down * (1 - decay)^d
 * Dữ liệu vào là "Dữ liệu mô phỏng – cập nhật 09/11/2026".
 */

/* Phần trăm hộ dân còn mất điện sau `days` ngày (0..100). */
int outage_percent(int initial_down, int days, double decay) {
  double rem;
  int d;
  if (initial_down < 0) initial_down = 0;
  if (initial_down > 100) initial_down = 100;
  if (days < 0) days = 0;
  if (days > 60) days = 60;
  if (decay < 0.0) decay = 0.0;
  if (decay > 1.0) decay = 1.0;
  rem = (double)initial_down;
  for (d = 0; d < days; d++) {
    rem = rem * (1.0 - decay);
  }
  return (int)(rem + 0.5);
}

/*
 * Cấp độ mất điện 0..4 — export chính theo đặc tả:
 *   0: Có điện (<=5% còn mất)   1: Nhẹ (<=25%)
 *   2: Trung bình (<=50%)       3: Nặng (<=75%)   4: Rất nặng (>75%)
 */
int outage_level(int initial_down, int days, double decay) {
  int p = outage_percent(initial_down, days, decay);
  if (p <= 5) return 0;
  if (p <= 25) return 1;
  if (p <= 50) return 2;
  if (p <= 75) return 3;
  return 4;
}

/*
 * Số ngày ước tính để khôi phục (còn <=5% mất điện), tối đa 60.
 * Trả về -1 nếu decay <= 0 (không thể phục hồi theo mô hình).
 */
int days_to_restore(int initial_down, double decay) {
  double rem;
  int d;
  if (initial_down < 0) initial_down = 0;
  if (initial_down > 100) initial_down = 100;
  if (decay <= 0.0) return -1;
  if (decay > 1.0) decay = 1.0;
  rem = (double)initial_down;
  for (d = 0; d <= 60; d++) {
    if (rem <= 5.0) return d;
    rem = rem * (1.0 - decay);
  }
  return 60;
}