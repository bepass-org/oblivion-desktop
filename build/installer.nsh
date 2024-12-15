Function .onInit
    ; Detect OS type by checking environment variables
    GetEnv $R0 "OS"   ; Get the OS environment variable

    ; Handle processes based on OS
    ${If} $R0 == "Windows_NT"
        ; Include the Windows-specific script only for Windows
        !include "build/installer.nsh"
        ExecWait 'taskkill /IM oblivion-helper.exe /F'
    ${ElseIf} $R0 == "Linux"
        ExecWait 'sh -c "pkill -f oblivion-helper"'
    ${ElseIf} $R0 == "Darwin"  ; Darwin is the OS identifier for macOS
        ExecWait 'sh -c "pkill -f oblivion-helper"'
    ${EndIf}

    ; Ask user if they want to continue
    MessageBox MB_ICONQUESTION|MB_YESNO "The oblivion-helper is running. Do you want to continue?" IDYES ContinueAbort
    Abort
    ContinueAbort:
FunctionEnd
