from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, SubjectViewSet, ExamViewSet, AttendanceViewSet, AssignmentViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'exams', ExamViewSet)
router.register(r'attendances', AttendanceViewSet)
router.register(r'assignments', AssignmentViewSet)

urlpatterns = router.urls