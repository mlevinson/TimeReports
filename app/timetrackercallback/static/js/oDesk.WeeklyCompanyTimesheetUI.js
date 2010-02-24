(function($){
    weeklyCompanyTimesheet = function(){
        oDesk.ReportPage.prototype.constructor.call(this);
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

    weeklyCompanyTimesheet.prototype.init = function(){
        var ui = this;
        ui.initComplete = false;
        this.initialize(function(){
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
    
    WeeklyCompanyTimesheet = new weeklyCompanyTimesheet();
})(jQuery);