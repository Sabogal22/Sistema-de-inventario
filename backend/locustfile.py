from locust import HttpUser, task, between
import random
import string

class MyLoadTestUser(HttpUser):
  wait_time = between(1, 3)

  def on_start(self):
    # Autenticación JWT: obtener token antes de comenzar
    response = self.client.post("/api/token/", json={
      "username": "Sabogal",
      "password": "123456789"
    })
    token = response.json()["access"]
    self.client.headers.update({"Authorization": f"Bearer {token}"})

  @task
  def get_all_users(self):
    self.client.get("/users/all/")

  @task
  def create_user(self):
    random_username = "user_" + ''.join(random.choices(string.ascii_lowercase, k=5))
    self.client.post("/users/create/", json={
      "first_name": random_username,
      "last_name": random_username,
      "username": random_username,
      "email": f"{random_username}@test.com",
      "password": "testpass123",
      "role": "pasante"
    })

  @task
  def create_location(self):
    self.client.post("/location/create/", json={
      "name": "Test Location"
    })

  @task
  def create_category(self):
    self.client.post("/category/create/", json={
      "name": "Test Category"
    })