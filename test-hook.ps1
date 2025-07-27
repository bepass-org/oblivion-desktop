param(
    [string]$HookType = "Unknown",
    [string]$Message = "Test hook execution"
)

$logFile = Join-Path $PSScriptRoot "hook-test.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$logEntry = @"
[$timestamp] Hook Type: $HookType
Arguments: $args
Message: $Message
Environment Variables:
$(Get-ChildItem Env:OBLIVION* | Out-String)
================================

"@

Add-Content -Path $logFile -Value $logEntry
Write-Host "Hook executed successfully - logged to $logFile"
Write-Host "Hook Type: $HookType"
Write-Host "Arguments: $($args -join ' ')"
