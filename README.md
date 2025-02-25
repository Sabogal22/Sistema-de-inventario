# 📦 Inventory System - FET

## 📖 Descripción
Este proyecto es una API para la gestión de inventarios utilizando **Django Rest Framework (DRF)**. Permite manejar usuarios, ubicaciones, categorías, ítems y su historial de movimientos, mantenimientos y disposiciones.

## 🚀 Tecnologías
- **Python 3.9+**
- **Django 4+**
- **Django Rest Framework (DRF)**
- **PostgreSQL o SQLite**
- **Simple JWT para autenticación**

## 📋 Requisitos previos
Antes de instalar el proyecto, asegúrate de tener instalado:
- **Python 3.9+**
- **pip y virtualenv**
- **PostgreSQL** (si usas SQLite, este paso no es necesario)

## ⚙️ Instalación
Sigue estos pasos para instalar el proyecto en tu máquina local:

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/SABOGAL22/Sistema-de-inventario.git
cd tu_repositorio
```

### 2️⃣ Crear y activar un entorno virtual
```bash
python -m venv env
source env/bin/activate  # En Windows: env\Scripts\activate
```

### 3️⃣ Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4️⃣ Configurar base de datos
Si usas PostgreSQL, modifica el archivo `settings.py` en la sección `DATABASES`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'inventory_db',
        'USER': 'tu_usuario',
        'PASSWORD': 'tu_contraseña',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```
Para SQLite, el valor predeterminado en Django funcionará sin cambios.

### 5️⃣ Aplicar migraciones y crear superusuario
```bash
python manage.py migrate
python manage.py createsuperuser
```

### 6️⃣ Ejecutar el servidor
```bash
python manage.py runserver
```

## 🔐 Autenticación
Usamos **JWT (JSON Web Token)**. Para obtener un token de acceso:
```http
POST /api/token/
```
```json
{
    "email": "admin@example.com",
    "password": "tu_contraseña"
}
```
Esto devuelve:
```json
{
    "refresh": "token_de_refresh",
    "access": "token_de_acceso"
}
```
Luego, para acceder a las rutas protegidas, usa el token:
```http
Authorization: Bearer tu_token_de_acceso
```

## 📌 Endpoints principales
### 1️⃣ Autenticación
| Método | Ruta               | Descripción                 |
|--------|-------------------|-----------------------------|
| POST   | `/api/token/`      | Obtener token de acceso    |
| POST   | `/api/token/refresh/` | Refrescar token          |

### 2️⃣ Usuarios
| Método | Ruta             | Descripción                  |
|--------|-----------------|------------------------------|
| GET    | `/api/users/`    | Listar usuarios (requiere autenticación) |

## 📂 Estructura del proyecto
```
project_root/
│── api/                 # Aplicación principal
│   ├── migrations/       # Migraciones de base de datos
│   ├── models.py         # Modelos de la base de datos
│   ├── serializers.py    # Serializadores DRF
│   ├── views.py          # Vistas de la API
│── config/              # Configuración del proyecto
│── manage.py            # Archivo principal Django
│── requirements.txt     # Dependencias del proyecto
```

## 🤝 Contribución
Si deseas contribuir, por favor sigue estos pasos:
1. Crea un **fork** del repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva_funcionalidad`).
3. Realiza tus cambios y sube los commits (`git commit -m 'Añadir nueva funcionalidad'`).
4. Envía un **pull request**.

## 📧 Contacto
Si tienes preguntas o sugerencias, contacta a: **neythan_sabogalga@fet.edu.co**

---
¡Gracias por contribuir a este proyecto! 🚀
