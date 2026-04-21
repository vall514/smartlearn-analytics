from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Teacher


@admin.register(Teacher)
class TeacherAdmin(UserAdmin):
	model = Teacher
	list_display = ('email', 'first_name', 'last_name', 'school_name', 'is_staff', 'is_active')
	search_fields = ('email', 'first_name', 'last_name', 'school_name')
	ordering = ('email',)
