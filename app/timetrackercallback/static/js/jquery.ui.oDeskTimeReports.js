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
     generateReport: function(){
         var dataTable = this.options.dataTable;
         var report = this.options.report;
         dataTable.fnClearTable(1);
         var url = report.getHoursQuery();
         if(!url) return;
         var widget = this; 
         $.getJSON(url, function(data){
             var results = report.transformData(data);
             dataTable.fnAddData(results.rows);
             $(widget.element[0]).trigger("dataTablePopulated", results);
         });
     }
    
});      
    
$.extend($.ui.oDeskTimeReports, {
   defaults: {
       "report": null,
       "tableParams": {}
   }
 });          
})(jQuery);    