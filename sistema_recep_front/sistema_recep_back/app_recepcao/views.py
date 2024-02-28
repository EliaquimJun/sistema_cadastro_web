from django.shortcuts import render

from django.contrib.auth import authenticate, login
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


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
    
    
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Login

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserIdByUsername(request):
    username = request.query_params.get('username', None)
    if username is not None:
        try:
            # Primeiro, encontra o usuário pelo username
            user = User.objects.get(username=username)
            # Em seguida, tenta encontrar a instância de Login relacionada a esse usuário
            login = Login.objects.get(user=user)
            # Retorna o ID da instância de Login, não do User
            return Response({'login_id': login.id})
        except User.DoesNotExist:
            return Response({'error': 'Usuário não encontrado'}, status=404)
        except Login.DoesNotExist:
            # Trata o caso em que o usuário existe, mas não há uma instância de Login relacionada
            return Response({'error': 'Login associado ao usuário não encontrado'}, status=404)
    else:
        return Response({'error': 'Nome de usuário não fornecido'}, status=400)

    
    
from rest_framework import viewsets
from .models import TblVisitante, RegistroEntrada,TblVisitante_lixeira,RegistroEntrada_lixeira
from .serializers import TblVisitanteSerializer, RegistroEntradaSerializer,TblVisitanteLixeiraSerializer,RegistroEntradaLixeiraSerializer
from rest_framework.decorators import action
from rest_framework import filters
from django.db.models import OuterRef, Subquery
from django_filters.rest_framework import DjangoFilterBackend

class TblVisitanteViewSet(viewsets.ModelViewSet):
    queryset = TblVisitante.objects.all()
    serializer_class = TblVisitanteSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)  # Permite FormData além de JSON
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['cpf']  # Permite filtrar visitantes pelo CPF
    
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

    @action(detail=False, methods=['get'], url_path='buscar_por_visitante/(?P<visitante_id>\d+)')
    def por_visitante(self, request, visitante_id=None):
        """
        Retorna as entradas para um visitante específico.
        """
        entradas = self.queryset.filter(visitante_id=visitante_id)
        serializer = self.get_serializer(entradas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'], url_path='por_visitante/(?P<visitante_id>\d+)')
    def excluir_por_visitante(self, request, visitante_id=None):
        """
        Exclui todas as entradas para um visitante específico.
        """
        if not visitante_id:
            return Response({"error": "ID do visitante não especificado."}, status=status.HTTP_400_BAD_REQUEST)

        entradas = self.queryset.filter(visitante_id=visitante_id)
        entradas.delete()

        return Response({"message": "Entradas excluídas com sucesso."}, status=status.HTTP_204_NO_CONTENT)
    
    
    
    
    
    
    
    
    
class TblVisitanteViewSetLixeira(viewsets.ModelViewSet):
    queryset = TblVisitante_lixeira.objects.all()
    serializer_class = TblVisitanteLixeiraSerializer

    
    

class RegistroEntradaViewSetLixeira(viewsets.ModelViewSet):
    serializer_class = RegistroEntradaLixeiraSerializer

    queryset = RegistroEntrada_lixeira.objects.all()
   
  

   