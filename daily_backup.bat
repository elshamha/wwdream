@echo off
echo Starting Atticus Writer Daily Backup...
echo.

REM Set backup directory
set backup_dir=%~dp0backups
set date_time=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set date_time=%date_time: =0%

REM Create backups directory if it doesn't exist
if not exist "%backup_dir%" (
    mkdir "%backup_dir%"
    echo Created backups directory
)

REM Backup database
echo Backing up database...
copy "%~dp0db.sqlite3" "%backup_dir%\db_backup_%date_time%.sqlite3" > nul
if %errorlevel%==0 (
    echo ✅ Database backed up successfully: db_backup_%date_time%.sqlite3
) else (
    echo ❌ Database backup failed
)

REM Backup media files if they exist
if exist "%~dp0media" (
    echo Backing up media files...
    xcopy /E /I /Y "%~dp0media" "%backup_dir%\media_backup_%date_time%" > nul
    if %errorlevel%==0 (
        echo ✅ Media files backed up successfully
    ) else (
        echo ❌ Media backup failed
    )
)

REM Clean old backups (keep last 30 days)
echo Cleaning old backups...
forfiles /P "%backup_dir%" /M "db_backup_*.sqlite3" /D -30 /C "cmd /C del @path" 2>nul
forfiles /P "%backup_dir%" /M "media_backup_*" /D -30 /C "cmd /C rmdir /S /Q @path" 2>nul

echo.
echo 🎉 Backup completed successfully!
echo Check the backups folder for your files.
pause