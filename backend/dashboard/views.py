from django.db.models import Avg, F
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Student, Subject, Exam, Attendance, Assignment, TopicPerformance
from .serializers import (
    StudentSerializer,
    SubjectSerializer,
    ExamSerializer,
    AttendanceSerializer,
    AssignmentSerializer,
    TopicPerformanceSerializer,
)


def _is_admin_user(user):
    return bool(getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False))


def _student_queryset_for_user(user):
    return Student.objects.all() if _is_admin_user(user) else Student.objects.filter(teacher=user)


def _ensure_teacher_owns_student(student, teacher):
    if not _is_admin_user(teacher) and student.teacher_id != teacher.id:
        raise PermissionDenied('You can only manage data for your own students.')

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Teachers only see their own students; admins see all students.
        return _student_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        # Teachers are auto-assigned to their students; admins can optionally set a teacher.
        if _is_admin_user(self.request.user):
            serializer.save(teacher=serializer.validated_data.get('teacher', self.request.user))
        else:
            serializer.save(teacher=self.request.user)

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

class ExamViewSet(viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Teachers only see their own students' exams; admins see all exams.
        return Exam.objects.all() if _is_admin_user(self.request.user) else Exam.objects.filter(student__teacher=self.request.user)

    def perform_create(self, serializer):
        student = serializer.validated_data['student']
        _ensure_teacher_owns_student(student, self.request.user)
        serializer.save()

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Teachers only see their own students' attendance; admins see all attendance.
        return Attendance.objects.all() if _is_admin_user(self.request.user) else Attendance.objects.filter(student__teacher=self.request.user)

    def perform_create(self, serializer):
        student = serializer.validated_data['student']
        _ensure_teacher_owns_student(student, self.request.user)
        serializer.save()

class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Teachers only see their own students' assignments; admins see all assignments.
        return Assignment.objects.all() if _is_admin_user(self.request.user) else Assignment.objects.filter(student__teacher=self.request.user)

    def perform_create(self, serializer):
        student = serializer.validated_data['student']
        _ensure_teacher_owns_student(student, self.request.user)
        serializer.save()


class TopicPerformanceViewSet(viewsets.ModelViewSet):
    serializer_class = TopicPerformanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TopicPerformance.objects.all() if _is_admin_user(self.request.user) else TopicPerformance.objects.filter(student__teacher=self.request.user)

    def perform_create(self, serializer):
        student = serializer.validated_data['student']
        _ensure_teacher_owns_student(student, self.request.user)
        serializer.save()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_insights(request, student_id):
    student = get_object_or_404(Student, id=student_id)
    _ensure_teacher_owns_student(student, request.user)

    exams = Exam.objects.filter(student=student).select_related('subject')
    attendance = Attendance.objects.filter(student=student).select_related('subject')
    assignments = Assignment.objects.filter(student=student).select_related('subject')
    topic_scores = TopicPerformance.objects.filter(student=student).select_related('subject')

    term_config = [
        ('FIRST_TERM', 'First Term'),
        ('SECOND_TERM', 'Second Term'),
        ('THIRD_TERM', 'Third Term'),
    ]
    term_performance = []
    for term_code, term_label in term_config:
        term_exams = exams.filter(term=term_code)
        subject_breakdown = []
        for subject_name in sorted({exam.subject.name for exam in term_exams}):
            subject_exams = term_exams.filter(subject__name=subject_name)
            subject_avg = subject_exams.aggregate(Avg('score'))['score__avg'] or 0
            subject_breakdown.append({
                'subject': subject_name,
                'average_score': round(subject_avg, 2),
                'exam_count': subject_exams.count(),
            })

        avg_score = term_exams.aggregate(Avg('score'))['score__avg']
        term_performance.append({
            'term': term_label,
            'average_score': round(avg_score, 2) if avg_score is not None else None,
            'exam_count': term_exams.count(),
            'subject_breakdown': subject_breakdown,
        })

    total_days = attendance.count()
    present_days = attendance.filter(status='present').count()
    late_days = attendance.filter(status='late').count()
    absent_days = attendance.filter(status='absent').count()
    attendance_rate = (present_days / total_days) if total_days else 0

    attendance_by_subject = []
    for subject_name in sorted({item.subject.name for item in attendance if item.subject_id}):
        rows = attendance.filter(subject__name=subject_name)
        subject_total = rows.count()
        subject_present = rows.filter(status='present').count()
        attendance_by_subject.append({
            'subject': subject_name,
            'attendance_rate': round((subject_present / subject_total), 2) if subject_total else 0,
            'total_lessons': subject_total,
        })

    total_assignments = assignments.count()
    submitted_assignments = assignments.filter(submission_date__isnull=False).count()
    late_submissions = assignments.filter(submission_date__isnull=False, submission_date__gt=F('due_date')).count()
    completion_rate = (submitted_assignments / total_assignments) if total_assignments else 0
    late_rate = (late_submissions / submitted_assignments) if submitted_assignments else 0
    assignment_avg = assignments.aggregate(Avg('score'))['score__avg']

    subject_summary = []
    for subject_name in sorted({exam.subject.name for exam in exams}):
        subject_exams = exams.filter(subject__name=subject_name)
        subject_avg = subject_exams.aggregate(Avg('score'))['score__avg'] or 0
        subject_summary.append({
            'subject': subject_name,
            'average_score': round(subject_avg, 2),
            'risk_level': 'high' if subject_avg < 50 else 'moderate' if subject_avg < 65 else 'low',
        })

    weak_subjects = [item for item in subject_summary if item['average_score'] < 60]

    topic_summary = []
    for row in topic_scores:
        percentage = (row.score / row.max_score) * 100 if row.max_score else 0
        topic_summary.append({
            'subject': row.subject.name,
            'topic': row.topic,
            'score_percentage': round(percentage, 2),
            'assessment_date': row.assessment_date,
        })
    topic_summary.sort(key=lambda x: x['score_percentage'])
    weak_topics = [row for row in topic_summary if row['score_percentage'] < 60]

    return Response({
        'student': {
            'id': student.id,
            'name': student.name,
            'admission_number': student.admission_number,
            'student_class': student.student_class,
            'stream': student.stream,
        },
        'term_performance': term_performance,
        'attendance': {
            'total_days': total_days,
            'present_days': present_days,
            'late_days': late_days,
            'absent_days': absent_days,
            'attendance_rate': round(attendance_rate, 2),
            'by_subject': attendance_by_subject,
        },
        'assignments': {
            'total': total_assignments,
            'submitted': submitted_assignments,
            'completion_rate': round(completion_rate, 2),
            'late_submission_rate': round(late_rate, 2),
            'average_score': round(assignment_avg, 2) if assignment_avg is not None else None,
        },
        'weak_subjects': weak_subjects,
        'weak_topics': weak_topics,
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def at_risk_students(request):
    # Teachers only get their own students; admins can view the whole school.
    students = _student_queryset_for_user(request.user)
    if not students.exists():
        return Response({
            "message": "No students in database yet.",
            "at_risk_students": [],
            "all_students": [],
        })

    results = []
    for student in students:
        exams = Exam.objects.filter(student=student)
        attendance = Attendance.objects.filter(student=student)
        assignments = Assignment.objects.filter(student=student)

        avg_exam = exams.aggregate(Avg("score"))["score__avg"] or 0
        total_days = attendance.count()
        present_days = attendance.filter(status="present").count()
        attendance_rate = present_days / total_days if total_days > 0 else 0

        total_assignments = assignments.count()
        submitted_assignments = assignments.filter(submission_date__isnull=False).count()
        assignment_completion_rate = submitted_assignments / total_assignments if total_assignments > 0 else 0
        avg_assignment_score = assignments.aggregate(Avg("score"))["score__avg"] or 0

        risk_score = 0
        if avg_exam < 50:
            risk_score += 1
        if attendance_rate < 0.8:
            risk_score += 1
        if assignment_completion_rate < 0.7:
            risk_score += 1

        at_risk = risk_score >= 1

        results.append({
            "student_id": student.id,
            "name": student.name,
            "avg_exam_score": round(avg_exam, 2),
            "attendance_rate": round(attendance_rate, 2),
            "assignment_completion_rate": round(assignment_completion_rate, 2),
            "avg_assignment_score": round(avg_assignment_score, 2),
            "risk_score": risk_score,
            "at_risk": at_risk,
        })

    at_risk_list = [r for r in results if r["at_risk"]]
    return Response({"at_risk_students": at_risk_list, "all_students": results})