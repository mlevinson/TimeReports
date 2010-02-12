(function($) { 
$.widget("ui.oDeskTimeReports",{
     _init: function(){
         var table = this.element[0];
         var widget = this;
         
         this.options.defaultTableParams = {
              "aoColumns" : this.options.report.columnSpec(),
              "bPaginate": false,
              "bLengthChange": false,
              "bProcessing":true,
              "bFilter": false,
              "bSort": false,
              "bInfo": false,
              "bAutoWidth":false
         }; 
         if(!this.options.oneshot){
             var dataTable = $(table).dataTable(
                                            $.extend({}, 
                                                this.options.defaultTableParams, 
                                                this.options.tableParams));
             $.data(table, "dataTable", dataTable);             
         }
     },
     dataTable: function(){
       return $.data(this.element[0], "dataTable");  
     },
     triggerError : function(){                        
         var dataTable = this.dataTable();  
         dataTable.fnClearTable(1);
         $(this.element[0]).trigger("dataTablePopulated", null);         
     },
     generateReport: function(){
         var report = this.options.report;
         var table = this.element[0];  
         var service = this.options.service;
         var widget = this; 
         if(!report || !service){
            widget.triggerError();
         }
         service(report, function(data, status){
             var results = report.transformData(data);
             if(!widget.options.oneshot){
                 var dataTable = widget.dataTable();             
                 dataTable.fnClearTable(1); 
                 dataTable.fnAddData(results.rows);                 
             } else {
               var dataTable = $(table).dataTable(
                                                 $.extend({"aaData":results.rows}, 
                                                     widget.options.defaultTableParams, 
                                                     widget.options.tableParams));
                $.data(table, "dataTable", dataTable); 
             }

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
       "tableParams": {},
       "oneshot":false
   }
 });          
})(jQuery);    