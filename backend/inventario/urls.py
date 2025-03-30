from django.urls import path
from django.contrib import admin
from api.views import (
    get_user, get_all_users, create_user, update_user,
    get_notifications, mark_all_as_read, mark_as_read, delete_notification, delete_user
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Autenticación con JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Usuarios
    path('user/', get_user, name='get_user'),
    path('users/all/', get_all_users, name='get_all_users'),
    path("users/create/", create_user, name="users_create"),
    path("users/<int:pk>/", update_user, name="users_update"),
    path('users/delete/<int:pk>/', delete_user, name='delete-user'),

    # Notificaciones
    path('notifications/', get_notifications, name='get_notifications'),
    path('notifications/mark-all/', mark_all_as_read, name='mark_all_as_read'),
    path('notifications/mark/<int:notif_id>/', mark_as_read, name='mark_as_read'),
    path('notifications/delete/<int:notif_id>/', delete_notification, name='delete_notification'),
]
