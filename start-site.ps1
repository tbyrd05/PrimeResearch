$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host 'Building site...'
npm run build

$existing = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if ($existing) {
  foreach ($connection in $existing) {
    try {
      Stop-Process -Id $connection.OwningProcess -Force -ErrorAction Stop
    } catch {
    }
  }
}

$logDir = Join-Path $projectRoot 'logs'
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

$stdout = Join-Path $logDir 'site-out.log'
$stderr = Join-Path $logDir 'site-error.log'

Write-Host 'Starting local server on http://localhost:5173 ...'
Start-Process -FilePath 'powershell.exe' `
  -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"Set-Location '$projectRoot'; npm run serve:local`"" `
  -WorkingDirectory $projectRoot `
  -RedirectStandardOutput $stdout `
  -RedirectStandardError $stderr

Write-Host 'Site started.'
