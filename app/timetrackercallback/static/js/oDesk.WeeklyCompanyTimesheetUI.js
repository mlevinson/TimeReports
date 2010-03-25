(function($){
    weeklyCompanyTimesheet = function(){
        oDesk.ReportPage.prototype.constructor.call(this);
        this.companySelectorFlavor = "hiring";
        $.extend(this.elements, {
            week:{
                tableCaption: "#time-week",
                selector: "#timereports_week_selector"
            }
        });
    };
    weeklyCompanyTimesheet.prototype = new oDesk.ReportPage();
    weeklyCompanyTimesheet.prototype.constructor = weeklyCompanyTimesheet;


    weeklyCompanyTimesheet.prototype.refreshReport = function(){
        $(this.elements.company.name).text(this.report.state.company.name);
        $(this.elements.team.name).text(this.report.state.team.name);
        $(this.elements.week.tableCaption).text(
            this.report.state.timeline.getDisplayNameWithAbbreviations());
        $(this.elements.report.container).oDeskDataTable("generateReport");
    };

    weeklyCompanyTimesheet.prototype.setSelectedDate = function(d){
        this.report.state.timeline = new oDesk.Timeline(this.parameters.timeline.type, d);
    };

    weeklyCompanyTimesheet.prototype.canRefreshReport = function(){
        if(!this.initComplete && this.report.state.company.id){
            this.initComplete = true;
            return true;
        }
        return false;
    };


    weeklyCompanyTimesheet.prototype.setParam = function(param, value){
        var ui = this;
        if(param == "go" && value == "go"){
            this.forceRefresh = true;
        } else if (param =="test" && value == "test") {
            oDesk.Services.getHours = function(report, success, failure){
               $.getJSON("js/weeklyTimesheet.json", function(data, status){
                   success(data, status);
               });
            };
        } else {
            oDesk.ReportPage.prototype.setParam.call(this, param, value);
        }
    };

    weeklyCompanyTimesheet.prototype.setDefaults = function(){
        this.setSelectedDate(Date.today());
    };

    weeklyCompanyTimesheet.prototype.completeInitialization = function(){
        var ui = this;
        $(ui.elements.week.selector)
            .weekSelector({weekStartDate: ui.report.state.timeline.startDate})
            .unbind("dateSelected").bind("dateSelected", function(e, selectedDate){
                ui.setSelectedDate(selectedDate);
            });
        $(ui.elements.report.container)
            .oDeskDataTable({report: ui.report, groupRows:true, service: oDesk.Services.getHours})
            .unbind("dataTablePopulated").bind("dataTablePopulated", function(){
                ui.bindTableHeaderHelp();
            });
    };

    weeklyCompanyTimesheet.prototype.init = function(){
        var ui = this;
        ui.initComplete = false;
        this.initialize({
            teamId: "team",
            startDate: "weekStart",
            test: "test"
        });
    };

    WeeklyCompanyTimesheet = new weeklyCompanyTimesheet();
})(jQuery);