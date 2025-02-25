from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):
  def create_user(self, email, password=None, role="pasante"):
    if not email:
      raise ValueError("El usuario debe tener un correo electrónico")
        
    email = self.normalize_email(email)
    user = self.model(email=email, role=role)
    user.set_password(password)
    user.save(using=self._db)
    return user

  def create_superuser(self, email, password):
    user = self.create_user(email, password, role="admin")
    user.is_superuser = True
    user.is_staff = True
    user.save(using=self._db)
    return user

class User(AbstractBaseUser, PermissionsMixin):
  ROLE_CHOICES = (
    ("admin", "Admin"),
    ("pasante", "Pasante"),
  )

  email = models.EmailField(unique=True)
  password = models.CharField(max_length=128)
  role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="pasante")
    
  is_active = models.BooleanField(default=True)
  is_staff = models.BooleanField(default=False)

  objects = UserManager()

  USERNAME_FIELD = "email"
  REQUIRED_FIELDS = []

  def __str__(self):
    return self.email

# Notificaciones (1 usuario muchas notificaciones)
class Notification(models.Model):
  user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="notifications")
  message = models.TextField()
  is_read = models.BooleanField(default=False)
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"Notificación para {self.user.email}"

# Ubicaciones
class Location(models.Model):
  name = models.CharField(max_length=100)

  def __str__(self):
    return self.name

# Categorías de ítems
class Category(models.Model):
  name = models.CharField(max_length=100)

  def __str__(self):
    return self.name

# Estados de los ítems
class Status(models.Model):
  name = models.CharField(max_length=100)

  def __str__(self):
    return self.name

# Ítems (con relaciones a categoría, ubicación y estado)
class Item(models.Model):
  name = models.CharField(max_length=100)
  description = models.TextField(blank=True, null=True)
  image = models.ImageField(upload_to="items/", blank=True, null=True)
  category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="items")
  location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, related_name="items")
  status = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True, related_name="items")
  qr_code = models.CharField(max_length=255, unique=True)

  def __str__(self):
    return self.name

# Movimientos de ítems (1 usuario muchos movimientos, 1 movimiento muchas localizaciones, 1 ítem muchos movimientos)
class ItemMovement(models.Model):
  item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="movements")
  old_location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, related_name="old_movements")
  new_location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, related_name="new_movements")
  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="movements")
  date = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"{self.item.name} movido de {self.old_location} a {self.new_location}"

# Eliminación de ítems (1 ítem muchas eliminaciones)
class ItemDisposal(models.Model):
  item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="disposals")
  date = models.DateTimeField(auto_now_add=True)
  reason = models.TextField()

  def __str__(self):
    return f"Eliminación de {self.item.name}"

# Mantenimiento de ítems (1 ítem muchos mantenimientos)
class ItemMaintenance(models.Model):
  item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="maintenances")
  date = models.DateTimeField(auto_now_add=True)
  description = models.TextField()
  status = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True, related_name="maintenances")

  def __str__(self):
    return f"Mantenimiento de {self.item.name} el {self.date}"
