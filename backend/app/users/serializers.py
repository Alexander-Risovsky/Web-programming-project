from rest_framework.serializers import ModelSerializer
from .models import StudentProfile, OrganizationProfile


class StudentProfileSerializer(ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = "__all__"


class OrganizationProfileSerializer(ModelSerializer):
    class Meta:
        model = OrganizationProfile
        fields = "__all__"
