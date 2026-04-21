from django.db import migrations


def fix_student_teacher_fk_target(apps, schema_editor):
    if schema_editor.connection.vendor != 'sqlite':
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.execute("PRAGMA foreign_key_list(dashboard_student)")
        fks = cursor.fetchall()

    # Already correct, nothing to do.
    if any(fk[2] == 'accounts_teacher' for fk in fks):
        return

    # Rebuild table to repoint teacher_id foreign key to accounts_teacher.
    schema_editor.execute('PRAGMA foreign_keys=OFF;')
    schema_editor.execute(
        '''
        CREATE TABLE dashboard_student_new (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            admission_number VARCHAR(20) NOT NULL UNIQUE,
            student_class VARCHAR(50) NOT NULL,
            created_at DATETIME NOT NULL,
            teacher_id BIGINT NULL REFERENCES accounts_teacher(id) DEFERRABLE INITIALLY DEFERRED,
            stream VARCHAR(50) NULL
        );
        '''
    )
    schema_editor.execute(
        '''
        INSERT INTO dashboard_student_new (id, name, admission_number, student_class, created_at, teacher_id, stream)
        SELECT id, name, admission_number, student_class, created_at, teacher_id, stream
        FROM dashboard_student;
        '''
    )
    schema_editor.execute('DROP TABLE dashboard_student;')
    schema_editor.execute('ALTER TABLE dashboard_student_new RENAME TO dashboard_student;')
    schema_editor.execute(
        'CREATE INDEX IF NOT EXISTS dashboard_student_teacher_id_idx ON dashboard_student(teacher_id);'
    )
    schema_editor.execute('PRAGMA foreign_keys=ON;')


class Migration(migrations.Migration):
    atomic = False

    dependencies = [
        ('dashboard', '0003_remove_student_date_of_birth_student_stream'),
    ]

    operations = [
        migrations.RunPython(fix_student_teacher_fk_target, migrations.RunPython.noop),
    ]
