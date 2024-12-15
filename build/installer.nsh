Function .onInit
    ; Detect OS type by checking environment variables
    ReadEnvStr $R0 "OS"

    ; Handle processes based on OS
    ${If} $R0 == "Windows_NT"
        ExecWait 'taskkill /IM oblivion-helper.exe /F'
    ${ElseIf} $R0 == "Linux"
        ExecWait 'sh -c "pkill -f oblivion-helper"'
    ${ElseIf} $R0 == "Darwin"
        ExecWait 'sh -c "pkill -f oblivion-helper"'
    ${EndIf}

    ; Ask user if they want to continue
    MessageBox MB_ICONQUESTION|MB_YESNO "The oblivion-helper is running. Do you want to continue?" IDYES ContinueAbort
    Abort
    ContinueAbort:
FunctionEnd
