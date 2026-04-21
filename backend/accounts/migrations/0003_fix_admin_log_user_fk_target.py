from django.db import migrations


def fix_admin_log_user_fk_target(apps, schema_editor):
    if schema_editor.connection.vendor != 'sqlite':
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.execute('PRAGMA foreign_key_list(django_admin_log)')
        fks = cursor.fetchall()

    if any(fk[2] == 'accounts_teacher' and fk[3] == 'user_id' for fk in fks):
        return

    schema_editor.execute('PRAGMA foreign_keys=OFF;')
    schema_editor.execute(
        '''
        CREATE TABLE django_admin_log_new (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            action_time DATETIME NOT NULL,
            object_id TEXT NULL,
            object_repr VARCHAR(200) NOT NULL,
            action_flag SMALLINT UNSIGNED NOT NULL CHECK (action_flag >= 0),
            change_message TEXT NOT NULL,
            content_type_id INTEGER NULL REFERENCES django_content_type(id) DEFERRABLE INITIALLY DEFERRED,
            user_id BIGINT NOT NULL REFERENCES accounts_teacher(id) DEFERRABLE INITIALLY DEFERRED
        );
        '''
    )
    schema_editor.execute(
        '''
        INSERT INTO django_admin_log_new
            (id, action_time, object_id, object_repr, action_flag, change_message, content_type_id, user_id)
        SELECT
            log.id,
            log.action_time,
            log.object_id,
            log.object_repr,
            log.action_flag,
            log.change_message,
            log.content_type_id,
            log.user_id
        FROM django_admin_log AS log
        INNER JOIN accounts_teacher AS teacher ON teacher.id = log.user_id;
        '''
    )
    schema_editor.execute('DROP TABLE django_admin_log;')
    schema_editor.execute('ALTER TABLE django_admin_log_new RENAME TO django_admin_log;')
    schema_editor.execute(
        'CREATE INDEX IF NOT EXISTS django_admin_log_content_type_id_c4bce8eb ON django_admin_log(content_type_id);'
    )
    schema_editor.execute(
        'CREATE INDEX IF NOT EXISTS django_admin_log_user_id_c564eba6 ON django_admin_log(user_id);'
    )
    schema_editor.execute('PRAGMA foreign_keys=ON;')


class Migration(migrations.Migration):
    atomic = False

    dependencies = [
        ('accounts', '0002_alter_teacher_groups_alter_teacher_user_permissions'),
        ('admin', '0003_logentry_add_action_flag_choices'),
    ]

    operations = [
        migrations.RunPython(fix_admin_log_user_fk_target, migrations.RunPython.noop),
    ]
