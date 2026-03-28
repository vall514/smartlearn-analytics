from django.contrib.auth.models import AbstractUser
from django.db import models

class Teacher(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    school_name = models.CharField(max_length=200, blank=True, null=True)
    
    # These two lines fix the conflict
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='teacher_set',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='teacher_set',
        blank=True
    )
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"