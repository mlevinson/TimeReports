from django.conf.urls.defaults import *

from oDeskReports import views

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    
    (r'', views.home),
)
