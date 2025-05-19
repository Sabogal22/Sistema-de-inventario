
# 📦 Sistema de Inventario

Este es un sistema básico de inventario desarrollado como proyecto universitario. Utiliza **Django** para el backend y **React** para el frontend.

## 🛠 Tecnologías utilizadas

- ⚙️ **Backend**: [Django](https://www.djangoproject.com/) (Python)
- 💻 **Frontend**: [React](https://reactjs.org/) (JavaScript)
- 🗄️ **Base de datos**: SQLite (por defecto en Django)

## 📁 Estructura del proyecto

```
Sistema-de-inventario/
│
├── backend/      # Proyecto Django (API REST)
│
├── frontend/     # Aplicación React (interfaz de usuario)
│
└── README.md     # Este archivo
```

## 🚀 Cómo ejecutar el proyecto

### Requisitos previos

- Python 3.x
- Node.js y npm

### 1. Clonar el repositorio

```bash
git clone https://github.com/Sabogal22/Sistema-de-inventario.git
cd Sistema-de-inventario
```

### 2. Backend (Django)

```bash
cd backend
python -m venv env
source env/bin/activate  # En Windows: env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend (React)

En otra terminal:

```bash
cd frontend
npm install
npm start
```

La aplicación debería estar corriendo en:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

## 🎯 Objetivo

El objetivo del proyecto es permitir el registro, visualización y control básico de productos en inventario. Esta es una aplicación sencilla con fines educativos, creada para una asignatura universitaria.

## 📷 Capturas de pantalla

_Aquí puedes incluir algunas imágenes si lo deseas._

## 📄 Licencia

Este proyecto es de uso educativo. Puedes modificarlo libremente para fines académicos.

---

✏️ Desarrollado por [Sabogal22](https://github.com/Sabogal22)
