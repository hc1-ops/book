# 카드 HTML을 1080x1350 PNG로 저장합니다.
# 사용법: .\render.ps1          (전체)
#         .\render.ps1 01 03    (해당 카드만)
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$d = $PSScriptRoot
$nums = $args
if (-not $nums) { $nums = Get-ChildItem "$d\card*.html" | ForEach-Object { $_.BaseName -replace 'card', '' } }
foreach ($n in $nums) {
  $n = "{0:D2}" -f [int]$n
  Start-Process -FilePath $edge -Wait -NoNewWindow -ArgumentList @(
    "--headless=new", "--disable-gpu", "--hide-scrollbars",
    "--force-device-scale-factor=1", "--window-size=1080,1350",
    "--virtual-time-budget=4000", "--user-data-dir=$env:TEMP\edge-card",
    "--screenshot=$d\out\card$n.png", "file:///$d/card$n.html?render") 2>$null
}
