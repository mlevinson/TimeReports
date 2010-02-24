(function($){
    providerSummary = function(){
        this.report = null;
        this.companyReference = null;
        this.elements = {
            company : {
                selector:"#top_selector"
            },
            team : {
                name : ".team-name",
                selector: "#timereports_team_selector SELECT"
            },
            week:{
                tableCaption: "#time-week",
                selector: "#timereports_week_selector"
            },
            report: {
                home: "#reports_home",
                container: "#reports-grid",
                goButton: "#go_run_report"
            }
        };
        this.parameters = {
            company :{
                name: "company_ref",
                defaultValue: "49041"
            },
            timeline: {type:"week"}
        };

        function refreshReport(){
              $(this.elements.team.name).text(this.report.state.team.name);
              $(this.elements.week.tableCaption).text(
                  this.report.state.timeline.getDisplayNameWithAbbreviations());
              $(this.elements.report.container).oDeskDataTable("generateReport");
        };

         function setSelectedDate(d){
             this.report.state.timeline = new oDesk.Timeline(this.parameters.timeline.type, d);
         };


         function bindCompanySelector(){
             var ui = this;
             $(ui.elements.company.selector).unbind("change").bind("change", function(event, selection){
                   ui.report.state.company = selection.item;
                   ui.bindTeamSelector();
                   ui.decorateReportsHome();
             });
             $(ui.elements.company.selector).oDeskCompanySelector({
                    showTeams: false,
                    companies: ui.report.state.authUser.getCompanies(oDesk.AuthUser.Flavors["manager"]),
                    selection: {
                        selectedReference: this.companyReference
                    }
              });
         };


         function bindTeamSelector(){
             var ui = this;

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
         };

         function decorateReportsHome(){
             var ui = this;
             var url = $(ui.elements.report.home).attr("href");
             var searchIndex = url.indexOf("?");
             if(searchIndex != -1){
                 url = url.substr(0, searchIndex);
             }
             url += "?company_ref=";
             url += ui.report.state.company.reference;
             $(ui.elements.report.home).attr("href", url);
         }

         function init(){
              var ui = this;
              this.initComplete = false;
              this.report = new oDesk.Report(ui.parameters.timeline.type);
              this.companyReference = oDeskUtil.getParameterByName(
                                        this.parameters.company.name,
                                        this.parameters.company.defaultValue);
              oDesk.Services.getAuthUserAndRoles(function(user){
                  ui.report.state.authUser = user;
                  ui.bindCompanySelector();
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
              init:init,
              elements:elements,
              parameters:parameters,
              refreshReport: refreshReport,
              setSelectedDate: setSelectedDate,
              bindCompanySelector: bindCompanySelector,
              bindTeamSelector: bindTeamSelector,
              decorateReportsHome: decorateReportsHome
          };
   }();
})(jQuery);