import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ThemeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'theme_room'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Expect: {"theme": "light" or "dark" or other style}
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'theme_update',
                'theme': data.get('theme', 'light')
            }
        )

    async def theme_update(self, event):
        await self.send(text_data=json.dumps({
            'theme': event['theme']
        }))
class IdeaBoardConsumer(AsyncWebsocketConsumer):
    active_users = {}  # Track active users in the room
    board_state = {'nodes': [], 'connections': []}  # Shared board state
    
    async def connect(self):
        self.room_group_name = 'ideaboard_room'
        self.user = self.scope['user'].username if self.scope['user'].is_authenticated else f'Guest_{self.channel_name[-6:]}'
        self.user_color = self.generate_user_color()
        
        # Add to active users
        self.active_users[self.channel_name] = {
            'username': self.user,
            'color': self.user_color,
            'cursor': {'x': 0, 'y': 0}
        }
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        
        # Send initial board state to new user
        await self.send(text_data=json.dumps({
            'type': 'init',
            'board_state': self.board_state,
            'active_users': list(self.active_users.values()),
            'your_info': {'username': self.user, 'color': self.user_color}
        }))
        
        # Notify others of new user
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'username': self.user,
                'color': self.user_color
            }
        )

    async def disconnect(self, close_code):
        # Remove from active users
        if self.channel_name in self.active_users:
            del self.active_users[self.channel_name]
        
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        
        # Notify others that user left
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_left',
                'username': self.user
            }
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        
        if action == 'add_node':
            # Add new node to board
            node = data.get('node')
            node['created_by'] = self.user
            self.board_state['nodes'].append(node)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'node_added',
                    'node': node,
                    'user': self.user
                }
            )
            
        elif action == 'update_node':
            # Update existing node
            node_id = data.get('node_id')
            updates = data.get('updates')
            
            for node in self.board_state['nodes']:
                if node.get('id') == node_id:
                    node.update(updates)
                    break
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'node_updated',
                    'node_id': node_id,
                    'updates': updates,
                    'user': self.user
                }
            )
            
        elif action == 'delete_node':
            # Delete node from board
            node_id = data.get('node_id')
            self.board_state['nodes'] = [n for n in self.board_state['nodes'] if n.get('id') != node_id]
            self.board_state['connections'] = [c for c in self.board_state['connections'] 
                                              if c.get('from') != node_id and c.get('to') != node_id]
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'node_deleted',
                    'node_id': node_id,
                    'user': self.user
                }
            )
            
        elif action == 'add_connection':
            # Add connection between nodes
            connection = data.get('connection')
            self.board_state['connections'].append(connection)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'connection_added',
                    'connection': connection,
                    'user': self.user
                }
            )
            
        elif action == 'cursor_move':
            # Update user cursor position
            cursor = data.get('cursor')
            if self.channel_name in self.active_users:
                self.active_users[self.channel_name]['cursor'] = cursor
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'cursor_moved',
                    'username': self.user,
                    'cursor': cursor
                }
            )
            
        elif action == 'clear_board':
            # Clear the entire board
            self.board_state = {'nodes': [], 'connections': []}
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'board_cleared',
                    'user': self.user
                }
            )

    async def node_added(self, event):
        await self.send(text_data=json.dumps({
            'type': 'node_added',
            'node': event['node'],
            'user': event['user']
        }))
    
    async def node_updated(self, event):
        await self.send(text_data=json.dumps({
            'type': 'node_updated',
            'node_id': event['node_id'],
            'updates': event['updates'],
            'user': event['user']
        }))
    
    async def node_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'node_deleted',
            'node_id': event['node_id'],
            'user': event['user']
        }))
    
    async def connection_added(self, event):
        await self.send(text_data=json.dumps({
            'type': 'connection_added',
            'connection': event['connection'],
            'user': event['user']
        }))
    
    async def cursor_moved(self, event):
        if event['username'] != self.user:  # Don't send own cursor back
            await self.send(text_data=json.dumps({
                'type': 'cursor_moved',
                'username': event['username'],
                'cursor': event['cursor']
            }))
    
    async def user_joined(self, event):
        if event['username'] != self.user:  # Don't notify self
            await self.send(text_data=json.dumps({
                'type': 'user_joined',
                'username': event['username'],
                'color': event['color']
            }))
    
    async def user_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'username': event['username']
        }))
    
    async def board_cleared(self, event):
        await self.send(text_data=json.dumps({
            'type': 'board_cleared',
            'user': event['user']
        }))
    
    def generate_user_color(self):
        import random
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D', '#6BCB77', '#4D96FF']
        return random.choice(colors)
class TimerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'timer_room'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Expect: {"seconds": 60, "action": "start"}
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'timer_update',
                'seconds': data.get('seconds', 0),
                'action': data.get('action', '')
            }
        )

    async def timer_update(self, event):
        await self.send(text_data=json.dumps({
            'seconds': event['seconds'],
            'action': event['action']
        }))
class UndoRedoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'undoredo_room'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Expect: {"action": "undo" or "redo", "user": "..."}
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'undoredo_update',
                'action': data.get('action', ''),
                'user': data.get('user', 'Anonymous')
            }
        )

    async def undoredo_update(self, event):
        await self.send(text_data=json.dumps({
            'action': event['action'],
            'user': event['user']
        }))
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class CommentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'comment_room'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Expect: {"comment": "...", "user": "..."}
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'comment_update',
                'comment': data.get('comment', ''),
                'user': data.get('user', 'Anonymous')
            }
        )

    async def comment_update(self, event):
        await self.send(text_data=json.dumps({
            'comment': event['comment'],
            'user': event['user']
        }))
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
