from django.urls import path
from django.contrib import admin
from api.views import (get_user, get_notifications, mark_all_as_read, mark_as_read, delete_notification, get_all_users)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Login
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Refrescar token
    path('user/', get_user, name='get_user'),

    # Rutas para notificaciones
    path('notifications/', get_notifications, name='get_notifications'),
    path('notifications/mark-all/', mark_all_as_read, name='mark_all_as_read'),
    path('notifications/mark/<int:notif_id>/', mark_as_read, name='mark_as_read'),
    path('notifications/delete/<int:notif_id>/', delete_notification, name='delete_notification'),
    path('users/all/', get_all_users, name="get_all_users"),
]
