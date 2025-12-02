from rest_framework import viewsets, mixins, status
from rest_framework.response import Response

from utilities.clients.base_linker import BaseLinker


class InventoryViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):

    def list(self, request):
        response = BaseLinker().get_inventories()
        return Response(response, status=status.HTTP_200_OK)

