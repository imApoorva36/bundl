from rest_framework import serializers
from .models import LimitOrder, Extension

class ExtensionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Extension
        exclude = ('id',)


class LimitOrderSerializer(serializers.ModelSerializer):
    extension = ExtensionSerializer()
    class Meta:
        model = LimitOrder
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class CreateOrderSerializer(serializers.Serializer):
    orderHash = serializers.CharField(max_length=66)
    signature = serializers.CharField(max_length=132)
    data = serializers.DictField()
    networkId = serializers.IntegerField(required=False, default=1)

    def validate_data(self, value):
        required_fields = [
            'makerAsset', 'takerAsset', 'maker', 'receiver',
            'makingAmount', 'takingAmount', 'salt', 'extension', 'makerTraits'
        ]
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(f"Missing required field in data: {field}")

        # Optional: Validate that extension is a dict with expected keys
        expected_extension_keys = [
            'makerAssetSuffix', 'takerAssetSuffix', 'makingAmountData', 'takingAmountData',
            'predicate', 'makerPermit', 'preInteraction', 'postInteraction', 'customData'
        ]
        extension = value['extension']
        if not isinstance(extension, dict):
            raise serializers.ValidationError("Extension must be a dictionary.")
        for key in expected_extension_keys:
            if key not in extension:
                raise serializers.ValidationError(f"Missing key in extension: {key}")

        return value

    def create(self, validated_data):
        data = validated_data['data']
        extension_data = data['extension']

        extension = Extension.objects.create(
            maker_asset_suffix=extension_data.get('makerAssetSuffix', ''),
            taker_asset_suffix=extension_data.get('takerAssetSuffix', ''),
            making_amount_data=extension_data.get('makingAmountData', ''),
            taking_amount_data=extension_data.get('takingAmountData', ''),
            predicate=extension_data.get('predicate', ''),
            maker_permit=extension_data.get('makerPermit', ''),
            pre_interaction=extension_data.get('preInteraction', ''),
            post_interaction=extension_data.get('postInteraction', ''),
            custom_data=extension_data.get('customData', '')
        )

        order = LimitOrder.objects.create(
            order_hash=validated_data['orderHash'],
            network_id=validated_data.get('networkId', 1),
            maker_asset=data['makerAsset'],
            taker_asset=data['takerAsset'],
            maker=data['maker'],
            receiver=data.get('receiver', ''),
            making_amount=data['makingAmount'],
            taking_amount=data['takingAmount'],
            salt=data['salt'],
            maker_traits=data['makerTraits'],
            extension=extension,
            signature=validated_data['signature'],
            status='ACTIVE'
        )

        return order