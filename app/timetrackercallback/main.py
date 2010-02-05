#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from hashlib import md5  
from urllib import urlencode, urlopen     

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util


api_key = 'b73e4cbd875dedf3df8f0a76d94c6077'
secret = '1e3b5dab09e5e483'   

def get_url(month, year, company, team=None, provider=None):  
    
      #tq = "SELECT worked_on, provider_id, provider_name, sum(hours) WHERE month_worked_on=%(month)d AND year_worked_on=%(year)d"
      tq = "SELECT worked_on, provider_id, provider_name, sum(hours) WHERE worked_on > '2010-01-01'"
        
      if provider:
          tq += " AND provider_id='%(provider)s'"
      
      tq = tq % locals()  
      sig = md5(secret + 'api_key' + api_key + 'tq' + tq).hexdigest()
      params = dict(
        tq = tq,
        api_key = api_key,
        api_sig = sig
      )
      
      if team:
          url = "http://odesk.com/gds/timereports/v1/companies/%(company)d/teams/%(team)d/hours.json"          
      else:                                                                                        
          url = "http://odesk.com/gds/timereports/v1/companies/%(company)d/hours.json"
      url = url % locals()
      url += "?"
      url += urlencode(params) 
      return url


class MainHandler(webapp.RequestHandler):

    def authenticate(self):
        sig = md5(secret + 'api_key' + api_key).hexdigest()
        params = dict(
            api_key = api_key,
            api_sig = sig
        )                
        url = "https://www.odesk.com/services/api/auth/?" + urlencode(params)
        self.redirect(url)
    
    def get(self):
        frob = self.request.get('frob', None)
        if not frob:
            self.authenticate() 
         
        month = self.request.get('month', 1) 
        year = self.request.get('year', 2010)
        company = self.request.get('company', 118)
        team = self.request.get('team', 2837)
        provider = self.request.get('provider', None)                                
        
        url = get_url(month, year, company, team, provider)
        self.response.out.write('<a href="%(url)s">%(url)s</a>' % dict(url=url))


def main():
  application = webapp.WSGIApplication([('/', MainHandler)],
                                       debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
