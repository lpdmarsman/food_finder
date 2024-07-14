from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("ws/chat/", views.view_chat, name="view_chat"),
    path("ws/chat/<str:room_name>/", views.room, name="room")
]