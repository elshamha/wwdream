import os
import sys
sys.path.append(r'c:\Users\elsha\Atticus Try')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atticus_writer.settings')

import django
django.setup()

from django.core.management import call_command
print("Running migration...")
call_command('migrate', 'writer')
print("Migration completed!")
