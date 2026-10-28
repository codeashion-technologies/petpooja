' OrderRestro Silent Background Auto-Start Script
' Runs docker compose up -d in the project directory without opening any CMD window.

Option Explicit
Dim fso, scriptDir, projectDir, wshShell, cmd

Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
' projectDir is two levels up from scripts\windows
projectDir = fso.GetParentFolderName(fso.GetParentFolderName(scriptDir))

Set wshShell = CreateObject("WScript.Shell")
wshShell.CurrentDirectory = projectDir

' Run docker compose up -d silently (0 = hidden window, False = don't wait)
cmd = "cmd.exe /c docker compose up -d"
wshShell.Run cmd, 0, False
