from urllib import urlencode, urlopen
import tornado.auth
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import simplejson as json

from tornado.options import define, options  
from hashlib import md5                                                 

api_key = 'b73e4cbd875dedf3df8f0a76d94c6077'
secret = '1e3b5dab09e5e483'

define("port", default=9988, help="run on the given port", type=int)

def get_url(month, year, company, team=None, provider=None):  
    
      tq = "SELECT worked_on, provider_id, provider_name, sum(hours) WHERE month_worked_on=%(month)d \
            AND year_worked_on=%(year)d"
        
      if provider:
          tq += " AND provider_id='%(provider)s'"
      
      tq = tq % locals()  
      sig = md5(secret + 'api_key' + api_key + 'tq' + tq).hexdigest()
      params = dict(
        tq = tq,
        api_key = api_key,
        api_sig = api_sig
      )
      
      if team:
          url = "http://odesk.com/gds/timereports/v1/companies/%(company)d/teams/%(team)d/hours.json"          
      else:                                                                                        
          url = "http://odesk.com/gds/timereports/v1/companies/%(company)d/hours.json"
      url = url % locals()
      url += "?"
      url += urlencode(dict(tq=tq)) 
      return url


class Application(tornado.web.Application):
  def __init__(self):
      handlers = [
          (r"/", TimeReportsHandler)
      ]   
      opts = dict()
      tornado.web.Application.__init__(self, handlers, **opts)

      

class TimeReportsHandler(tornado.web.RequestHandler):    
    def authenticate(self):
        sig = md5(secret + 'api_key' + api_key).hexdigest()
        params = dict(
            api_key = api_key,
            api_sig = sig
        )                
        url = "https://www.odesk.com/services/api/auth/?" + urlencode(params)
        self.redirect(url)
    
    def get(self):
        frob = self.get_argument('frob', None)
        if not frob:
            self.authenticate() 
         
        month = self.get_argument('month', 1) 
        year = self.get_argument('year', 2010)
        company = self.get_argument('company', 118)
        team = self.get_argument('team', None)
        provider = self.get_argument('provider', None)                                
        
        url = get_url(month, year, company, team, provider)
        self.redirect(url)
      
def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()