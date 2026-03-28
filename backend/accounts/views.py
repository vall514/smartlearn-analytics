from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
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
        'teacher': {
            'id': teacher.id,
            'email': teacher.email,
            'first_name': teacher.first_name,
            'last_name': teacher.last_name,
            'school_name': teacher.school_name,
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Find teacher by email
    try:
        teacher = Teacher.objects.get(email=email)
    except Teacher.DoesNotExist:
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
    
    # Generate token
    refresh = RefreshToken.for_user(teacher)
    
    return Response({
        'message': 'Login successful',
        'token': str(refresh.access_token),
        'teacher': {
            'id': teacher.id,
            'email': teacher.email,
            'first_name': teacher.first_name,
            'last_name': teacher.last_name,
            'school_name': teacher.school_name,
        }
    })