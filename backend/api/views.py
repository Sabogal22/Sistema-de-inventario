from rest_framework import generics, permissions
from rest_framework.serializers import ModelSerializer
from .models import User  # Usa el modelo personalizado de User

# 1️⃣ Serializador: Convierte los objetos de usuario en JSON
class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'is_staff']  # Solo mostramos estos campos

# 2️⃣ Vista para obtener la lista de usuarios
class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('id')  # Ordenamos por ID
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]  # Solo usuarios autenticados pueden acceder
