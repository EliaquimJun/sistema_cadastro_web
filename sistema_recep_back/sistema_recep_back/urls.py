"""
URL configuration for sistema_recep_back project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include,re_path
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from django.conf import settings

from app_recepcao.views import (
    LoginAPI,LogoutAPI,TblVisitanteViewSet, RegistroEntradaViewSet,getUserIdByUsername,TblVisitanteViewSetLixeira,RegistroEntradaViewSetLixeira

)

router = DefaultRouter()
router.register(r'api/manage_visitante', TblVisitanteViewSet)
router.register(r'api/manage_entrada', RegistroEntradaViewSet)
router.register(r'api/manage_visitante_lixeira', TblVisitanteViewSetLixeira)
router.register(r'api/manage_entrada_lixeira', RegistroEntradaViewSetLixeira)






urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('api/login/', LoginAPI.as_view(), name='api-login'),
    path('api/logout/', LogoutAPI.as_view(), name='logout_api'),
    path('api/get_user_id/', getUserIdByUsername, name='get_user_id'),
    path('', include(router.urls)),  # Inclui todas as URLs do router do DRF
    
]
urlpatterns += router.urls
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
