function getHours(month, year, company, team, provider){
      var tq = "SELECT worked_on, provider_id, provider_name, sum(hours) WHERE month_worked_on =";
      tq += month;
      tq += " AND year_worked_on =";
      tq += year;         
      
      var url = "http://odesk.com/gds/timereports/v1/companies/";
      url += company;
      url += "/teams/";
      url += team;
      url += "/hours.json";
      
      url += "?tq=";
      url += encodeURIComponent(tq);
      $.getJSON(url, function(data){
          return transformGDS(data);
      });   
}   

function transformGDS(data){
    
}