from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
  ROLE_CHOICES = [
    ('admin', 'Administrador'),
    ('passant', 'Pasante'),
  ]
  role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='pasante')

  def is_admin(self):
    return self.role == 'admin'
