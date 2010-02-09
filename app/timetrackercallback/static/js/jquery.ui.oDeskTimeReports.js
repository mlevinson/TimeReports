(function($) { 
$.widget("ui.oDeskTimeReports",{
     _init: function(){
         var table = this.element[0];
         var widget = this;
         
         var defaultTableParams = {
             "aoColumns" : this.options.columnSpec,
              "bPaginate": false,
              "bLengthChange": false,
              "bFilter": false,
              "bSort": false,
              "bInfo": false,
              "bAutoWidth":false
         };   
         this.options.dataTable = $(table).dataTable(
                                        $.extend({}, 
                                            defaultTableParams, 
                                            this.options.tableParams));
     },
     defaultQueryFunction: function(){
           if(!this.options.companyId) return null;
             var tq = "SELECT worked_on, provider_id, provider_name, sum(hours), sum(charges) WHERE worked_on >= '";
             tq += this.options.startDate.toString("yyyy-MM-dd");
             tq += "' AND worked_on <= '";
             tq += this.options.endDate.toString("yyyy-MM-dd");                
             tq += "'";
             if(this.options.providerId){
                tq += " AND provider_id='";
                tq += this.options.providerId;        
                tq += "'";          
             }           
             tq += " ORDER BY provider_id, worked_on";

             var url = "http://www.odesk.com/gds/timereports/v1/companies/";
             url += this.options.companyId;  
             if(this.options.teamId){
                 url += "/teams/";
                 url += this.options.teamId;          
             }
             url += "?tq=";
             url += escape(tq); 
             url += "&callback=?" 
             return url;
     },
     generateReport: function(){
         if(!this.options.transformFunction || !this.options.startDate || 
             !this.options.endDate || !this.options.companyId) return;
         var url = this.options.queryFunction ? this.options.queryFunction() : this.defaultQueryFunction();
         if(!url) return;
         var widget = this; 
         var dataTable = this.options.dataTable;
         $.getJSON(url, function(data){
             var rows = widget.options.transformFunction(data);
             dataTable.fnClearTable(0);
             dataTable.fnAddData(rows);             
         });
     }
    
});      
    
$.extend($.ui.oDeskTimeReports, {
   defaults: {
       "columnSpec": {},
       "tableParams": {},
       "queryFunction": null,
       "transformFunction": null,
       "startDate": null,
       "endDate": null,
       "companyId": null,
       "teamId": null,
       "providerId": null
   }
 });          
})(jQuery);    