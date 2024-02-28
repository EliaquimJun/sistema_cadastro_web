from django.shortcuts import render

from django.contrib.auth import authenticate, login
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import hmac
import hashlib
import subprocess
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse, HttpResponseForbidden
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework.views import APIView

class GithubWebhookAPI(APIView):
    def post(self, request, *args, **kwargs):
        header_signature = request.headers.get('X-Hub-Signature-256')
        if header_signature is None:
            return HttpResponseForbidden('Assinatura ausente')

        sha_name, signature = header_signature.split('=')
        if sha_name != 'sha256':
            return HttpResponseForbidden('Algoritmo de assinatura inválido')

        mac = hmac.new(bytes(settings.GITHUB_WEBHOOK_SECRET, 'utf-8'), msg=request.body, digestmod=hashlib.sha256)
        if not hmac.compare_digest(mac.hexdigest(), signature):
            return HttpResponseForbidden('Assinatura inválida')

        # Executa o script de atualização
        subprocess.Popen(['./path/to/your/update_script.sh'])  # Ajuste para o caminho correto do seu script

        return HttpResponse('Webhook recebido com sucesso')

class LoginAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            token = str(refresh.access_token)

            login(request, user)
            return JsonResponse({'status': 'success', 'message': 'Login bem-sucedido!', 'token': token, 'username': user.username})
        else:
            return JsonResponse({'status': 'error', 'message': 'Erro: Usuário ou senha incorretos!'}, status=401)


class LogoutAPI(APIView):
    
    def post(self, request, *args, **kwargs):
        # Aqui, podemos invalidar o token de alguma forma ou apenas 
        # retornar uma resposta de sucesso. Porque, na prática, a 
        # invalidação do token será feita no lado do cliente removendo 
        # o token do armazenamento.

        # Por simplicidade, apenas retornaremos uma resposta de sucesso
        return Response({'status': 'success', 'message': 'Logout bem-sucedido!'}, status=status.HTTP_200_OK)
    
    
    
from rest_framework import viewsets
from .models import TblVisitante, RegistroEntrada
from .serializers import TblVisitanteSerializer, RegistroEntradaSerializer
from rest_framework.decorators import action
from rest_framework import filters
from django.db.models import OuterRef, Subquery

class TblVisitanteViewSet(viewsets.ModelViewSet):
    queryset = TblVisitante.objects.all()
    serializer_class = TblVisitanteSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)  # Permite FormData além de JSON
    
    def get_queryset(self):
        ultima_entrada = RegistroEntrada.objects.filter(
            visitante_id=OuterRef('pk')
        ).order_by('-data_hora_entrada').values('data_hora_entrada')[:1]

        queryset = TblVisitante.objects.annotate(
            ultima_entrada=Subquery(ultima_entrada)
        ).order_by('-ultima_entrada')
        return queryset

class RegistroEntradaViewSet(viewsets.ModelViewSet):
    serializer_class = RegistroEntradaSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    queryset = RegistroEntrada.objects.all()
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['data_hora_entrada']

    @action(detail=False, methods=['get'], url_path='por_visitante/(?P<visitante_id>\d+)')
    def por_visitante(self, request, visitante_id=None):
        """
        Retorna as entradas para um visitante específico.
        """
        entradas = self.queryset.filter(visitante_id=visitante_id)
        serializer = self.get_serializer(entradas, many=True)
        return Response(serializer.data)