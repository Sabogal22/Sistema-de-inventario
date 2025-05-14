from locust import HttpUser, task, between, events
import random
import string
import logging
import json
from urllib.parse import urljoin

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("locust")

class InventoryLoadTest(HttpUser):
    """
    Clase de usuario para pruebas de carga del sistema de inventario.
    Simula operaciones CRUD con autenticación JWT.
    """
    wait_time = between(1, 3)  # Tiempo de espera entre tareas
    host = "https://sistema-de-inventario-9bcq.onrender.com"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        self.auth_token = None
        self.created_users = []
        self.created_locations = []
        self.created_categories = []

    def on_start(self):
        """Autenticación al inicio de la sesión de prueba"""
        self.authenticate()

    def authenticate(self):
        """Método para autenticación JWT"""
        auth_url = urljoin(self.host, "api/token/")
        auth_data = {
            "username": "Sabogal",
            "password": "123456789"
        }

        try:
            with self.client.post(
                auth_url,
                json=auth_data,
                headers=self.headers,
                catch_response=True,
                name="Auth - Obtener Token"
            ) as response:
                if response.status_code == 200:
                    self.auth_token = response.json().get("access")
                    if self.auth_token:
                        self.headers["Authorization"] = f"Bearer {self.auth_token}"
                        logger.info("Autenticación exitosa")
                    else:
                        response.failure("No se recibió token en la respuesta")
                        logger.error("Respuesta de autenticación no contiene token")
                else:
                    response.failure(f"Error de autenticación: {response.status_code}")
                    logger.error(f"Error en autenticación. Código: {response.status_code}")

        except Exception as e:
            logger.error(f"Excepción durante autenticación: {str(e)}")
            events.request.fire(
                request_type="POST",
                name="Auth - Obtener Token",
                response_time=0,
                response_length=0,
                exception=e,
            )

    @task(3)  # Mayor peso (3:1) para operaciones de lectura
    def get_all_users(self):
        """Obtener lista de usuarios"""
        if not self.auth_token:
            self.authenticate()
            return

        url = urljoin(self.host, "users/all/")
        with self.client.get(
            url,
            headers=self.headers,
            catch_response=True,
            name="Users - Listar todos"
        ) as response:
            if response.status_code == 200:
                try:
                    users = response.json()
                    logger.info(f"Obtenidos {len(users)} usuarios")
                except json.JSONDecodeError:
                    response.failure("Respuesta no es JSON válido")
            elif response.status_code == 401:  # Token expirado
                self.authenticate()

    @task(1)
    def create_user(self):
        """Crear nuevo usuario"""
        if not self.auth_token:
            self.authenticate()
            return

        # Generar datos aleatorios
        random_username = "loadtest_" + ''.join(random.choices(string.ascii_lowercase, k=5))
        user_data = {
            "first_name": random_username,
            "last_name": random_username,
            "username": random_username,
            "email": f"{random_username}@test.com",
            "password": "testpass123",
            "role": "pasante"
        }

        url = urljoin(self.host, "users/create/")
        with self.client.post(
            url,
            json=user_data,
            headers=self.headers,
            catch_response=True,
            name="Users - Crear usuario"
        ) as response:
            if response.status_code in [200, 201]:
                self.created_users.append(random_username)
                logger.info(f"Usuario creado: {random_username}")
            elif response.status_code == 401:  # Token expirado
                self.authenticate()

    @task(1)
    def create_location(self):
        """Crear nueva ubicación"""
        if not self.auth_token:
            self.authenticate()
            return

        location_name = "Loc_" + ''.join(random.choices(string.ascii_uppercase, k=4))
        location_data = {"name": location_name}

        url = urljoin(self.host, "location/create/")
        with self.client.post(
            url,
            json=location_data,
            headers=self.headers,
            catch_response=True,
            name="Locations - Crear ubicación"
        ) as response:
            if response.status_code in [200, 201]:
                self.created_locations.append(location_name)
                logger.info(f"Ubicación creada: {location_name}")

    @task(1)
    def create_category(self):
        """Crear nueva categoría"""
        if not self.auth_token:
            self.authenticate()
            return

        category_name = "Cat_" + ''.join(random.choices(string.ascii_uppercase, k=4))
        category_data = {"name": category_name}

        url = urljoin(self.host, "category/create/")
        with self.client.post(
            url,
            json=category_data,
            headers=self.headers,
            catch_response=True,
            name="Categories - Crear categoría"
        ) as response:
            if response.status_code in [200, 201]:
                self.created_categories.append(category_name)
                logger.info(f"Categoría creada: {category_name}")

    def on_stop(self):
        """Método ejecutado al finalizar la prueba"""
        logger.info(f"Resumen - Usuarios creados: {len(self.created_users)}")
        logger.info(f"Resumen - Ubicaciones creadas: {len(self.created_locations)}")
        logger.info(f"Resumen - Categorías creadas: {len(self.created_categories)}")
