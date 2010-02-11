(function($){
    providerHours = function(){  
        this.report = null;
        this.elements = {
            "provider":{
              "id": "#provider_id"  
            },
            "week":{
                "tableCaption": "#time-week",
                "selector": "#timereports_week_selector"
            },
            "report": {
                "table": "#time-reports-grid",
                "goButton": "#go_run_report",
                "grandTotal": { 
                    "days": ".total.day span",
                    "hours": "#grand_total_hours",
                    "charges": "#grand_total_charges"
                } 
            }  
        };
        this.parameters = {
            "company" :{
                "name": "company_ref",
                "defaultValue": "49041"
            },
            "timeline": {"type":"week"}
        };     
    
        function refreshReport(){
              $(this.elements.week.tableCaption).text(
                  this.report.state.timeline.getDisplayNameWithAbbreviations()); 
              this.report.state.provider.id = $(this.elements.provider.id).val();
              $(this.elements.report.table).oDeskTimeReports("generateReport");                                             
        };
    
         function setSelectedDate(d){   
             this.report.state.timeline = new oDesk.Timeline(this.parameters.timeline.type, d);
         }; 
     
     
         function init(){ 
              var ui = this;                          
              this.initComplete = false;
              this.report = new oDesk.Report(ui.parameters.timeline.type);
            
              $(ui.elements.report.goButton).unbind("click").bind("click", function(){
                 ui.refreshReport(); 
              });

              this.setSelectedDate(Date.today());    
            
              $(ui.elements.week.selector)
                .weekSelector({weekStartDate: ui.report.state.timeline.startDate})
                .unbind("dateSelected").bind("dateSelected", function(e, selectedDate){
                 ui.setSelectedDate(selectedDate);
              });     

           
               $(ui.elements.report.table)
                 .oDeskTimeReports({"report": ui.report, "service": oDesk.Services.getProviderHours})
                 .unbind("dataTablePopulated").bind("dataTablePopulated", function(e, results){
                       var grandTotalHours = results ? results.grandTotalHours : 0;  
                       var grandTotalCharges = results ? results.grandTotalCharges : 0;                       
                       var dayTotals = results? results.dayTotals : [0,0,0,0,0,0,0];
                       $(ui.elements.report.grandTotal.days).each(function(index, element){  
                            var value = dayTotals[index] == 0 ? "" : oDeskUtil.floatToTime(dayTotals[index]);
                            $(element).text(value); 
                       });                      
                       $(ui.elements.report.grandTotal.hours).text(
                           oDeskUtil.floatToTime(grandTotalHours));
                       $(ui.elements.report.grandTotal.charges).text(
                           currencyFromNumber(grandTotalCharges)); 
               });
               $("body").ajaxStart(function(){
                         loading_process("Loading...", false); 
                  });
               $("body").ajaxComplete(function(){ 
                   loading_process();
                   if(!ui.initComplete && ui.report.state.company.id){
                       ui.refreshReport();
                       ui.initComplete = true;     
                   }
               });   
           };  
           
           return {
             "init":init,
             "elements":elements,
             "parameters":parameters,             
             "refreshReport": refreshReport,
             "setSelectedDate": setSelectedDate
           };
    }();
})(jQuery);