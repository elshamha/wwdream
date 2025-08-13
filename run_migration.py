#!/usr/bin/env python
import os
import sys
import django
from django.core.management import execute_from_command_line

import argparse
import logging

def main():
    parser = argparse.ArgumentParser(description='Run Django migrations with extra features.')
    parser.add_argument('--app', type=str, default='writer', help='App to migrate (default: writer)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be migrated without applying')
    parser.add_argument('--list', action='store_true', help='List migration status for the app')
    parser.add_argument('--settings', type=str, default='atticus_writer.settings', help='Django settings module')
    args = parser.parse_args()

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', args.settings)
    django.setup()

    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    try:
        if args.list:
            logging.info(f"Listing migration status for app: {args.app}")
            execute_from_command_line(['manage.py', 'showmigrations', args.app])
        elif args.dry_run:
            logging.info(f"Dry run: showing migrations for app: {args.app}")
            execute_from_command_line(['manage.py', 'migrate', args.app, '--plan'])
        else:
            logging.info(f"Migrating app: {args.app}")
            execute_from_command_line(['manage.py', 'migrate', args.app])
            logging.info("Migration complete.")
    except Exception as e:
        logging.error(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
