(function($){

    taskSummary = function(){
        this.report = null;
        this.elements = {
            "company" : {
                "switcher":"#company_switcher",
                "selector":"#company_selector",
                "button":"#switch_company",
                "textbox": "#company_reference"
            },
            "timerange":{
                "tableCaption": "#time-range",
                "startDate": "#date_from",
                "endDate": "#date_to"
            },
            "team" : {
                "name" : ".team-name",
                "selector": "#reports_team_selector SELECT"
            },
            "report": {
                "container": "#reports-grid",
                "table": " .tabular",
                "goButton": "#go_run_report"
            }
        };

        this.parameters = {
            "company" :{
                "name": "company_ref",
                "defaultValue": "49041"
            },
            "timeline": {"type":"range"}
        };


        function setCompanyDefaults(){
            oDesk.Services.getCompany(this.report,
                oDeskUtil.getParameterByName(
                  this.parameters.company.name,
                  this.parameters.company.defaultValue), null);
            oDesk.Services.getTeams(this.report);
        };

        function refreshReport(){
            var ui = this;
            ui.setSelectedDateRange(
                    Date.fromString($(ui.elements.timerange.startDate).val()),
                    Date.fromString($(ui.elements.timerange.endDate).val())
                );
            $(ui.elements.team.name).text(ui.report.state.team.name);
            $(ui.elements.timerange.tableCaption).text(this.report.state.timeline.getDisplayName());
            $(ui.elements.report.container).oDeskDataTable("generateReport");
        };

        function setSelectedDateRange(d1, d2){
            var ui = this;
            this.report.state.timeline = new oDesk.Timeline(
                 this.parameters.timeline.type, d1, d2);
        };


        function init(){
            var ui = this;
            this.initComplete = false;
            this.report = new oDesk.Report(ui.parameters.timeline.type);
            if(oDeskUtil.getParameterByName("test", null) == "test"){
                oDesk.Services.getTaskSummary = function(report, success, failure){
                    $.getJSON("js/taskSummary.json", function(data){
                        oDesk.Services.addTaskDescriptions(report, data, success, failure);
                    });
                }
            }
            $(ui.elements.company.switcher).unbind("click").bind("click", function(){
                $(ui.elements.company.selector).slideToggle();
            });

            $(ui.elements.company.button).unbind("click").bind("click", function(){
                var new_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
                new_url += "?company_ref=";
                new_url += $(ui.elements.company.textbox).val();
                window.location.assign(new_url);
             });

             Date.format = "dd mmm yyyy";
             var d1 = Date.today();
             var d2 = d1.clone();
             d1.addDays(-30);
             this.setSelectedDateRange(d1, d2);

             $(ui.elements.timerange.startDate)
                .datePicker({startDate:'01/01/1996', clickInput:true, createButton:false})
                .dpSetSelected(d1.asString()) 
                .dpSetEndDate(d2.asString())
                .bind(
                        'dpClosed',
                        function(e, selectedDates)
                        {
                            var d = selectedDates[0];
                            if (d) {
                                d = new Date(d);
                                $(ui.elements.timerange.endDate).dpSetStartDate(d.addDays(1).asString());
                            }
                        }
                    );
             $(ui.elements.timerange.endDate)
                .datePicker({startDate:'01/01/1996', clickInput:true, createButton:false})
                .dpSetSelected(d2.asString())
                .dpSetStartDate(d1.asString())                
                .bind(
                        'dpClosed',
                        function(e, selectedDates)
                        {
                            var d = selectedDates[0];
                            if (d) {
                                d = new Date(d);
                                $(ui.elements.timerange.startDate).dpSetEndDate(d.addDays(-1).asString());
                            }
                        }
                    );
                    
             $(ui.elements.report.goButton).unbind("click").bind("click", function(){
                ui.refreshReport();
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

              $(ui.elements.report.container).oDeskDataTable({
                      report: ui.report,
                      service: oDesk.Services.getTaskSummary,
                      groupRows: true
              });

              $("body").ajaxStart(function(){
                 loading_process("Loading...", false);
              });
              $("body").ajaxComplete(function(){
                 loading_process();
                 if(!ui.initComplete && ui.report.state.company.id){
                    ui.initComplete = true;
                    ui.refreshReport();
                 }
              });
           };

           return {
             init:init,
             elements:elements,
             parameters:parameters,
             refreshReport: refreshReport,
             setCompanyDefaults:setCompanyDefaults,
             setSelectedDateRange: setSelectedDateRange
           };
    }();
})(jQuery);