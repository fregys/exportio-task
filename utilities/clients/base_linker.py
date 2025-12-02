import json

import requests
from django.conf import settings
from rest_framework.exceptions import ValidationError

from utilities.enums.base_linker import BaseLinkStatus


class BaseLinker:
    """
    https://api.baselinker.com/
    """
    # Additionally retry logic can be implemented if needed

    BASE_URL = "https://api.baselinker.com/connector.php"

    METHOD_INVENTORIES = "getInventories"
    METHOD_PRODUCTS_INVENTORY = "getInventoryProductsList"
    METHOD_DETAILED_PRODUCT_INFO = "getInventoryProductsData"
    METHOD_UPSERT_PRODUCT_INVENTORY = "addInventoryProduct"

    def __init__(self):
        self._headers = {"X-BLToken": settings.BASE_LINKER_TOKEN}

    def _validate_response(self, response_data):
        status = response_data.get('status')
        if status != BaseLinkStatus.SUCCESS:
            error_message = response_data.get('error_message', 'Unknown error')
            error_code = response_data.get('error_code', 'Unknown code')
            raise ValidationError(f"BaseLinker API error: {error_message} (code: {error_code})")
        return response_data

    def get_inventories(self):
        response = requests.post(
            self.BASE_URL,
            headers=self._headers,
            data={"method": self.METHOD_INVENTORIES}
        )
        return self._validate_response(response.json())

    def get_products_in_inventory(self, inventory_id):
        parameters = {
            "inventory_id": inventory_id
        }

        response = requests.post(
            self.BASE_URL,
            headers=self._headers,
            data={
                "method": self.METHOD_PRODUCTS_INVENTORY,
                "parameters": json.dumps(parameters)
            }
        )
        return self._validate_response(response.json())

    def get_detailed_product_info(self, inventory_id, product_id):
        parameters = {
            "inventory_id": inventory_id,
            "products": [product_id]
        }

        response = requests.post(
            self.BASE_URL,
            headers=self._headers,
            data={
                "method": self.METHOD_DETAILED_PRODUCT_INFO,
                "parameters": json.dumps(parameters)
            }
        )
        return self._validate_response(response.json())

    def upsert_product_in_inventory(self, inventory_id, product_id, new_product_data):
        parameters = {
            "inventory_id": inventory_id,
            "product_id": product_id,
            **new_product_data
        }

        response = requests.post(
            self.BASE_URL,
            headers=self._headers,
            data={
                "method": self.METHOD_UPSERT_PRODUCT_INVENTORY,
                "parameters": json.dumps(parameters)
            }
        )
        return self._validate_response(response.json())
