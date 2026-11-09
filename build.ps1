# binhdinh-power-outage — build C -> WebAssembly
# HTK · Hotline/Zalo: 0396241674 · Email: htk.contact@gmail.com · Cập nhật: 09/11/2026
# Yêu cầu: LLVM/clang (winget install LLVM.LLVM)

$env:PATH += ";C:\Program Files\LLVM\bin"
clang --target=wasm32 -nostdlib -Wl,--no-entry -Wl,--export-all -O2 -o public/outage.wasm c/outage.c
if ($LASTEXITCODE -eq 0) { Write-Host "OK: public/outage.wasm" } else { exit 1 }