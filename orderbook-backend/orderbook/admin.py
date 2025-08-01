from django.contrib import admin
from .models import LimitOrder, Extension

@admin.register(Extension)
class ExtensionAdmin(admin.ModelAdmin):
    list_display = ('id', 'maker_asset_suffix', 'taker_asset_suffix', 'predicate')
    search_fields = ('maker_asset_suffix', 'taker_asset_suffix', 'predicate')


@admin.register(LimitOrder)
class LimitOrderAdmin(admin.ModelAdmin):
    list_display = ('order_hash_short', 'maker_short', 'status', 'maker_asset_short', 'taker_asset_short', 'created_at')
    list_filter = ('status', 'network_id', 'created_at')
    search_fields = ('order_hash', 'maker', 'maker_asset', 'taker_asset')
    readonly_fields = ('order_hash', 'created_at', 'updated_at')
    
    def order_hash_short(self, obj):
        return f"{obj.order_hash[:10]}..."
    order_hash_short.short_description = 'Order Hash'
    
    def maker_short(self, obj):
        return f"{obj.maker[:10]}..."
    maker_short.short_description = 'Maker'
    
    def maker_asset_short(self, obj):
        return f"{obj.maker_asset[:10]}..."
    maker_asset_short.short_description = 'Maker Asset'
    
    def taker_asset_short(self, obj):
        return f"{obj.taker_asset[:10]}..."
    taker_asset_short.short_description = 'Taker Asset'