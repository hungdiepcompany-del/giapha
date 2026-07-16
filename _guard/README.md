# Repository-local project guard

These guard files belong only to this repository.

Codex must not edit `D:\CODE\PROJECT_GUARD.bat`.
Codex must not edit guard files in sibling repositories.

Run status:

```powershell
.\GUARD.bat status
```

Run doctor:

```powershell
.\GUARD.bat doctor
```

Project config lives in `_guard\PROJECT_GUARD.config.bat`.
Project-specific read-only checks live in `_guard\PROJECT_STATUS_HOOK.bat`.

All `.bat` guard files must be UTF-8 without BOM, CRLF, and start with `@echo off`.
