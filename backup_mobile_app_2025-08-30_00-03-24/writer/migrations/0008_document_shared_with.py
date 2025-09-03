# Generated migration to restore missing dependency for writer app
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('writer', '0007_chapter_is_published'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='shared_with',
            field=models.ManyToManyField(blank=True, related_name='shared_documents', to='auth.User'),
        ),
    ]
