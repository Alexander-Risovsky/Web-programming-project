from rest_framework.viewsets import ModelViewSet
from .models import StudentProfile, OrganizationProfile
from .serializers import OrganizationProfileSerializer, StudentProfileSerializer
from drf_spectacular.utils import extend_schema, extend_schema_view


@extend_schema_view(
    list=extend_schema(description="Retrieve a list of student profiles"),
    retrieve=extend_schema(description="Retrieve a specific student profile"),
    create=extend_schema(description="Create a new student profile"),
    update=extend_schema(description="Update an existing student profile"),
    partial_update=extend_schema(
        description="Partially update an existing student profile"
    ),
    destroy=extend_schema(description="Delete a student profile"),
)
class StudentProfileViewSet(ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer


class OrganizationProfileViewSet(ModelViewSet):
    queryset = OrganizationProfile.objects.all()
    serializer_class = OrganizationProfileSerializer
