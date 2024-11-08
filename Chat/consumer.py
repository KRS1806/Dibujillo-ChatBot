import json
import nest_asyncio
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from configBot.configImage import query
import gc
nest_asyncio.apply()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("chat_group", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("chat_group", self.channel_name)
        await self.send(text_data=json.dumps({
            'message': 'WebSocket desconectado, recarga la página para conectarse de nuevo',
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)

        # Obtener mensaje e imagen por separado
        message = data.get('data', {}).get('message')
        image = data.get('data', {}).get('image')

        # Intentar realizar la consulta con timeout, enviando ambos parámetros a query
        try:
            result = await asyncio.wait_for(self.run_query(message, image), timeout=60.0)
        except asyncio.TimeoutError:
            result = "La consulta tardó demasiado en procesarse. Por favor, intenta de nuevo."

        # Enviar la respuesta de vuelta al WebSocket
        await self.send(text_data=json.dumps({
            'response': result,
            'message': message,
            'image': image
        }))

        # Liberar memoria
        gc.collect()

    async def run_query(self, message, image):
        try:
            return query(message, image)  # Pasar los dos parámetros: message y image
        except Exception as e:
            # Enviar mensaje de error al cliente para evitar el cierre abrupto del WebSocket
            await self.send(text_data=json.dumps({
                'message': f'Error en la consulta: {str(e)}'
            }))
            return None