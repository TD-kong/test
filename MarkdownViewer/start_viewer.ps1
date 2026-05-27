# ==========================================
# Markdown Viewer Launcher
# PlantUML Auto Start / Auto Stop
# ==========================================

$ErrorActionPreference = "SilentlyContinue"

# 設定
$port = 18080
$jarPath = Join-Path $PSScriptRoot "plantuml.jar"
$htmlPath = Join-Path $PSScriptRoot "index.html"

Write-Host "====================================="
Write-Host " Markdown Viewer Starting..."
Write-Host "====================================="

# ------------------------------
# PlantUML起動済み確認
# ------------------------------
$portUsed = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

$plantumlProcess = $null

if ($portUsed) {
    Write-Host "[INFO] PlantUML already running."
}
else {
    Write-Host "[INFO] Starting PlantUML server..."

    $plantumlProcess = Start-Process `
        -FilePath "javaw.exe" `
        -ArgumentList "-jar `"$jarPath`" -picoweb:$port" `
        -PassThru `
        -WindowStyle Hidden

    Start-Sleep -Seconds 2

    Write-Host "[OK] PlantUML started."
}

# ------------------------------
# ブラウザ起動
# ------------------------------
Write-Host "[INFO] Opening Markdown Viewer..."

$browser = Start-Process `
    -FilePath $htmlPath `
    -PassThru

Write-Host "[OK] Viewer launched."
Write-Host ""
Write-Host "Close browser to stop PlantUML."

# ------------------------------
# ブラウザ終了待ち
# ------------------------------
while (-not $browser.HasExited) {
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "[INFO] Browser closed."

# ------------------------------
# PlantUML停止
# ------------------------------
if ($plantumlProcess) {

    Write-Host "[INFO] Stopping PlantUML..."

    try {
        Stop-Process -Id $plantumlProcess.Id -Force
        Write-Host "[OK] PlantUML stopped."
    }
    catch {
        Write-Host "[WARN] PlantUML already stopped."
    }
}

Write-Host ""
Write-Host "Completed."
Start-Sleep -Seconds 2