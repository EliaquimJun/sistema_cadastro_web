from rest_framework import serializers
from .models import TblVisitante, RegistroEntrada,Login,TblVisitante_lixeira,RegistroEntrada_lixeira

class TblVisitanteSerializer(serializers.ModelSerializer):
    login = serializers.PrimaryKeyRelatedField(queryset=Login.objects.all(), required=False, allow_null=True)
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


class TblVisitanteLixeiraSerializer(serializers.ModelSerializer):
    login = serializers.PrimaryKeyRelatedField(queryset=Login.objects.all(), required=False, allow_null=True)
    class Meta:
        model = TblVisitante_lixeira
        fields = '__all__'

class RegistroEntradaLixeiraSerializer(serializers.ModelSerializer):
    visitante = serializers.PrimaryKeyRelatedField(queryset=TblVisitante_lixeira.objects.all(), required=False, allow_null=True)
    class Meta:
        model = RegistroEntrada_lixeira
        fields = '__all__'

