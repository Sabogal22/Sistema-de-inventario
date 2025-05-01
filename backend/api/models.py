from django.db import models
from django.contrib.auth.models import AbstractUser

# Modelo de Usuario
class User(AbstractUser):
    ROLES = (
        ('admin', 'Admin'),
        ('pasante', 'Pasante'),
    )
    role = models.CharField(max_length=50, choices=ROLES, default='pasante')

    def __str__(self):
        return self.username

# Modelo de Notificación
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    # Elimina los campos sender y recipient si no los necesitas
    # O déjalos si realmente los vas a usar para mensajería

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notificación para {self.user.username}: {self.message}"

# Modelo de Ubicación
class Location(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

# Modelo de Categoría
class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

# Modelo de Estado
class Status(models.Model):
    class StatusChoices(models.TextChoices):
        DISPONIBLE = 'Disponible', 'Disponible'
        MANTENIMIENTO = 'Mantenimiento', 'Mantenimiento'
        NO_DISPONIBLE = 'No disponible', 'No disponible'
        BAJO_STOCK = 'Bajo stock', 'Bajo stock'
        AGOTADO = 'Agotado', 'Agotado'

    name = models.CharField(
        max_length=100,
        choices=StatusChoices.choices,
        default=StatusChoices.DISPONIBLE
    )

    def __str__(self):
        return self.name

# Modelo de Ítem
class Item(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='items/', null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items')
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='items')
    status = models.ForeignKey(Status, on_delete=models.CASCADE, related_name='items')
    qr_code = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Nuevos campos para gestión de stock
    stock = models.PositiveIntegerField(default=1, verbose_name="Cantidad en inventario")
    min_stock = models.PositiveIntegerField(default=1, verbose_name="Stock mínimo")
    responsible_user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Usuario responsable",
        related_name='responsible_items'
    )

    def __str__(self):
        return f"{self.name} (Stock: {self.stock})"
    
    @property
    def is_low_stock(self):
        """Retorna True si el stock está por debajo del mínimo"""
        return self.stock < self.min_stock
    
    @property
    def stock_status(self):
        """Retorna el estado del stock"""
        if self.stock == 0:
            return "Agotado"
        elif self.is_low_stock:
            return "Bajo stock"
        return "Disponible"

# Modelo de Movimiento de Ítem
class ItemMovement(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='movements')
    old_location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='old_movements')
    new_location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='new_movements')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='movements')
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Movimiento de {self.item.name} por {self.user.username}"

# Modelo de Desecho de Ítem
class ItemDisposal(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='disposals')
    date = models.DateTimeField(auto_now_add=True)
    reason = models.TextField()

    def __str__(self):
        return f"Desecho de {self.item.name}"

# Modelo de Mantenimiento de Ítem
class ItemMaintenance(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='maintenances')
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField()
    status = models.CharField(max_length=100)

    def __str__(self):
        return f"Mantenimiento de {self.item.name}"