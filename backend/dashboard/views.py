from django.db.models import Avg
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Student, Subject, Exam, Attendance, Assignment
from .serializers import StudentSerializer, SubjectSerializer, ExamSerializer, AttendanceSerializer, AssignmentSerializer

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Each teacher only sees their own students
        return Student.objects.filter(teacher=self.request.user)

    def perform_create(self, serializer):
        # When adding a student, automatically assign to logged in teacher
        serializer.save(teacher=self.request.user)

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

class ExamViewSet(viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return exams for this teacher's students
        return Exam.objects.filter(student__teacher=self.request.user)

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return attendance for this teacher's students
        return Attendance.objects.filter(student__teacher=self.request.user)

class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return assignments for this teacher's students
        return Assignment.objects.filter(student__teacher=self.request.user)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def at_risk_students(request):
    # Only get this teacher's students
    students = Student.objects.filter(teacher=request.user)
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