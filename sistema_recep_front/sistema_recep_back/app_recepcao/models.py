from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import models
from django.contrib.auth.models import User
from django.conf import settings


class Login(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
    
    @receiver(post_save, sender=User)
    def create_user_login(sender, instance, created, **kwargs):
        if created:
            Login.objects.create(user=instance)

    @receiver(post_save, sender=User)
    def save_user_login(sender, instance, **kwargs):
        instance.login.save()

class TblVisitante(models.Model):
    nome = models.CharField(max_length=255, null=True, blank=True)
    cpf = models.CharField(max_length=14, null=True, blank=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    assinatura_digital = models.ImageField(upload_to='assinaturas/', null=True, blank=True)
    login = models.ForeignKey(Login, on_delete=models.SET_NULL, null=True, blank=True)

class Endereco(models.Model):
    rua = models.CharField(max_length=255, null=True, blank=True)
    bairro = models.CharField(max_length=255, null=True, blank=True)
    solicitacao = models.TextField(null=True, blank=True)
    visitante = models.ForeignKey(TblVisitante, on_delete=models.CASCADE, null=True)


class RegistroEntrada(models.Model):
    data_hora_entrada = models.DateTimeField(null=True, blank=True)
    gabinete = models.CharField(max_length=1000, null=True, blank=True)
    visitante = models.ForeignKey(TblVisitante, on_delete=models.CASCADE, null=True)





class TblVisitante_lixeira(models.Model):
    nome = models.CharField(max_length=255, null=True, blank=True)
    cpf = models.CharField(max_length=14, null=True, blank=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    login = models.ForeignKey(Login, on_delete=models.SET_NULL, null=True, blank=True)
    data_hora_exclusao = models.DateTimeField(null=True, blank=True)
    motivo = models.CharField(max_length=255, null=True, blank=True)

class RegistroEntrada_lixeira(models.Model):
    data_hora_entrada = models.DateTimeField(null=True, blank=True)
    gabinete = models.CharField(max_length=1000, null=True, blank=True)
    visitante = models.ForeignKey(TblVisitante_lixeira, on_delete=models.CASCADE, null=True)



