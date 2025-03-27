from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from api.models import Notification, User

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
  user = request.user
  notifications = Notification.objects.filter(user=user).order_by('-created_at')

  notifications_data = [
    {
      "id": notif.id,
      "message": notif.message,
      "is_read": notif.is_read,
      "created_at": notif.created_at.strftime("%Y-%m-%d %H:%M:%S"),
    }
    for notif in notifications
  ]

  return Response(notifications_data)

# Marcar todas las notificaciones como leídas
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_as_read(request):
  user = request.user
  Notification.objects.filter(user=user, is_read=False).update(is_read=True)
  return Response({"message": "Todas las notificaciones han sido marcadas como leídas."})

# Marcar una notificación específica como leída
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_as_read(request, notif_id):
  updated = Notification.objects.filter(id=notif_id, user=request.user, is_read=False).update(is_read=True)
    
  if updated:
    return Response({"message": "Notificación marcada como leída."})
  return Response({"error": "Notificación no encontrada."}, status=404)

# Eliminar una notificación específica
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notif_id):
  notification = Notification.objects.filter(id=notif_id, user=request.user).first()
    
  if notification:
    notification.delete()
    return Response({"message": "Notificación eliminada."})
    
  return Response({"error": "Notificación no encontrada."}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users(request):
  users = list(User.objects.all().values("id", "username", "email", "role"))
  print(users)  # 🔍 Verifica si la consulta devuelve datos
  return Response(users)
