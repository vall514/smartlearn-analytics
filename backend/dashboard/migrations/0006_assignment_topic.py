# Generated migration for adding topic field to Assignment model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0005_exam_term_topicperformance'),
    ]

    operations = [
        migrations.AddField(
            model_name='assignment',
            name='topic',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
