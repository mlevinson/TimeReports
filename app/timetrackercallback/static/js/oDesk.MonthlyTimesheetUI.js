(function($){
    monthlyTimeSheet = function(){
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
            "provider" : {
                "name" : ".provider-name",
                "selector": "#timereports_provider_selector SELECT"
            },
            "timeline":{
                "tableCaption": "#time-month-name",
                "selector": "#month_year_display"
            },
            "report": {
                container: "#reports-grid",
                "goButton": "#go_run_report",
                "displayType": "#display_type .radio",
                "displayTypeHours": "#display_type #hours",
                "hoursOrCharges": ".hours_label"
            }
        };
        this.parameters = {
            "company" :{
                "name": "company_ref",
                "defaultValue": "49041"
            },
            "timeline": {"type":"month"}
        };

        function refreshReport(){ 
              $(this.elements.provider.name).text(this.report.state.provider.name);
              $(this.elements.team.name).text(this.report.state.team.name);
              $(this.elements.timeline.tableCaption).text(this.report.state.timeline.getDisplayName());
              $(this.elements.report.container).oDeskDataTable("generateReport");
        };

         function setSelectedDate(d){
             this.report.state.timeline = new oDesk.Timeline(this.parameters.timeline.type, d);
         };

         function setCompanyDefaults(){
              oDesk.Services.getCompany(this.report,
                  oDeskUtil.getParameterByName(this.parameters.company.name,
                      this.parameters.company.defaultValue), null);
         };

         function bindCompany(){
             var ui = this;
             $(ui.elements.company.switcher).unbind("click").bind("click", function(){
                    $(ui.elements.company.selector).slideToggle();
               });
               $(ui.elements.company.button).unbind("click").bind("click", function(){
                   var new_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
                   new_url += "?company_ref=";
                   new_url += $(ui.elements.company.textbox).val();
                   window.location.assign(new_url);
               });
         }

         function bindGoButton(){
            var ui = this;
            $(ui.elements.report.goButton).unbind("click").bind("click", function(){
               ui.refreshReport();
            });
         }

         function bindTeamSelector(){
            var ui = this;
              $(ui.elements.team.selector).oDeskSelectWidget({
                   report: ui.report,
                   all_option_id: "all_teams",
                   all_option_text: "All Teams",
                   stateVariable: ui.report.state.team,
                   service: oDesk.Services.getTeams
                })
                .unbind("selectionChanged").bind("selectionChanged", function(){
                    $(ui.elements.provider.selector).oDeskSelectWidget("populate");
                })
                .unbind("populationComplete").bind("populationComplete", function(){
                   $(this).oDeskSelectWidget("setDefaults");
                }).oDeskSelectWidget("populate");
         }

         function bindProviderSelector(){
            var ui = this;
             $(ui.elements.provider.selector).oDeskSelectWidget({
                    report: ui.report,
                    all_option_id: "all_providers",
                    all_option_text: "All providers",
                    stateVariable: ui.report.state.provider,
                    service: oDesk.Services.getProviders,
                    useDisplayName: true
                })
                .unbind("populationComplete").bind("populationComplete", function(){
                    var selectedProviderId = ui.report.state.provider.id;
                    var selectedProviderOption = ui.elements.provider.selector + " #" + selectedProviderId;
                    if(!selectedProviderId || !$(selectedProviderOption).length){
                        $(this).oDeskSelectWidget("setDefaults");
                    } else {
                        $(selectedProviderOption).each(function(){
                            this.selected = true;
                        });
                    }
                 }).oDeskSelectWidget("populate");
         }

         function init(){
              var ui = this;
              ui.initComplete = false;
              ui.report = new oDesk.Report(ui.parameters.timeline.type);
              ui.report.state.mustGetHours = true;
              ui.bindCompany();
              ui.bindGoButton();
              ui.setSelectedDate(Date.today());
              $(ui.elements.timeline.selector)
                .ringceMonthSelector()
                .unbind("monthSelected").bind("monthSelected", function(e, selectedDate){
                    ui.setSelectedDate(selectedDate);
              });

              $(ui.elements.report.displayType).unbind("click").bind("click", function(){
                  if($(this).hasClass("selected")) return false;
                  $(ui.elements.report.displayType).toggleClass("selected");
                  ui.report.state.mustGetHours = $(ui.elements.report.displayTypeHours).hasClass("selected");
                  $(ui.elements.report.hoursOrCharges).text(ui.report.state.mustGetHours?"Hours":"Charges");
                  ui.refreshReport();
                  return false;
              });

              ui.setCompanyDefaults();
              ui.bindTeamSelector();
              ui.bindProviderSelector();
              $(ui.elements.report.container)
                .oDeskDataTable({"report": ui.report, "service": oDesk.Services.getHours});

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
             "setSelectedDate": setSelectedDate,
             "setCompanyDefaults": setCompanyDefaults,
             "bindTeamSelector": bindTeamSelector,
             "bindProviderSelector": bindProviderSelector,
             "bindCompany": bindCompany,
             "bindGoButton": bindGoButton
           };
    }();
})(jQuery);