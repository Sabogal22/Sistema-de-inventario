from locust import HttpUser, task, between
from urllib.parse import urljoin

class ReadOnlyInventoryUser(HttpUser):
    """
    Usuario de prueba de carga para operaciones de solo lectura
    Realiza solo consultas GET sin modificar datos
    """
    wait_time = between(1, 3)  # Espera entre 1 y 3 segundos entre peticiones
    host = "https://sistema-de-inventario-9bcq.onrender.com"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        self.auth_token = None

    @task(5)  # Mayor frecuencia
    def get_all_items(self):
        """Obtener listado completo de ítems"""
        if self.auth_token:
            url = urljoin(self.host, "items/all/")
            self.client.get(url, headers=self.headers, name="GET /items/all")
    @task(2)
    def get_all_users(self):
        """Obtener listado de usuarios"""
        if self.auth_token:
            url = urljoin(self.host, "users/all/")
            self.client.get(url, headers=self.headers, name="GET /users/all")
    @task(1)
    def get_all_locations(self):
        """Obtener todas las ubicaciones"""
        if self.auth_token:
            url = urljoin(self.host, "location/all/")
            self.client.get(url, headers=self.headers, name="GET /location/all")
    @task(1)
    def get_all_categories(self):
        """Obtener todas las categorías"""
        if self.auth_token:
            url = urljoin(self.host, "category/all/")
            self.client.get(url, headers=self.headers, name="GET /category/all")
