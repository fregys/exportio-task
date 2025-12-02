import json

from rest_framework import viewsets, mixins, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from utilities.clients.base_linker import BaseLinker


class ProductViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    # Serializers would be used here in a full implementation
    def list(self, request, inventory_id=None):
        response = BaseLinker().get_products_in_inventory(inventory_id)
        return Response(response, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None, inventory_id=None):
        response = BaseLinker().get_detailed_product_info(inventory_id, pk)
        return Response(response, status=status.HTTP_200_OK)

    def update(self, request, pk=None, inventory_id=None):
        new_value = request.data.get('new_value')
        # And maybe check if value is not TOO big
        if not new_value:
            raise ValidationError("Field 'new_value' is required.")

        client = BaseLinker()

        product_response = client.get_detailed_product_info(inventory_id, pk)
        text_fields = product_response.get("products", {}).get(str(pk), {}).get("text_fields")
        if not text_fields or len(text_fields) < 2:
            raise ValidationError("Product cannot be updated.")

        # Wanna sort keys alphabetically for deterministic ordering across FE/BE
        sorted_keys = sorted(text_fields.keys())
        second_key = sorted_keys[1]
        update_payload = {
            'text_fields': {
                second_key: new_value
            }
        }

        response = client.upsert_product_in_inventory(inventory_id, pk, update_payload)
        return Response(response, status=status.HTTP_200_OK)

    def partial_update(self, request, pk=None, inventory_id=None):
        return self.update(request, pk=pk, inventory_id=inventory_id)
