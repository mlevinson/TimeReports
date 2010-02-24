(function($){
    weeklyCompanyTimesheet = function(){
        oDesk.ReportPage.prototype.constructor.call(this);
        $.extend(this.elements, {
                    team : {
                        name : ".team-name",
                        selector: "#timereports_team_selector SELECT"
                    },
                    week:{
                        tableCaption: "#time-week",
                        selector: "#timereports_week_selector"
                    }
        });
    };
    weeklyCompanyTimesheet.prototype = new oDesk.ReportPage();
    weeklyCompanyTimesheet.prototype.constructor = weeklyCompanyTimesheet;


    weeklyCompanyTimesheet.prototype.refreshReport = function(){
        $(this.elements.team.name).text(this.report.state.team.name);
        $(this.elements.week.tableCaption).text(
            this.report.state.timeline.getDisplayNameWithAbbreviations());
        $(this.elements.report.container).oDeskDataTable("generateReport");
    };

    weeklyCompanyTimesheet.prototype.setSelectedDate = function(d){
        this.report.state.timeline = new oDesk.Timeline(this.parameters.timeline.type, d);
    };

    weeklyCompanyTimesheet.prototype.companyChanged = function(company){
        var ui = this;
        ui.report.state.company = company;
        $(ui.elements.team.selector).oDeskSelectWidget("populate");
    };

    weeklyCompanyTimesheet.prototype.bindTeamSelector = function(){
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

    weeklyCompanyTimesheet.prototype.canRefreshReport = function(){
        if(!this.initComplete && this.report.state.company.id){
            this.initComplete = true;
            return true;
        }
        return false;
    };

    weeklyCompanyTimesheet.prototype.init = function(){
        var ui = this;
        ui.initComplete = false;
        this.initialize(function(){
            ui.bindTeamSelector();
            $(ui.elements.week.selector)
                .weekSelector({weekStartDate: ui.report.state.timeline.startDate})
                .unbind("dateSelected").bind("dateSelected", function(e, selectedDate){
                    ui.setSelectedDate(selectedDate);
                });
            $(ui.elements.report.container)
                    .oDeskDataTable({report: ui.report, service: oDesk.Services.getHours});
            ui.setSelectedDate(Date.today());
        });
    };
})(jQuery);