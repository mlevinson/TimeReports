(function($){
    providerHours = function(){
        this.report = null;
        this.elements = {
            "week":{
                "tableCaption": "#time-week",
                "selector": "#timereports_week_selector"
            },
            "report": {
                container: "#reports-grid",
                "goButton": "#go_run_report"
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
              var ui = this;
              $(this.elements.week.tableCaption).text(
                  this.report.state.timeline.getDisplayNameWithAbbreviations());
              $(this.elements.report.container).oDeskDataTable("generateReport");
        };

         function setSelectedDate(d){
             this.report.state.timeline = new oDesk.Timeline(this.parameters.timeline.type, d);
         };


         function init(){
              var ui = this;
              this.initComplete = false;
              this.report = new oDesk.Report(ui.parameters.timeline.type);


              oDesk.Services.getAuthUser(this.report, function(user){
                ui.report.state.provider.id = user.id;
                ui.report.state.provider.name = user.name;
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


               $(ui.elements.report.container)
                 .oDeskDataTable({"report": ui.report, "service": oDesk.Services.getProviderHours});

               $("body").ajaxStart(function(){
                         loading_process("Loading...", false);
                  });
               $("body").ajaxComplete(function(){
                   loading_process();
                   if(!ui.initComplete && ui.report.state.authUser.id){
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