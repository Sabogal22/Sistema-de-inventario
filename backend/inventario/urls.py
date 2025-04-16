from django.urls import path
from django.contrib import admin
from api.views import (
    get_user, get_all_users, create_user, update_user, delete_user,
    get_all_location, create_location, update_location, delete_location,
    get_notifications, mark_all_as_read, mark_as_read, delete_notification,
    get_all_category, create_categiory, update_category, delete_category,
    search_items, dashboard_summary
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Autenticación con JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Usuarios
    path('user/', get_user, name='get_  user'),
    path('users/all/', get_all_users, name='get_all_users'),
    path("users/create/", create_user, name="users_create"),
    path("users/<int:pk>/", update_user, name="users_update"),
    path('users/delete/<int:pk>/', delete_user, name='delete-user'),

    # Localización
    path('location/all/', get_all_location, name='get_all_location'),
    path('location/create/', create_location, name='create_location'),
    path('location/<int:pk>/update/', update_location, name='update_location'),
    path('location/<int:pk>/delete/', delete_location, name='delete_location'),

    # Categoría
    path('category/all/', get_all_category, name='get_all_category'),
    path('category/create/', create_categiory, name='create_category'),
    path('category/<int:pk>/update/', update_category, name='update_category'),
    path('category/<int:pk>/delete/', delete_category, name='delete_category'),

    # Notificaciones
    path('notifications/', get_notifications, name='get_notifications'),
    path('notifications/mark-all/', mark_all_as_read, name='mark_all_as_read'),
    path('notifications/mark/<int:notif_id>/', mark_as_read, name='mark_as_read'),
    path('notifications/delete/<int:notif_id>/', delete_notification, name='delete_notification'),

    # Busqueda del Item
    path('items/search/', search_items, name='search_items'),

    # Todos los items
    path('dashboard/summary/', dashboard_summary, name='dashboard-summary'),
]
