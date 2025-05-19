
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

## VISTAS

Principal
<img width="1710" alt="Captura de pantalla 2025-05-05 a las 3 39 48 p  m" src="https://github.com/user-attachments/assets/bdeda48f-f32a-4f31-b959-665f68a22299" />

Detalles del Item
<img width="1710" alt="Captura de pantalla 2025-05-19 a las 2 13 43 p  m" src="https://github.com/user-attachments/assets/d2b3839e-fba9-41dd-a0b0-a108272eca28" />

## 📄 Licencia

Este proyecto es de uso educativo. Puedes modificarlo o utilizarlo libremente para fines académicos.

---

✏️ Desarrollado por [Sabogal22](https://github.com/Sabogal22)
