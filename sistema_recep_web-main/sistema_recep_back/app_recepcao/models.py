from django.db import models

from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class TblVisitante(models.Model):
    nome = models.CharField(max_length=255, null=True, blank=True)
    cpf = models.CharField(max_length=14, null=True, blank=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    assinatura_digital = models.ImageField(upload_to='assinaturas/', null=True, blank=True)

class Endereco(models.Model):
    rua = models.CharField(max_length=255, null=True, blank=True)
    bairro = models.CharField(max_length=255, null=True, blank=True)
    solicitacao = models.TextField(null=True, blank=True)
    visitante = models.ForeignKey(TblVisitante, on_delete=models.CASCADE, null=True)


class RegistroEntrada(models.Model):
    data_hora_entrada = models.DateTimeField(null=True, blank=True)
    gabinete = models.CharField(max_length=1000, null=True, blank=True)
    visitante = models.ForeignKey(TblVisitante, on_delete=models.CASCADE, null=True)


class Login(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
