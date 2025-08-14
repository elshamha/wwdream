
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/collab/(?P<document_id>\d+)/$', consumers.CollabConsumer.as_asgi()),
    re_path(r'ws/chat/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/poll/$', consumers.PollConsumer.as_asgi()),
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
    re_path(r'ws/title/$', consumers.TitleConsumer.as_asgi()),
    re_path(r'ws/whiteboard/$', consumers.WhiteboardConsumer.as_asgi()),
    re_path(r'ws/presence/$', consumers.PresenceConsumer.as_asgi()),
    re_path(r'ws/typing/$', consumers.TypingConsumer.as_asgi()),
    re_path(r'ws/wordcount/$', consumers.WordCountConsumer.as_asgi()),
    re_path(r'ws/todo/$', consumers.TodoConsumer.as_asgi()),
    re_path(r'ws/quiz/$', consumers.QuizConsumer.as_asgi()),
]
