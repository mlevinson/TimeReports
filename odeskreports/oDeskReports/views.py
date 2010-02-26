import logging
from django.http import HttpResponse
from google.appengine.api.urlfetch import fetch
from django.shortcuts import render_to_response, redirect


from hashlib import md5
from urllib import urlencode, urlopen

import oDeskReports.simplejson as json

api_key = 'ea2bd21542d34e4bc34ca7e47c10df2b'
secret = '6aea378118d202fe'

def makeoDeskUrl(url, params = {}):
    p = {}
    p.update(params)
    p.update({'api_key': api_key})
    keys = p.keys()
    keys.sort()
    sig = secret
    for key in keys:
        sig += key
        sig += p[key]
    sig = md5(sig).hexdigest()
    p.update({'api_sig': sig})
    return url + "?" + urlencode(p)

def getHead(api_token):
    response = fetch(makeoDeskUrl(
        'https://www.odesk.com/api/templates/v1/header/head.xhtml',
        dict(api_token = api_token)))
    # TODO: Handle Errors
    return response.content


def getNav(api_token):
    url = makeoDeskUrl(
        'https://www.odesk.com/api/templates/v1/header/navigation.xhtml',
        dict(api_token = api_token))
    # response = fetch(url)
    #  # TODO: Handle Errors
    #  return response.content
    url = '<a href="' + url + '" target="_blank">' + url + '</a>'
    return url

def getToken(request):
    url = makeoDeskUrl(
        'https://www.odesk.com/api/auth/v1/keys/tokens.json',
        dict(frob = request.GET["frob"]))
    logging.info(url)
    response = fetch(url)
    result = json.loads(response.content)
    logging.info(result)
    print result
    p = {}
    p.update(request.GET)
    p.update({"api_token": result["token"]})
    return redirect("/" + "?" + urlencode(p))


def auth(request):
    authUrl = makeoDeskUrl("https://www.odesk.com/services/api/auth/")
    return redirect(authUrl)

def home(request):
    if not "frob" in request.GET:
        return auth(request)

    if not "api_token" in request.GET:
        return getToken(request)

    api_token =  request.GET["api_token"]

    return render_to_response('home.html', {
        "odeskhead": getHead(api_token),
        "odesknav": getNav(api_token),
    })