(function($){
    providerSummary = function(){  
        this.report = null;
        this.elements = {
            "company" : {
                "switcher":"#company_switcher",
                "selector":"#company_selector",
                "button":"#switch_company",
                "textbox": "#company_reference" 
            },
            "team" : {
                "name" : ".team-name",
                "selector": "#timereports_team_selector SELECT"
            },
            "week":{
                "tableCaption": "#time-week",
                "selector": "#timereports_week_selector"
            },
            "report": {
                "table": "#time-reports-grid",
                "goButton": "#go_run_report",
                "grandTotal": {
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
              $(this.elements.team.name).text(this.report.state.team.name);
              $(this.elements.week.tableCaption).text(
                  this.report.state.timeline.getDisplayNameWithAbbreviations());       
              $(this.elements.report.table).oDeskTimeReports("generateReport");                                             
        };
    
         function setSelectedDate(d){   
             this.report.state.timeline = new oDesk.Timeline(this.parameters.timeline.type, d);
         }; 
     
         function setCompanyDefaults(){                           
              oDesk.Services.getCompany(this.report, 
                  getParameterByName(this.parameters.company.name, 
                      this.parameters.company.defaultValue), null);
         };
     
         function init(){ 
              var ui = this;                          
              this.initComplete = false;
              this.report = new oDesk.Report(ui.parameters.timeline.type);
              $(ui.elements.company.switcher).unbind("click").bind("click", function(){
                   $(ui.elements.company.selector).slideToggle(); 
              });
              $(ui.elements.company.button).unbind("click").bind("click", function(){
                  var new_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
                  new_url += "?company_ref=";
                  new_url += $(ui.elements.company.textbox).val();
                  window.location.assign(new_url);
              });
            
              $(ui.elements.report.goButton).unbind("click").bind("click", function(){
                 ui.refreshReport(); 
              });

              this.setSelectedDate(Date.today());    
            
              $(ui.elements.week.selector)
                .weekSelector({weekStartDate: ui.report.state.timeline.startDate})
                .unbind("dateSelected").bind("dateSelected", function(e, selectedDate){
                 ui.setSelectedDate(selectedDate);
              });     

              this.setCompanyDefaults();
              $(ui.elements.team.selector).oDeskSelectWidget({ 
                  report: ui.report,  
                  all_option_id: "all_teams",
                  all_option_text: "All Teams",
                  stateVariable: ui.report.state.team,
                  service: oDesk.Services.getTeams
               })
               .unbind("populationComplete").bind("populationComplete", function(){
                  $(this).oDeskSelectWidget("setDefaults"); 
               }).oDeskSelectWidget("populate");

               $(ui.elements.report.table)
                 .oDeskTimeReports({"report": ui.report})
                 .unbind("dataTablePopulated").bind("dataTablePopulated", function(e, results){
                       $(ui.elements.report.grandTotal.hours).text(
                           floatToTime(results.grandTotalHours));
                       $(ui.elements.report.grandTotal.charges).text(
                           currencyFromNumber(results.grandTotalCharges)); 
               });

               $("body").ajaxComplete(function(){
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
             "setSelectedDate": setSelectedDate,
             "setCompanyDefaults": setCompanyDefaults
           };
    }();
})(jQuery);       