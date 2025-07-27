# How to Use Hooks in Oblivion Desktop

The hooks feature allows you to automatically run external programs when VPN connection events occur.

## Setup Instructions

1. **Open Oblivion Desktop** and navigate to the **Options** page
2. **Scroll down** to find the "Hooks" section
3. **Configure each hook type** as needed:
    - **On Connection Success**: Runs when VPN connects successfully
    - **On Connection Fail**: Runs when VPN fails to connect
    - **On Disconnect**: Runs when VPN disconnects
    - **On Connection Error**: Runs when connection errors occur

## Configuring a Hook

1. **Enter executable path manually** OR click **"Browse"** to select a file
2. **Add command line arguments** (optional) in the Arguments field
3. **Settings are saved automatically** when you make changes

## Example Use Cases

### Notification Scripts

- Show desktop notifications when connected/disconnected
- Play custom sounds for different events
- Send messages to messaging apps

### Network Configuration

- Update firewall rules when connected
- Restart network services
- Update DNS settings

### Logging and Monitoring

- Log connection events to files
- Send status updates to monitoring systems
- Update external dashboards

## Sample Scripts

### Windows Notification (PowerShell)

```powershell
# Save as notify-connection.ps1
param([string]$Title = "VPN Status")

$hookType = $env:OBLIVION_HOOK_TYPE
$timestamp = $env:OBLIVION_TIMESTAMP

switch ($hookType) {
    "connectSuccess" {
        [System.Windows.Forms.MessageBox]::Show("VPN Connected Successfully!", $Title)
    }
    "connectFail" {
        [System.Windows.Forms.MessageBox]::Show("VPN Connection Failed!", $Title)
    }
    "disconnect" {
        [System.Windows.Forms.MessageBox]::Show("VPN Disconnected", $Title)
    }
    "connectionError" {
        [System.Windows.Forms.MessageBox]::Show("VPN Connection Error: $env:OBLIVION_ERRORMESSAGE", $Title)
    }
}
```

### Linux/macOS Notification (Bash)

```bash
#!/bin/bash
# Save as notify-connection.sh and make executable

case "$OBLIVION_HOOK_TYPE" in
    "connectSuccess")
        notify-send "VPN Connected" "Successfully connected via $OBLIVION_PROXYMODE"
        ;;
    "connectFail")
        notify-send "VPN Failed" "Connection failed after $OBLIVION_RETRYATTEMPTS attempts"
        ;;
    "disconnect")
        notify-send "VPN Disconnected" "VPN connection terminated"
        ;;
    "connectionError")
        notify-send "VPN Error" "$OBLIVION_ERRORMESSAGE"
        ;;
esac
```

## Environment Variables Available

Your hook scripts receive information through environment variables:

- `OBLIVION_HOOK_TYPE`: Type of event (connectSuccess, connectFail, disconnect, connectionError)
- `OBLIVION_TIMESTAMP`: When the event occurred
- `OBLIVION_PROXYMODE`: Current proxy mode
- `OBLIVION_PORT`: Proxy port
- `OBLIVION_HOSTIP`: Host IP address

Additional variables depending on the hook type:

- Connection Success: `OBLIVION_METHOD`, `OBLIVION_ENDPOINT`, `OBLIVION_LOCATION`
- Connection Failure: `OBLIVION_RETRYATTEMPTS`
- Connection Error: `OBLIVION_ERRORMESSAGE`, `OBLIVION_TRANSLATEDERROR`

## Important Notes

- **Hook execution is asynchronous** - they won't block VPN operations
- **Hooks have a 30-second timeout** to prevent hanging
- **Failed hooks are logged** but won't affect VPN functionality
- **Use absolute paths** for executables for reliability
- **Test your hooks** before relying on them for critical operations

## Troubleshooting

- Check the application logs if hooks aren't executing
- Ensure executable files have proper permissions
- Verify file paths are correct and absolute
- Test hooks manually before setting them up
- Use the provided test scripts to verify functionality
