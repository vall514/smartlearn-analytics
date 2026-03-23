from django.db.models import Avg
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Student, Subject, Exam, Attendance, Assignment
from .serializers import StudentSerializer, SubjectSerializer, ExamSerializer, AttendanceSerializer, AssignmentSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer

@api_view(["GET"])
def at_risk_students(request):
    students = Student.objects.all()
    if not students.exists():
        return Response({"message": "No students in database yet.", "at_risk": []})

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
