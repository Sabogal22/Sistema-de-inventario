from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from api.models import Notification, User, Location, Category, Item
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist
import json
from django.contrib.auth.hashers import make_password
from django.db.models import Q
from django.shortcuts import get_object_or_404

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
  user = request.user
  return Response({
    "username": user.username,
    "role": user.role
  })

# Obtener todas las notificaciones del usuario autenticado
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
  notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    
  notifications_data = [
    {
      "id": notif.id,
      "message": notif.message,
      "is_read": notif.is_read,
      "created_at": notif.created_at.strftime("%Y-%m-%d %H:%M:%S"),
    }
    for notif in notifications
  ]
    
  return Response({"notifications": notifications_data})

# Marcar todas las notificaciones como leídas
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_as_read(request):
  updated = Notification.objects.filter(
    user=request.user, 
    is_read=False
  ).update(is_read=True)
    
  return Response({
    "status": "success",
    "message": f"Se marcaron {updated} notificaciones como leídas",
    "updated_count": updated
  })

# Marcar una notificación específica como leída
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_as_read(request, notif_id):
  notification = get_object_or_404(Notification, id=notif_id, user=request.user)
    
  if not notification.is_read:
    notification.is_read = True
    notification.save()
    return Response({
      "status": "success",
      "message": "Notificación marcada como leída",
      "notification_id": notif_id
    })
  return Response({
    "status": "info",
    "message": "La notificación ya estaba marcada como leída",
    "notification_id": notif_id
  })

# Eliminar una notificación específica
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notif_id):
  notification = get_object_or_404(Notification, id=notif_id, user=request.user)
  notification.delete()
    
  return Response({
    "status": "success",
    "message": "Notificación eliminada correctamente",
    "deleted_id": notif_id
  })

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])  # Solo administradores pueden enviar
def send_notification(request):
    try:
        user_id = request.data.get('user_id')
        message = request.data.get('message')
        
        if not user_id or not message:
            return Response(
                {"error": "Se requieren user_id y message"}, 
                status=400
            )
        
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Usuario no encontrado"}, 
                status=404
            )
        
        notification = Notification.objects.create(
            user=user,
            message=message
        )
        
        return Response({
            "status": "success",
            "message": "Notificación enviada correctamente",
            "notification": {
                "id": notification.id,
                "message": notification.message,
                "created_at": notification.created_at.strftime("%Y-%m-%d %H:%M:%S")
            }
        })
    
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=500
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users(request):
  users = list(User.objects.all().values("id", "username", "email", "role"))
  print(users)  # 🔍 Verifica si la consulta devuelve datos
  return Response(users)

# Crear un nuevo usuario
@csrf_exempt
def create_user(request):
  if request.method == "POST":
    try:
      data = json.loads(request.body)

      # Validación de datos
      if not data.get("username") or not data.get("email") or not data.get("password") or not data.get("role"):
        return JsonResponse({"error": "Faltan datos obligatorios"}, status=400)

      # Crear el usuario con el rol
      user = User.objects.create(
        username=data["username"],
        email=data["email"],
        first_name=data.get("first_name", ""),
        last_name=data.get("last_name", ""),
        password=make_password(data["password"]),  # Hashear la contraseña
        role=data["role"]  # Asignar el rol correctamente
      )
      return JsonResponse({"message": "Usuario creado exitosamente", "id": user.id}, status=201)
        
    except json.JSONDecodeError:
      return JsonResponse({"error": "Datos inválidos"}, status=400)

  return JsonResponse({"error": "Método no permitido"}, status=405)

# Editar un usuario existente
@csrf_exempt
def update_user(request, pk):
  if request.method in ["PUT", "PATCH"]:
    try:
      data = json.loads(request.body)
      user = User.objects.get(pk=pk)
            
      # Verificar campos mínimos requeridos
      if not all(field in data for field in ['username', 'email', 'role']):
        return JsonResponse({"error": "Faltan datos obligatorios (username, email, role)"}, status=400)
            
      # Actualizar campos
      user.username = data['username']
      user.email = data['email']
      user.role = data['role']
            
      # Actualizar password solo si se proporciona y no está vacío
      if 'password' in data and data['password']:
        user.set_password(data['password'])
            
      user.save()
            
      return JsonResponse({
        "message": "Usuario actualizado correctamente",
        "user": {
          "id": user.id,
          "username": user.username,
          "email": user.email,
          "role": user.role
        }
      }, status=200)
            
    except User.DoesNotExist:
      return JsonResponse({"error": "Usuario no encontrado"}, status=404)
    except json.JSONDecodeError:
      return JsonResponse({"error": "Datos inválidos"}, status=400)
    except Exception as e:
      return JsonResponse({"error": str(e)}, status=400)
    
  return JsonResponse({"error": "Método no permitido"}, status=405)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, pk):
  try:
    user = User.objects.get(pk=pk)
        
    # Verificar permisos (opcional: que solo admins puedan eliminar)
    if request.user.role != 'admin':
      return Response({"error": "No tienes permisos para esta acción"}, status=403)
            
    user.delete()
    return Response({"message": "Usuario eliminado correctamente"})
        
  except ObjectDoesNotExist:
    return Response({"error": "Usuario no encontrado"}, status=404)
  except Exception as e:
    return Response({"error": str(e)}, status=500)

# Obtener todas las ubicaciones
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_location(request):
  locations = Location.objects.all().values("id", "name")
  return Response(list(locations))

# Crear una nueva ubicación
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_location(request):
  try:
    data = request.data
    if "name" not in data or not data["name"].strip():
      return Response({"error": "El campo 'name' es obligatorio"}, status=400)

    location = Location.objects.create(name=data["name"])
    return Response({"message": "Ubicación creada exitosamente", "id": location.id}, status=201)

  except Exception as e:
    return Response({"error": str(e)}, status=500)

# Actualizar una ubicación existente
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_location(request, pk):
  try:
    data = request.data
    location = Location.objects.get(pk=pk)

    if "name" in data and data["name"].strip():
      location.name = data["name"]
      location.save()
      return Response({"message": "Ubicación actualizada correctamente"})
    else:
      return Response({"error": "El campo 'name' es obligatorio"}, status=400)

  except ObjectDoesNotExist:
    return Response({"error": "Ubicación no encontrada"}, status=404)
  except Exception as e:
    return Response({"error": str(e)}, status=500)

# Eliminar una ubicación
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_location(request, pk):
  try:
    location = Location.objects.get(pk=pk)
    location.delete()
    return Response({"message": "Ubicación eliminada correctamente"})
  except ObjectDoesNotExist:
    return Response({"error": "Ubicación no encontrada"}, status=404)
  except Exception as e:
    return Response({"error": str(e)}, status=500)
  
# Obtiene todas las categorías
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_category(request):
  categories = Category.objects.all().values("id", "name")
  return Response(list(categories))

# Crear una nueva categoría
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_categiory(request):
  try:
    data = request.data
    if "name" not in data or not data["name"].strip():
      return Response({"error": "El campo 'name' es obligatorio"}, status=400)

    category = Category.objects.create(name=data["name"])
    return Response({"message": "Categoría creada exitosamente", "id": category.id}, status=201)

  except Exception as e:
    return Response({"error": str(e)}, status=500)

# Actualizar una categoría existente
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_category(request, pk):
  try:
    data = request.data
    category = Category.objects.get(pk=pk)

    if "name" in data and data["name"].strip():
      category.name = data["name"]
      category.save()
      return Response({"message": "Categoría actualizada correctamente"})
    else:
      return Response({"error": "El campo 'name' es obligatorio"}, status=400)

  except ObjectDoesNotExist:
    return Response({"error": "Categoría no encontrada"}, status=404)
  except Exception as e:
    return Response({"error": str(e)}, status=500)

# Eliminar una ubicación
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_category(request, pk):
  try:
    category = Category.objects.get(pk=pk)
    category.delete()
    return Response({"message": "Categoría eliminada correctamente"})
  except ObjectDoesNotExist:
    return Response({"error": "Categoría no encontrada"}, status=404)
  except Exception as e:
    return Response({"error": str(e)}, status=500)

# Buscar items por nombre o descripción
@csrf_exempt
def search_items(request):
  term = request.GET.get('q', '')
  items = Item.objects.filter(Q(name__icontains=term) | Q(description__icontains=term))

  data = [
    {
      "id": item.id,
      "name": item.name,
      "description": item.description,
      "location": item.location.name,
      "category": item.category.name,
      "status": item.status.name,
    }
    for item in items
  ]

  return JsonResponse(data, safe=False)

# Tarjetas del dashboard
@api_view(['GET'])
def dashboard_summary(request):
  total = Item.objects.count()
  Disponible = Item.objects.filter(status__name__iexact="Disponible").count()
  Mantenimiento = Item.objects.filter(status__name__iexact="Mantenimiento").count()
  no_disponibles = Item.objects.filter(status__name__iexact="No disponible").count()

  return Response({
    "total_items": total,
    "Disponible": Disponible,
    "Mantenimiento": Mantenimiento,
    "no_disponibles": no_disponibles
  })

# Obtener todos los items
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_item(request):
  items = Item.objects.select_related('category', 'location', 'status').all()
  data = []

  for item in items:
    data.append({
      'id': item.id,
      'name': item.name,
      'description': item.description,
      'category': item.category.name,
      'location': item.location.name,
      'status': item.status.name,
      'qrCode': item.qr_code,
    })

  return JsonResponse(data, safe=False)

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def item_detail(request, id):
    try:
        # Obtenemos el ítem con todas las relaciones necesarias
        item = Item.objects.select_related(
            'category', 
            'location', 
            'status'
        ).get(pk=id)
        
        # Construimos la respuesta manualmente
        data = {
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'category': {
                'id': item.category.id,
                'name': item.category.name
            },
            'location': {
                'id': item.location.id,
                'name': item.location.name
            },
            'status': {
                'id': item.status.id,
                'name': item.status.name
            },
            'qr_code': item.qr_code,
            'created_at': item.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            # Agrega más campos si son necesarios
        }
        
        # Si el ítem tiene imagen, agregamos la URL
        if item.image:
            data['image'] = request.build_absolute_uri(item.image.url)
        
        return Response(data)
        
    except Item.DoesNotExist:
        return Response(
            {"error": "Ítem no encontrado"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )