from rest_framework import status, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from .models import LimitOrder, Extension
from .serializers import LimitOrderSerializer, CreateOrderSerializer

class OrderPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'limit'
    max_page_size = 100

@api_view(['POST'])
def submit_order(request):
    """Submit a new limit order"""
    print(request.data)
    serializer = CreateOrderSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            {'error': 'Invalid order data', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    validated_data = serializer.validated_data
    order_data = validated_data['data']

    # Check if order already exists
    if LimitOrder.objects.filter(order_hash=validated_data['orderHash']).exists():
        return Response(
            {'error': 'Order already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Extract network ID from request or default to 1 (mainnet)
    network_id = request.data.get('networkId', 1)

    # Extract extension data and create Extension instance
    extension_data = order_data.get('extension', {})
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

    # Create new LimitOrder instance
    order = LimitOrder.objects.create(
        order_hash=validated_data['orderHash'],
        network_id=network_id,
        maker_asset=order_data['makerAsset'],
        taker_asset=order_data['takerAsset'],
        making_amount=order_data['makingAmount'],
        taking_amount=order_data['takingAmount'],
        maker=order_data['maker'],
        salt=order_data.get('salt', ''),
        receiver=order_data.get('receiver', ''),
        maker_traits=order_data['makerTraits'],
        extension=extension,
        signature=validated_data['signature'],
        status='ACTIVE'
    )

    serializer = LimitOrderSerializer(order)
    return Response({
        'success': True,
        'message': 'Order submitted successfully',
        'order': serializer.data
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_order_by_hash(request, order_hash):
    """Get order by hash"""
    order = get_object_or_404(LimitOrder, order_hash=order_hash)
    serializer = LimitOrderSerializer(order)
    return Response(serializer.data)

@api_view(['GET'])
def get_orders_by_maker(request, maker_address):
    """Get orders by maker address"""
    orders = LimitOrder.objects.filter(maker=maker_address.lower())
    
    # Filter by status if provided
    status_filter = request.GET.get('status')
    if status_filter:
        orders = orders.filter(status=status_filter.upper())
    
    paginator = OrderPagination()
    page = paginator.paginate_queryset(orders, request)
    
    if page is not None:
        serializer = LimitOrderSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = LimitOrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def cancel_order(request, order_hash):
    """Cancel an order"""
    order = get_object_or_404(LimitOrder, order_hash=order_hash)
    
    if order.status not in ['PENDING', 'ACTIVE']:
        return Response(
            {'error': f'Cannot cancel order with status: {order.status}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    order.status = 'CANCELLED'
    order.save()
    
    serializer = LimitOrderSerializer(order)
    return Response({
        'success': True,
        'message': 'Order cancelled successfully',
        'order': serializer.data
    })

@api_view(['GET'])
def get_order_status(request, order_hash):
    """Get order status"""
    order = get_object_or_404(LimitOrder, order_hash=order_hash)
    return Response({
        'orderHash': order.order_hash,
        'status': order.status,
        'filledAmount': order.filled_amount,
        'createdAt': order.created_at,
        'updatedAt': order.updated_at
    })

@api_view(['GET'])
def get_active_orders(request):
    """Get active orders with filtering"""
    orders = LimitOrder.objects.filter(status='ACTIVE')
    
    # Optional filters
    maker = request.GET.get('maker')
    maker_asset = request.GET.get('makerAsset')
    taker_asset = request.GET.get('takerAsset')
    print(maker)
    if maker:
        orders = orders.filter(maker=maker.lower())
    if maker_asset:
        orders = orders.filter(maker_asset=maker_asset)
    if taker_asset:
        orders = orders.filter(taker_asset=taker_asset)
    
    paginator = OrderPagination()
    page = paginator.paginate_queryset(orders, request)
    
    if page is not None:
        serializer = LimitOrderSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = LimitOrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_orderbook(request):
    """Get orderbook data for a trading pair"""
    maker_asset = request.GET.get('makerAsset')
    taker_asset = request.GET.get('takerAsset')
    
    if not maker_asset or not taker_asset:
        return Response(
            {'error': 'makerAsset and takerAsset parameters required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get buy orders (orders where takerAsset is what we want to buy)
    buy_orders = LimitOrder.objects.filter(
        maker_asset=taker_asset,
        taker_asset=maker_asset,
        status='ACTIVE'
    ).order_by('-created_at')[:20]
    
    # Get sell orders (orders where makerAsset is what we want to sell)
    sell_orders = LimitOrder.objects.filter(
        maker_asset=maker_asset,
        taker_asset=taker_asset,
        status='ACTIVE'
    ).order_by('-created_at')[:20]
    
    return Response({
        'buyOrders': LimitOrderSerializer(buy_orders, many=True).data,
        'sellOrders': LimitOrderSerializer(sell_orders, many=True).data,
        'pair': f"{maker_asset}/{taker_asset}"
    })