function getHours(month, year, company, team, provider){
      // var tq = "SELECT worked_on,provider_id, provider_name, sum(hours) WHERE month_worked_on =";
      //    tq += month;
      //    tq += " AND year_worked_on =";
      //    tq += year;  
      //    if(provider){
      //        tq += " AND provider_id='";
      //        tq += provider;        
      //        tq += "'";          
      //    }
      //    
      //    var url = "http://odesk.com/gds/timereports/v1/companies/";
      //    url += company;  
      //    if(team){
      //        url += "/teams/";
      //        url += team;          
      //    }
      //    url += "/hours.json";      
      //    url += "?tq=";
      //    url += encodeURIComponent(tq); 
      //    url += "&callback=?"
      url = "/js/data.json";
      $.getJSON(url, function(data){
           refreshGrid(transformGDS(data));
      });
}  

function refreshGrid(data){
    $("#time-reports-grid").dataTable(data);    
} 

function transformGDS(data, month, year){
    
   var firstDayOfMonth = Date.parseExact("1/" + str(month) + "/" + str(year), "dd/mm/yyyy");
   var daysInMonth = Date.getDaysInMonth(year, month);
   var firstDayWeekNumber = firstDayOfMonth.getWeek();
   var firstDayDayNumber = firstDayOfMonth.getDay();
   var monthName = firstDayOfMonth.toString("M");    
   
   var weekStartDateNumber = 0;
   var rows = [];                    
   var weeks = [];          
   var weekDays = 6 - firstDayDayNumber;
   
   while(true){               
      var start = monthName + " " + weekStartDateNumber;           
      var weekEndDay =  weekStartDateNumber + weekDays;
      weekDays = 6;
      if (weekEndDay > daysInMonth){
          weekEndDay = daysInMonth;
      }
      var end = monthName + " "   + weekEndDay;
      weeks.push(str(year) + str(month) + str(weekStartDateNumber));
      rows.push([start + " - " + end, "", "", "", "", "", "", "", ""]);
      weekStartDateNumber = weekEndDay + 1;
   }
   
   // var all_providers = {}; 
   //   $.each(data.table.rows, function(i, row){
   //        var provider_id = row.c[0].v;
   //        $.extend(all_providers, {provider_id: {}}); 
   //        row_date = Date.parseExact(row.c[3], "yyyymmdd");
   //        rowWeekNumber = 
   //          
   //   });      
   
   return {
       "aaData" :  rows,
       "aaColumns" : getColumns()
   };
} 

function getColumns(){ 

    return [
         {
             "sTitle":"Week"
         }, 
         {
             "sTitle":"Sunday"
         },                         
         {
             "sTitle":"Monday"
         },
         {
             "sTitle":"Tuesday"
         },
         {
             "sTitle":"Wednesday"
         },
         {
             "sTitle":"Thursday"
         },
         {
             "sTitle":"Friday"
         },
         {
             "sTitle":"Saturday"
         },
         {
             "sTitle":"Total"
         }
    ];
}