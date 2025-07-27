from rest_framework import serializers
from .models import LimitOrder

class LimitOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = LimitOrder
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class CreateOrderSerializer(serializers.Serializer):
    orderHash = serializers.CharField(max_length=66)
    signature = serializers.CharField(max_length=132)
    data = serializers.DictField()
    
    def validate_data(self, value):
        required_fields = [
            'makerAsset', 'takerAsset', 'maker', 'receiver',
            'makingAmount', 'takingAmount', 'salt', 'extension', 'makerTraits'
        ]
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(f"Missing required field in data: {field}")
        return value