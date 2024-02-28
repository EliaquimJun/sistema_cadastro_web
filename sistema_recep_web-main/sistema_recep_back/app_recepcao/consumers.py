# consumers.py

from channels.db import database_sync_to_async
from djangochannelsrestframework import permissions
from djangochannelsrestframework.generics import GenericAsyncAPIConsumer
from djangochannelsrestframework.mixins import (
    ListModelMixin,
    CreateModelMixin,
    UpdateModelMixin,
    DeleteModelMixin,
    RetrieveModelMixin,
)

import logging
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from rest_framework.renderers import JSONRenderer


# Configure o logger
logger = logging.getLogger(__name__)

specificStatusCodeMappings = {
    '1000': 'Normal Closure',
    '1001': 'Going Away',
    '1002': 'Protocol Error',
    '1003': 'Unsupported Data',
    '1004': '(For future)',
    '1005': 'No Status Received',
    '1006': 'Abnormal Closure',
    '1007': 'Invalid frame payload data',
    '1008': 'Policy Violation',
    '1009': 'Message too big',
    '1010': 'Missing Extension',
    '1011': 'Internal Error',
    '1012': 'Service Restart',
    '1013': 'Try Again Later',
    '1014': 'Bad Gateway',
    '1015': 'TLS Handshake'
}

def getStatusCodeString(code):
    if code is None:
        return "Código de status desconhecido"
    if (code >= 0 and code <= 999):
        return '(Unused)'
    elif (code >= 1016):
        if (code <= 1999):
            return '(For WebSocket standard)'
        elif (code <= 2999):
            return '(For WebSocket extensions)'
        elif (code <= 3999):
            return '(For libraries and frameworks)'
        elif (code <= 4999):
            return '(For applications)'
    return specificStatusCodeMappings.get(code, '(Unknown)')

class CadastroConsumer(
    GenericAsyncAPIConsumer
):   
    
    

    async def connect(self):
        logger.info("Conexão estabelecida.")
        print("Método connect chamado!")
        
        # Verificar se reuniao_id está na URL. Se não, definir um padrão (por exemplo, "global").
        reuniao_id = self.scope['url_route']['kwargs'].get('reuniao_id', 'global')
        
        self.room_group_name = f"presenca_{reuniao_id}"
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        self.accept()
        await super().connect()
        logger.info(f"Conexão estabelecida. Conectado ao grupo {self.room_group_name}.")

    async def disconnect(self, close_code):
        status_message = getStatusCodeString(close_code)
        logger.info(f"Desconexão com código: {close_code} - {status_message}")
        await self.channel_layer.group_discard(
            self.room_group_name,  # use a variável de nome de grupo dinâmico
            self.channel_name
        )
        await super().disconnect(close_code)



    async def insert(self, content):
        targetComponent = content['targetComponent']
        try:

            message = {
                'type': 'insert.update',   
                'data': 'insert.update',
                'targetComponent':targetComponent,
            }
            await self.channel_layer.group_send(self.room_group_name, message)
        except Exception as e:
            logger.error(f"Erro ao processar atualização de cronometro com conteúdo: {content}. Erro: {str(e)}")

    async def insert_update(self, event):
        await self.send_json({
            'type': event['type'],
            'data': event['data'],
            'targetComponent': event['targetComponent'],
        })
        
    async def delete(self, content):
        targetComponent = content['targetComponent']
        try:

            message = {
                'type': 'delete.update',   
                'data': 'delete.update',
                'targetComponent':targetComponent,
            }
            await self.channel_layer.group_send(self.room_group_name, message)
        except Exception as e:
            logger.error(f"Erro ao processar atualização de cronometro com conteúdo: {content}. Erro: {str(e)}")

    async def delete_update(self, event):
        await self.send_json({
            'type': event['type'],
            'data': event['data'],
            'targetComponent': event['targetComponent'],
        })
        
        
    async def editar(self, content):
        targetComponent = content['targetComponent']
        try:

            message = {
                'type': 'editar.update',   
                'data': 'editar.update',
                'targetComponent':targetComponent,
            }
            await self.channel_layer.group_send(self.room_group_name, message)
        except Exception as e:
            logger.error(f"Erro ao processar atualização de cronometro com conteúdo: {content}. Erro: {str(e)}")

    async def editar_update(self, event):
        await self.send_json({
            'type': event['type'],
            'data': event['data'],
            'targetComponent': event['targetComponent'],
        })



    # Adicione este método
    async def send_json(self, content, close=False):
        try:
            logger.info(f"Preparando para enviar mensagem para o grupo {self.room_group_name}. Mensagem: {content}")
            await super().send_json(content, close)
            logger.info(f"Mensagem enviada com sucesso para o grupo {self.room_group_name}. ")
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem para o grupo {self.room_group_name}. . Erro: {str(e)}")




    async def receive_json(self, content, **kwargs):
        action = content.get('action')
        if action == 'insert':
            await self.insert(content)
        elif action == 'delete':
            await self.delete(content)
        elif action == 'editar':
            await self.editar(content)

        else:
            await super().receive_json(content, **kwargs)



