# Generated manually to add Google Docs support

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('writer', '0004_importeddocument_word_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='importeddocument',
            name='google_docs_url',
            field=models.URLField(blank=True, help_text='Google Docs sharing URL', null=True),
        ),
        migrations.AlterField(
            model_name='importeddocument',
            name='original_file',
            field=models.FileField(blank=True, null=True, upload_to='imports/'),
        ),
        migrations.AlterField(
            model_name='importeddocument',
            name='import_type',
            field=models.CharField(choices=[('pdf', 'PDF'), ('docx', 'Word Document'), ('google_docs', 'Google Document'), ('txt', 'Text File'), ('html', 'HTML File'), ('rtf', 'Rich Text Format'), ('odt', 'OpenDocument Text')], max_length=15),
        ),
    ]
