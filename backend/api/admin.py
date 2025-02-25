from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Notification, Location, Category, Status, Item, ItemMovement, ItemDisposal, ItemMaintenance

# Configuración personalizada para el modelo User
class CustomUserAdmin(UserAdmin):
  list_display = ('id', 'email', 'role', 'is_staff', 'is_active')  # Mostrar en la tabla
  search_fields = ('email', 'role')  # Habilita búsqueda por email y rol
  ordering = ('id',)  # Ordena por ID

  fieldsets = (
    (None, {'fields': ('email', 'password')}),
    ('Permissions', {'fields': ('role', 'is_staff', 'is_active', 'groups', 'user_permissions')}),
  )

  add_fieldsets = (
    (None, {
      'classes': ('wide',),
      'fields': ('email', 'role', 'password1', 'password2'),
    }),
  )

# Personalización de otros modelos
class NotificationAdmin(admin.ModelAdmin):
  list_display = ('id', 'user', 'message', 'is_read', 'created_at')
  list_filter = ('is_read',)
  search_fields = ('user__email', 'message')

class ItemAdmin(admin.ModelAdmin):
  list_display = ('id', 'name', 'category', 'location', 'status', 'qr_code')
  list_filter = ('category', 'location', 'status')
  search_fields = ('name', 'qr_code')

class ItemMovementAdmin(admin.ModelAdmin):
  list_display = ('id', 'item', 'old_location', 'new_location', 'user', 'date')
  list_filter = ('old_location', 'new_location', 'user')
  search_fields = ('item__name', 'user__email')

class ItemDisposalAdmin(admin.ModelAdmin):
  list_display = ('id', 'item', 'date', 'reason')
  search_fields = ('item__name', 'reason')

class ItemMaintenanceAdmin(admin.ModelAdmin):
  list_display = ('id', 'item', 'date', 'description', 'status')
  search_fields = ('item__name', 'description')

# Registrar modelos en Django Admin
admin.site.register(User, CustomUserAdmin)
admin.site.register(Notification, NotificationAdmin)
admin.site.register(Location)
admin.site.register(Category)
admin.site.register(Status)
admin.site.register(Item, ItemAdmin)
admin.site.register(ItemMovement, ItemMovementAdmin)
admin.site.register(ItemDisposal, ItemDisposalAdmin)
admin.site.register(ItemMaintenance, ItemMaintenanceAdmin)
