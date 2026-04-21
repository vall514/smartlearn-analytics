from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    StudentViewSet,
    SubjectViewSet,
    ExamViewSet,
    AttendanceViewSet,
    AssignmentViewSet,
    TopicPerformanceViewSet,
    at_risk_students,
    student_insights,
)

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'attendances', AttendanceViewSet, basename='attendance')
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'topic-performances', TopicPerformanceViewSet, basename='topic-performance')

urlpatterns = [
    path('predictions/at-risk-students/', at_risk_students, name='at-risk-students'),
    path('prediction/at-risk-students/', at_risk_students, name='at-risk-students-alias'),
    path('students/<int:student_id>/insights/', student_insights, name='student-insights'),
] + router.urls