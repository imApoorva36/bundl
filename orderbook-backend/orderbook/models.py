from django.db import models
from django.utils import timezone

class LimitOrder(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACTIVE', 'Active'),
        ('FILLED', 'Filled'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
    ]
    
    # Order identification
    order_hash = models.CharField(max_length=66, unique=True, db_index=True)
    network_id = models.IntegerField()
    
    # Order details
    maker_asset = models.CharField(max_length=42)
    taker_asset = models.CharField(max_length=42)
    making_amount = models.CharField(max_length=78)  # Support big integers as strings
    taking_amount = models.CharField(max_length=78)
    maker = models.CharField(max_length=42, db_index=True)
    salt = models.CharField(max_length=78, null=True, blank=True)
    receiver = models.CharField(max_length=42, null=True, blank=True)
    maker_traits = models.CharField(max_length=78)
    extension = models.TextField(null=True, blank=True)  # Contains predicates/conditions
    
    # Signature
    signature = models.CharField(max_length=132)
    
    # Status and metadata
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    filled_amount = models.CharField(max_length=78, default='0')
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['maker', 'status']),
            models.Index(fields=['maker_asset', 'taker_asset']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"Order {self.order_hash[:10]}... - {self.status}"