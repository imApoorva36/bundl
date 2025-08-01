from django.db import models
from django.utils import timezone


class Extension(models.Model):
    maker_asset_suffix = models.TextField()
    taker_asset_suffix = models.TextField()
    making_amount_data = models.TextField()
    taking_amount_data = models.TextField()
    predicate = models.TextField()
    maker_permit = models.TextField()
    pre_interaction = models.TextField()
    post_interaction = models.TextField()
    custom_data = models.TextField()

    def __str__(self):
        return f"Extension {self.id}"


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
    making_amount = models.CharField(max_length=78)
    taking_amount = models.CharField(max_length=78)
    maker = models.CharField(max_length=42, db_index=True)
    salt = models.CharField(max_length=78, null=True, blank=True)
    receiver = models.CharField(max_length=42, null=True, blank=True)
    maker_traits = models.CharField(max_length=78)
    extension = models.OneToOneField(Extension, on_delete=models.CASCADE, null=True, blank=True)

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
