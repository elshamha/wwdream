# Atticus Writer Backup & Recovery Guide

## Overview
Your Atticus Writer project is now protected with a comprehensive backup strategy.

## Backup Components

### 1. Git Version Control ✅
- **Status**: Active and committed
- **Last Backup**: All changes committed with message "💾 Complete backup: Enhanced character management, fixed Google Docs editor, transparent UI updates"
- **Contains**: All source code, templates, configuration files

### 2. Cloud Repository Setup
To create a GitHub backup repository:

```bash
# Create a new repository on GitHub (manual step)
# Then connect it:
git remote add origin https://github.com/YOUR_USERNAME/atticus-writer-backup.git
git push -u origin main
```

### 3. Database Backup
Your SQLite database contains all your writing projects, characters, and user data.

**Manual Backup Command:**
```bash
cp db.sqlite3 backups/db_backup_$(date +%Y%m%d_%H%M%S).sqlite3
```

**Automated Daily Backup (Windows):**
Create a batch file `daily_backup.bat`:
```batch
@echo off
set backup_dir=C:\Users\elsha\AtticusTry\backups
set date_time=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set date_time=%date_time: =0%

if not exist "%backup_dir%" mkdir "%backup_dir%"
copy "C:\Users\elsha\AtticusTry\db.sqlite3" "%backup_dir%\db_backup_%date_time%.sqlite3"
echo Database backed up to %backup_dir%\db_backup_%date_time%.sqlite3
```

### 4. Media Files Backup
Your uploaded documents and character images are stored in the media folder.

**Backup Command:**
```bash
xcopy /E /I /Y media backups\media_backup_%date%
```

## Recovery Procedures

### Restore from Git
```bash
git clone https://github.com/YOUR_USERNAME/atticus-writer-backup.git
cd atticus-writer-backup
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Restore Database
```bash
# Replace current database with backup
copy "backups\db_backup_YYYYMMDD_HHMMSS.sqlite3" "db.sqlite3"
```

### Restore Media Files
```bash
xcopy /E /I /Y "backups\media_backup_*\*" "media\"
```

## Backup Schedule Recommendations

- **Daily**: Database backup (automated)
- **Weekly**: Full project backup to cloud
- **Before major changes**: Manual Git commit and push
- **Monthly**: Clean old backups (keep last 30 days)

## Current Status
✅ Git repository initialized and committed
✅ Backup directory structure created
⏳ Cloud repository setup (manual step required)
⏳ Automated backup scripts (optional)

## Next Steps
1. Create GitHub repository at https://github.com/new
2. Name it "atticus-writer-backup" 
3. Run: `git remote add origin https://github.com/YOUR_USERNAME/atticus-writer-backup.git`
4. Run: `git push -u origin main`
5. Set up automated daily database backups (optional)

## Emergency Contacts & Resources
- GitHub: https://github.com
- SQLite Recovery Tools: DB Browser for SQLite
- Django Documentation: https://docs.djangoproject.com/