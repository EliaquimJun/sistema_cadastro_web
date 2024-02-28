
from .consumers import CadastroConsumer
from channels.routing import URLRouter

from django.urls import re_path



websocket_urlpatterns = [
    re_path(
        r'ws/manage_cadastro/(?P<reuniao_id>\w+)/$', CadastroConsumer.as_asgi(),
    ),
    re_path(
        r'ws/manage_cadastro/$', CadastroConsumer.as_asgi(),  # rota sem reuniao_id
    ),
]


