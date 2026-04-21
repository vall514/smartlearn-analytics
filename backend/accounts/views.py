from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from .models import Teacher

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    data = request.data
    
    if Teacher.objects.filter(email=data.get('email')).exists():
        return Response(
            {'error': 'Email already exists'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    teacher = Teacher.objects.create_user(
        username=data.get('email'),
        email=data.get('email'),
        password=data.get('password'),
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        phone_number=data.get('phone_number', ''),
        school_name=data.get('school_name', ''),
    )
    
    refresh = RefreshToken.for_user(teacher)
    
    return Response({
        'message': 'Account created successfully',
        'token': str(refresh.access_token),
        'refresh': str(refresh),
        'teacher': {
            'id': teacher.id,
            'email': teacher.email,
            'first_name': teacher.first_name,
            'last_name': teacher.last_name,
            'school_name': teacher.school_name,
            'is_staff': teacher.is_staff,
            'is_superuser': teacher.is_superuser,
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    identifier = (request.data.get('email') or request.data.get('username') or '').strip()
    password = request.data.get('password')

    if not identifier or not password:
        return Response(
            {'error': 'Email/username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Allow login with either email or username.
    teacher = Teacher.objects.filter(
        Q(email__iexact=identifier) | Q(username__iexact=identifier)
    ).first()

    if not teacher:
        return Response(
            {'error': 'Invalid email or password'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Check password directly using Teacher model
    if not teacher.check_password(password):
        return Response(
            {'error': 'Invalid email or password'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not teacher.is_active:
        return Response(
            {'error': 'This account is inactive'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Generate token
    refresh = RefreshToken.for_user(teacher)
    
    return Response({
        'message': 'Login successful',
        'token': str(refresh.access_token),
        'refresh': str(refresh),
        'teacher': {
            'id': teacher.id,
            'email': teacher.email,
            'first_name': teacher.first_name,
            'last_name': teacher.last_name,
            'school_name': teacher.school_name,
            'is_staff': teacher.is_staff,
            'is_superuser': teacher.is_superuser,
        }
    })