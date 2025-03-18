from django.contrib import admin
from .models import User, Notification, Location, Category, Status, Item, ItemMovement, ItemDisposal, ItemMaintenance

admin.site.register(User)
admin.site.register(Notification)
admin.site.register(Location)
admin.site.register(Category)
admin.site.register(Status)
admin.site.register(Item)
admin.site.register(ItemMovement)
admin.site.register(ItemDisposal)
admin.site.register(ItemMaintenance)