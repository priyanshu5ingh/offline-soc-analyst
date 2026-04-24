# ============================================================
# AEGIS Windows Telemetry Stream Injector
# Pulls Windows Event Logs continuously and appends them
# into the exact CSV contract expected by the AEGIS backend.
# ============================================================

$SharedDir = ".\shared_logs"
$OutputFile = "$SharedDir\live_stream.csv"

if (-not (Test-Path -Path $SharedDir)) {
    New-Item -ItemType Directory -Path $SharedDir | Out-Null
}

Write-Host "🛡️  AEGIS Windows Telemetry Stream Starting..." -ForegroundColor Cyan
Write-Host "📂  Output -> $OutputFile" -ForegroundColor Cyan
Write-Host "🔄  Polling interval: 5 seconds" -ForegroundColor Cyan
Write-Host "--------------------------------------------" -ForegroundColor DarkGray

# Initialize file with headers if it doesn't exist
if (-not (Test-Path -Path $OutputFile)) {
    '"TimeCreated","LevelDisplayName","ProviderName","Message"' | Out-File -FilePath $OutputFile -Encoding UTF8
}

while ($true) {
    try {
        # Grab the last 3 events from the System log
        $logs = Get-WinEvent -LogName System -MaxEvents 3 -ErrorAction Stop
    } catch {
        # Fallback to Application log if System is somehow restricted
        $logs = Get-WinEvent -LogName Application -MaxEvents 3
    }
    
    foreach ($log in $logs) {
        $time = $log.TimeCreated.ToString("o")
        $level = $log.LevelDisplayName
        if ([string]::IsNullOrWhiteSpace($level)) {
            $level = "Information"
        }
        $provider = $log.ProviderName
        
        # Clean the message payload to ensure it doesn't break CSV formatting
        $msg = $log.Message
        if ($null -ne $msg) {
            $msg = $msg -replace '"', "'"
            $msg = $msg -replace "`r`n", " "
            $msg = $msg -replace "`n", " "
            $msg = $msg -replace "`r", ""
        } else {
            $msg = ""
        }

        # Format and append
        $csvLine = "`"$time`",`"$level`",`"$provider`",`"$msg`""
        $csvLine | Out-File -FilePath $OutputFile -Append -Encoding UTF8
    }

    Write-Host "✅  [$(Get-Date -Format 'HH:mm:ss')] Payload injected into AEGIS Appliance." -ForegroundColor Green
    Start-Sleep -Seconds 5
}
