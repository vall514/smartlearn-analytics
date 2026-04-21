from django.contrib import admin
from .models import Student, Subject, Exam, Attendance, Assignment, TopicPerformance


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
	list_display = ('name', 'admission_number', 'student_class', 'stream', 'teacher')
	list_filter = ('student_class', 'stream', 'teacher')
	search_fields = ('name', 'admission_number')


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
	list_display = ('name', 'code')
	search_fields = ('name', 'code')


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
	list_display = ('student', 'subject', 'term', 'exam_type', 'score', 'date')
	list_filter = ('term', 'subject', 'exam_type')
	search_fields = ('student__name', 'student__admission_number', 'subject__name')


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
	list_display = ('student', 'subject', 'date', 'status')
	list_filter = ('status', 'subject')
	search_fields = ('student__name', 'student__admission_number', 'subject__name')


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
	list_display = ('student', 'subject', 'title', 'due_date', 'submission_date', 'score')
	list_filter = ('subject', 'due_date')
	search_fields = ('student__name', 'student__admission_number', 'subject__name', 'title')


@admin.register(TopicPerformance)
class TopicPerformanceAdmin(admin.ModelAdmin):
	list_display = ('student', 'subject', 'topic', 'score', 'max_score', 'assessment_date')
	list_filter = ('subject', 'assessment_date')
	search_fields = ('student__name', 'student__admission_number', 'subject__name', 'topic')
