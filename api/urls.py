from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views import InventoryViewSet, ProductViewSet

router = DefaultRouter()
router.register(r'inventories', InventoryViewSet, basename='inventories')

urlpatterns = [
    path('', include(router.urls)),
    path('inventories/<int:inventory_id>/products/', ProductViewSet.as_view({'get': 'list'}), name='inventory-products-list'),
    path('inventories/<int:inventory_id>/products/<int:pk>/', ProductViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update'}), name='inventory-products-detail'),
]
