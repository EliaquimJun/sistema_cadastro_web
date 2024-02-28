from rest_framework import serializers
from .models import TblVisitante, RegistroEntrada,Login

class TblVisitanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblVisitante
        fields = '__all__'
    def get_tem_assinatura(self, obj):
    # Retorna True se o visitante tem uma assinatura, False caso contrário
        return bool(obj.assinatura_digital)

class RegistroEntradaSerializer(serializers.ModelSerializer):
    visitante = serializers.PrimaryKeyRelatedField(queryset=TblVisitante.objects.all(), required=False, allow_null=True)
    class Meta:
        model = RegistroEntrada
        fields = '__all__'
        
        
class LoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = Login
        fields = '__all__'

