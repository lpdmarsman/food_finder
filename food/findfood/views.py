from django.shortcuts import render, HttpResponse


# Create your views here.

def view_chat(request):
    return render(request, "chat/chat.html")

def room(request, room_name):
    hard_coded_value = "yuh"
    return render(request, "chat/room.html", {"room_name": room_name, "hard_code": hard_coded_value})

# Home Page
def home(request):
    return render(request, "index.html")