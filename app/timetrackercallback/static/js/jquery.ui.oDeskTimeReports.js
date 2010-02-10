(function($) { 
$.widget("ui.oDeskTimeReports",{
     _init: function(){
         var table = this.element[0];
         var widget = this;
         
         var defaultTableParams = {
              "aoColumns" : this.options.report.columnSpec(),
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
     triggerError : function(){                        
         var dataTable = this.options.dataTable;         
         dataTable.fnClearTable(1);
         $(this.element[0]).trigger("dataTablePopulated", null);         
     },
     generateReport: function(){
         var dataTable = this.options.dataTable;
         var report = this.options.report;  
         var service = this.options.service;
         var widget = this; 
         if(!report || !service){
            widget.triggerError();
         }
         service(report, function(data, status){
             var results = report.transformData(data);
             dataTable.fnClearTable(1); 
             dataTable.fnAddData(results.rows);
             $(widget.element[0]).trigger("dataTablePopulated", results);             
         }, function(error, status){
             widget.triggerError();
         });         
     }
    
});      
    
$.extend($.ui.oDeskTimeReports, {
   defaults: {
       "report": null,
       "service": null,
       "tableParams": {}
   }
 });          
})(jQuery);    