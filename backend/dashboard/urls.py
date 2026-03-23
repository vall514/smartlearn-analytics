from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, SubjectViewSet, ExamViewSet, AttendanceViewSet, AssignmentViewSet, at_risk_students

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'exams', ExamViewSet)
router.register(r'attendances', AttendanceViewSet)
router.register(r'assignments', AssignmentViewSet)

urlpatterns = [
    path('predictions/at-risk-students/', at_risk_students, name='at-risk-students'),
] + router.urls