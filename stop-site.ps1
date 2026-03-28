$existing = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if (-not $existing) {
  Write-Host 'No local site process is currently listening on port 5173.'
  exit 0
}

foreach ($connection in $existing) {
  try {
    Stop-Process -Id $connection.OwningProcess -Force -ErrorAction Stop
    Write-Host "Stopped process $($connection.OwningProcess) on port 5173."
  } catch {
    Write-Host "Unable to stop process $($connection.OwningProcess)."
  }
}
