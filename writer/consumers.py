class QuizConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'quiz_room'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Expect: {"question": "...", "answer": "..."}
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'quiz_update',
                'question': data.get('question', ''),
                'answer': data.get('answer', '')
            }
        )

    async def quiz_update(self, event):
        await self.send(text_data=json.dumps({
            'question': event['question'],
            'answer': event['answer']
        }))
class TodoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'todo_room'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Expect: {"todos": [...]}
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'todo_update',
                'todos': data.get('todos', [])
            }
        )

    async def todo_update(self, event):
        await self.send(text_data=json.dumps({'todos': event['todos']}))
class WordCountConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'wordcount_room'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        count = data.get('count', 0)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'wordcount_update',
                'count': count
            }
        )

    async def wordcount_update(self, event):
        await self.send(text_data=json.dumps({'count': event['count']}))
class TypingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'typing_room'
        self.user = self.scope['user'].username if self.scope['user'].is_authenticated else 'Anonymous'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        is_typing = data.get('typing', False)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_update',
                'user': self.user,
                'typing': is_typing
            }
        )

    async def typing_update(self, event):
        await self.send(text_data=json.dumps({
            'user': event['user'],
            'typing': event['typing']
        }))
class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'presence_room'
        self.user = self.scope['user'].username if self.scope['user'].is_authenticated else 'Anonymous'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'presence_update',
                'user': self.user,
                'action': 'joined'
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'presence_update',
                'user': self.user,
                'action': 'left'
            }
        )

    async def receive(self, text_data):
        pass

    async def presence_update(self, event):
        await self.send(text_data=json.dumps({
            'user': event['user'],
            'action': event['action']
        }))
class WhiteboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'whiteboard_room'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Expect: {"draw": {x0, y0, x1, y1, color, width}}
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'whiteboard_draw',
                'draw': data.get('draw', {})
            }
        )

    async def whiteboard_draw(self, event):
        await self.send(text_data=json.dumps({'draw': event['draw']}))
class TitleConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'title_room'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        title = data.get('title', '')
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'title_update',
                'title': title
            }
        )

    async def title_update(self, event):
        await self.send(text_data=json.dumps({'title': event['title']}))
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        await self.channel_layer.group_add('chat', self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('chat', self.channel_name)

    async def receive(self, text_data):
        username = self.user.username if self.user.is_authenticated else 'Anonymous'
        message_data = {
            'type': 'chat_message',
            'message': text_data,
            'username': username
        }
        await self.channel_layer.group_send('chat', message_data)

    async def chat_message(self, event):
        response = {
            'message': event['message'],
            'username': event.get('username', 'Anonymous')
        }
        await self.send(text_data=json.dumps(response))

class PollConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'poll_room'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Expect: {"vote": "optionA"}
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'poll_update',
                'vote': data.get('vote', '')
            }
        )

    async def poll_update(self, event):
        await self.send(text_data=json.dumps({
            'vote': event['vote']
        }))

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("notifications", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("notifications", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get("message", "")
        # Broadcast to all in notifications group
        await self.channel_layer.group_send(
            "notifications",
            {
                "type": "notification_message",
                "message": message
            }
        )

    async def notification_message(self, event):
        await self.send(text_data=json.dumps({"message": event["message"]}))

class CollabConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.document_id = self.scope['url_route']['kwargs']['document_id']
        self.room_group_name = f'collab_{self.document_id}'
        self.user = self.scope['user'].username if self.scope['user'].is_authenticated else 'Anonymous'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        # Broadcast presence
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'presence_update',
                'user': self.user,
                'action': 'joined'
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        # Broadcast presence
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'presence_update',
                'user': self.user,
                'action': 'left'
            }
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get('event', 'edit')
        if event_type == 'edit':
            # Live editing broadcast
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'live_edit',
                    'content': data.get('content', ''),
                    'user': self.user
                }
            )
        elif event_type == 'save':
            # Document save broadcast
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'doc_save',
                    'user': self.user
                }
            )
        elif event_type == 'share':
            # Document share broadcast
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'doc_share',
                    'user': self.user
                }
            )

    async def live_edit(self, event):
        await self.send(text_data=json.dumps({
            'event': 'edit',
            'content': event['content'],
            'user': event['user']
        }))

    async def presence_update(self, event):
        await self.send(text_data=json.dumps({
            'event': 'presence',
            'user': event['user'],
            'action': event['action']
        }))

    async def doc_save(self, event):
        await self.send(text_data=json.dumps({
            'event': 'save',
            'user': event['user']
        }))

    async def doc_share(self, event):
        await self.send(text_data=json.dumps({
            'event': 'share',
            'user': event['user']
        }))
