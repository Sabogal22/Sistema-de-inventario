from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.serializers import ModelSerializer

# 1️⃣ Serializador: Convierte los objetos de usuario en JSON
class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']  # Solo mostramos estos campos

# 2️⃣ Vista para obtener la lista de usuarios
class UserListView(APIView):
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden ver esto

    def get(self, request):
        users = User.objects.all()  # Traemos todos los usuarios
        serializer = UserSerializer(users, many=True)  # Convertimos a JSON
        return Response(serializer.data)  # Devolvemos la respuesta JSON
