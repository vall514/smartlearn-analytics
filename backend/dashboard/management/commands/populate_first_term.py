from django.core.management.base import BaseCommand
from datetime import timedelta, date
import random

from accounts.models import Teacher
from dashboard.models import Student, Subject, Exam, Attendance, Assignment, TopicPerformance


class Command(BaseCommand):
    help = 'Populate database with first term sample data for 18 students'

    def add_arguments(self, parser):
        parser.add_argument('--teacher-username', type=str, help='Assign students to this teacher username')

    def handle(self, *args, **options):
        teacher_username = options.get('teacher_username')
        teacher = None
        if teacher_username:
            try:
                teacher = Teacher.objects.get(username=teacher_username)
            except Teacher.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Teacher {teacher_username} not found'))
                return

        if not teacher:
            teacher = Teacher.objects.first()
            if not teacher:
                # create a default teacher
                teacher = Teacher.objects.create_user(username='teacher1', password='password', first_name='Default', last_name='Teacher')
                self.stdout.write(self.style.WARNING('No teacher found; created default teacher username=teacher1 password=password'))

        # Subjects
        subjects = ['English', 'Kiswahili', 'Maths', 'Biology', 'Physics', 'History', 'Geography']
        subject_objs = []
        for idx, name in enumerate(subjects, start=1):
            code = f'SUB{idx:02d}'
            obj = Subject.objects.filter(name=name).first() or Subject.objects.filter(code=code).first()
            if not obj:
                obj = Subject.objects.create(name=name, code=code)
            subject_objs.append(obj)

        # Student names
        names = [
            'Claris', 'Brian', 'Catherine', 'Daniel', 'Esther', 'Frank', 'Grace', 'Hannah',
            'Isaac', 'Janet', 'Kevin', 'Lucy', 'Michael', 'Nancy', 'Oscar', 'Patricia', 'Quincy', 'Ruth'
        ]

        # Attendance target counts
        attendance_counts = [200]*10 + [150]*3 + [100]*1 + [180]*2 + [90]*2
        assert len(attendance_counts) == 18

        # Assignment behaviors: 'on_time', 'late', 'not_submitted', 'early'
        behaviors = ['on_time']*9 + ['late']*4 + ['not_submitted']*2 + ['early']*3
        random.shuffle(behaviors)

        # Create 18 students
        students = list(Student.objects.filter(teacher=teacher).order_by('id')[:18])

        # If fewer than 18 students exist for this teacher, create placeholders first.
        while len(students) < 18:
            index = len(students) + 1
            temp_adm = f'TMP{teacher.id:02d}{index:03d}'
            student = Student.objects.create(
                name=f'Student {index}',
                admission_number=temp_adm,
                student_class='Form 1',
                stream='A',
                teacher=teacher,
            )
            students.append(student)

        target_admissions = [f'ADM{i:03d}' for i in range(1, 19)]
        target_set = set(target_admissions)
        selected_ids = [s.id for s in students]

        # Move any conflicting admission numbers away from non-selected students.
        conflicting = Student.objects.exclude(id__in=selected_ids).filter(admission_number__in=target_set)
        for other in conflicting:
            other.admission_number = f'OLD{other.id:05d}'
            other.save(update_fields=['admission_number'])

        # Force selected students to exactly match ADM001..ADM018 and desired names.
        for idx, student in enumerate(students):
            student.name = names[idx]
            student.admission_number = target_admissions[idx]
            student.student_class = 'Form 1'
            student.stream = 'A'
            student.teacher = teacher
            student.save(update_fields=['name', 'admission_number', 'student_class', 'stream', 'teacher'])

        # Generate 200 consecutive class dates for the term
        start_date = date(2026, 1, 5)
        class_dates = [start_date + timedelta(days=i) for i in range(200)]

        # Clear existing related records for these students to avoid duplicates
        for s in students:
            Exam.objects.filter(student=s, term='FIRST_TERM').delete()
            Attendance.objects.filter(student=s).delete()
            Assignment.objects.filter(student=s).delete()
            TopicPerformance.objects.filter(student=s).delete()

        # Create attendance records per student according to attendance_counts
        for student, attend_count, behavior in zip(students, attendance_counts, behaviors):
            present_days = set(random.sample(range(200), attend_count))
            for idx, d in enumerate(class_dates):
                status = 'present' if idx in present_days else 'absent'
                # small chance of late among presents
                if status == 'present' and random.random() < 0.03:
                    status = 'late'
                Attendance.objects.create(student=student, date=d, status=status)

            # Create assignments: one per subject
            for subj in subject_objs:
                due = start_date + timedelta(days=140)
                if behavior == 'on_time':
                    submission = due
                elif behavior == 'late':
                    submission = due + timedelta(days=random.randint(1, 7))
                elif behavior == 'not_submitted':
                    submission = None
                else:  # early
                    submission = due - timedelta(days=random.randint(1, 5))

                Assignment.objects.create(
                    student=student,
                    subject=subj,
                    title=f'{subj.name} Assignment',
                    score=random.uniform(40, 90) if submission else None,
                    max_score=100,
                    due_date=due,
                    submission_date=submission,
                )

            # Exams: one per subject with Kenyan-like distribution
            for subj in subject_objs:
                # Typical distribution: mean around 60, some high and low
                score = int(max(20, min(95, random.gauss(60, 15))))
                Exam.objects.create(
                    student=student,
                    subject=subj,
                    score=score,
                    term='FIRST_TERM',
                    exam_type='End of Term',
                    date=start_date + timedelta(days=random.randint(150, 190)),
                )

            # Topic performance: one topic per subject
            for subj in subject_objs:
                tp_score = max(10, min(100, int(random.gauss(60, 18))))
                TopicPerformance.objects.create(
                    student=student,
                    subject=subj,
                    topic=f'Key topic in {subj.name}',
                    score=tp_score,
                    max_score=100,
                    assessment_date=start_date + timedelta(days=random.randint(120, 180)),
                )

        self.stdout.write(self.style.SUCCESS('Populated first term data for 18 students'))