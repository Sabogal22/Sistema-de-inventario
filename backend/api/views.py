from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from api.models import Notification, User, Location, Category, Item, StockHistory, Status
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist
import json
from django.contrib.auth.hashers import make_password
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.pagination import PageNumberPagination
from django.core.serializers.json import DjangoJSONEncoder
from rest_framework import status
from django.utils import timezone
from rest_framework.views import APIView
from django.db import transaction
import logging
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

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


@receiver(post_save, sender=Item)
def check_low_stock(sender, instance, **kwargs):
  # Notificar cuando el stock esté bajo
  if instance.is_low_stock:
    # Notificar al usuario responsable si existe
    if instance.responsible_user:
      Notification.objects.create(
        user=instance.responsible_user,
        message=f"¡Alerta! Producto {instance.name} con bajo stock ({instance.stock} unidades)"
      )
        
    # Notificar también a los administradores
    admins = User.objects.filter(role='admin')
    for admin in admins:
      Notification.objects.create(
        user=admin,
        message=f"¡Alerta! Producto {instance.name} con bajo stock ({instance.stock} unidades)"
      )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users(request):
  users = list(User.objects.all().values("id", "username", "email", "role"))
  print(users)
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
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
  total = Item.objects.count()
  disponible = Item.objects.filter(status__name__iexact="Disponible").count()
  mantenimiento = Item.objects.filter(status__name__iexact="Mantenimiento").count()
  no_disponibles = Item.objects.filter(status__name__iexact="No disponible").count()

  return Response({
    "total_items": total,
    "Disponible": disponible,
    "Mantenimiento": mantenimiento,
    "no_disponibles": no_disponibles
  })

class ItemPagination(PageNumberPagination):
  page_size = 10
  page_size_query_param = 'page_size'
  max_page_size = 100

# Obtener todos los items
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_item(request):
  items = Item.objects.select_related(
    'category', 
    'location', 
    'status',
    'responsible_user'
  ).all().order_by('name')
    
  data = []
  for item in items:
    item_data = {
      'id': item.id,
      'name': item.name,
      'description': item.description,
      'image': request.build_absolute_uri(item.image.url) if item.image else None,
      'category': item.category.name if item.category else None,
      'location': item.location.name if item.location else None,
      'status': item.status.name if item.status else None,
      'qr_code': item.qr_code,
      'created_at': item.created_at.strftime('%Y-%m-%d %H:%M:%S'),
      'stock': item.stock,
      'min_stock': item.min_stock,
      'is_low_stock': item.is_low_stock,
      'stock_status': item.stock_status,
      'responsible_user': item.responsible_user.username if item.responsible_user else None
    }
    data.append(item_data)
    
  return JsonResponse(data, safe=False, encoder=DjangoJSONEncoder)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_item(request, item_id):
  item = get_object_or_404(Item, id=item_id)
    
  # Verificar si el usuario es el responsable o es superusuario
  if not (request.user.is_superuser or item.responsible_user == request.user):
    return Response(
      {"error": "No tienes permisos para eliminar este item"}, 
      status=status.HTTP_403_FORBIDDEN
    )
    
  item.delete()
    
  return Response({
    "status": "success",
    "message": "Item eliminado correctamente",
    "deleted_id": item_id
  })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def item_detail(request, id):
  try:
    item = Item.objects.select_related(
      'category', 
      'location', 
      'status',
      'responsible_user'
    ).get(pk=id)

    data = {
      'id': item.id,
      'name': item.name,
      'description': item.description,
      'stock': item.stock,
      'min_stock': item.min_stock,
      'is_low_stock': item.is_low_stock,
      'stock_status': item.stock_status,
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
      'created_at': item.created_at,
      'responsible_user': None,
      'image': request.build_absolute_uri(item.image.url) if item.image else None
    }

    if item.responsible_user:
      data['responsible_user'] = {
        'id': item.responsible_user.id,
        'username': item.responsible_user.username,
        'role': item.responsible_user.role or 'Usuario'
      }
            
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

logger = logging.getLogger(__name__)
class UpdateStockView(APIView):
  permission_classes = [IsAuthenticated]

  @transaction.atomic
  def post(self, request, item_id):
    try:
      # Validación básica de datos de entrada
      if not request.data:
        logger.error("Datos de solicitud vacíos")
        return Response(
          {'error': 'No se proporcionaron datos'},
          status=status.HTTP_400_BAD_REQUEST
        )

      item = get_object_or_404(Item, id=item_id)
      action_type = request.data.get('type', '').lower()
      quantity = request.data.get('quantity')

      logger.info(f"Intento de actualización: {action_type} {quantity} unidades para ítem {item_id}")

      # Validación exhaustiva
      if action_type not in ['add', 'subtract']:
        error_msg = f"Tipo de acción inválida: {action_type}"
        logger.warning(error_msg)
        return Response(
          {'error': error_msg},
          status=status.HTTP_400_BAD_REQUEST
        )

      try:
        quantity = int(quantity)
        if quantity <= 0:
          raise ValueError("La cantidad debe ser positiva")
      except (ValueError, TypeError) as e:
        logger.warning(f"Error en cantidad: {str(e)}")
        return Response(
          {'error': 'La cantidad debe ser un número entero positivo'},
          status=status.HTTP_400_BAD_REQUEST
        )

      # Lógica de actualización de stock
      old_stock = item.stock
            
      if action_type == 'add':
        new_stock = old_stock + quantity
      else:  # subtract
        if old_stock < quantity:
          error_msg = f"Stock insuficiente (disponible: {old_stock}, requerido: {quantity})"
          logger.warning(error_msg)
          return Response(
            {'error': error_msg},
            status=status.HTTP_400_BAD_REQUEST
          )
        new_stock = old_stock - quantity

      # Actualización en base de datos
      item.stock = new_stock
      item.save()

      # Registrar en historial
      history_entry = StockHistory.objects.create(
        item=item,
        action=action_type,
        quantity=quantity,
        old_stock=old_stock,
        new_stock=new_stock,
        user=request.user.username,
        date=timezone.now()
      )

      logger.info(f"Stock actualizado correctamente para ítem {item_id}. Nuevo stock: {new_stock}")

      return Response({
        'success': True,
        'message': 'Stock actualizado correctamente',
        'stock': new_stock,
        'history_id': history_entry.id
      }, status=status.HTTP_200_OK)

    except Exception as e:
      logger.error(f"Error crítico al actualizar stock: {str(e)}", exc_info=True)
      return Response(
        {'error': 'Error interno del servidor'},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
      )

# Vistas para el formulario de creación
class CategoryListAPIView(APIView):
  def get(self, request):
    categories = Category.objects.all().values('id', 'name')
    return Response(list(categories))

class LocationListAPIView(APIView):
  def get(self, request):
    locations = Location.objects.all().values('id', 'name')
    return Response(list(locations))

class StatusListAPIView(APIView):
  def get(self, request):
    statuses = Status.objects.all().values('id', 'name')
    return Response(list(statuses))

class UserListAPIView(APIView):
  def get(self, request):
    users = User.objects.all().values('id', 'username')
    return Response(list(users))

def get_all_status(request):
  statuses = Status.objects.all().values('id', 'name')
  return JsonResponse(list(statuses), safe=False)

class ItemCreateAPIView(APIView):
  def post(self, request):
    try:
      # Procesar los datos del formulario
      data = request.data
            
      # Validar datos requeridos
      required_fields = ['name', 'category', 'location', 'status', 'stock', 'min_stock']
      for field in required_fields:
        if field not in data:
          return Response({
            'success': False,
            'message': f'El campo {field} es requerido'
          }, status=400)
            
      # Crear el ítem
      item = Item.objects.create(
        name=data.get('name'),
        description=data.get('description', ''),
        category_id=data.get('category'),
        location_id=data.get('location'),
        status_id=data.get('status'),
        stock=data.get('stock', 1),
        min_stock=data.get('min_stock', 1),
        responsible_user_id=data.get('responsible_user'),
        qr_code=data.get('qr_code', '')
      )
            
      # Procesar la imagen si existe
      if 'image' in request.FILES:
        item.image = request.FILES['image']
        item.save()
            
      return Response({
        'success': True,
        'message': 'Ítem creado exitosamente',
        'item_id': item.id
      })
            
    except Exception as e:
      return Response({
        'success': False,
        'message': str(e)
      }, status=400)

@csrf_exempt
@require_http_methods(["PUT", "PATCH", "POST"])
def update_item(request, item_id):
  try:
    item = Item.objects.get(id=item_id)
  except Item.DoesNotExist:
    return JsonResponse({'error': 'Item not found'}, status=404)

  # Initialize data and files
  data = {}
  files = {}

  if 'multipart/form-data' in request.content_type:
    # Handle form data
    data = {k: v[0] if isinstance(v, list) else v for k, v in request.POST.lists()}
    files = request.FILES
  else:
    try:
      data = json.loads(request.body.decode('utf-8')) if request.body else {}
    except json.JSONDecodeError:
      return JsonResponse({'error': 'Invalid JSON data'}, status=400)

  # Validate required fields
  required_fields = ['name', 'stock', 'min_stock', 'category', 'location', 'status']
  missing_fields = [field for field in required_fields if field not in data]
  if missing_fields:
    return JsonResponse({'error': f'Missing required fields: {", ".join(missing_fields)}'}, status=400)

  try:
    # Convert and validate numeric fields
    stock = int(data['stock'])
    min_stock = int(data['min_stock'])
    category_id = int(data['category'])
    location_id = int(data['location'])
    status_id = int(data['status'])

    if stock < 0 or min_stock < 1:
      raise ValueError("Invalid stock values")
            
  except (ValueError, TypeError) as e:
    return JsonResponse({'error': f'Invalid numeric values: {str(e)}'}, status=400)

  # Update the item
  try:
    item.name = data['name']
    item.description = data.get('description', item.description)
    item.qr_code = data.get('qr_code', item.qr_code)
    item.stock = stock
    item.min_stock = min_stock

    # Update relationships
    item.category = Category.objects.get(id=category_id)
    item.location = Location.objects.get(id=location_id)
    item.status = Status.objects.get(id=status_id)

    # Handle responsible user
    responsible_user = data.get('responsible_user', '')
    if responsible_user and str(responsible_user).isdigit():
      item.responsible_user = User.objects.get(id=int(responsible_user))
    else:
      item.responsible_user = None

    # Handle image
    if 'image' in files:
      if item.image:
        item.image.delete(save=False)
      item.image = files['image']
    elif data.get('image') == '':
      if item.image:
        item.image.delete(save=False)
      item.image = None

    item.save()
        
    return JsonResponse({
      'success': True,
      'message': 'Item updated successfully',
      'item_id': item.id
    })

  except Exception as e:
    return JsonResponse({
      'error': 'Error updating item',
      'details': str(e)
    }, status=500)