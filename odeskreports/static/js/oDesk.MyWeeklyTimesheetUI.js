(function($){
    myWeeklyTimesheet = function(){
        oDesk.ReportPage.prototype.constructor.call(this);
        this.canBindCompanySelector = false;
        this.canBindTeamSelector = false;
        $.extend(this.elements, {
            provider: {
              name: ".provider-name"
            },
            week:{
                tableCaption: "#time-week",
                selector: "#timereports_week_selector"
            }
        });
    };
    myWeeklyTimesheet.prototype = new oDesk.ReportPage();
    myWeeklyTimesheet.prototype.constructor = myWeeklyTimesheet;


    myWeeklyTimesheet.prototype.refreshReport = function(){
        var ui = this;
        $(this.elements.week.tableCaption).text(
            this.report.state.timeline.getDisplayNameWithAbbreviations());
        $(this.elements.provider.name).text(ui.report.state.provider.name);
        $(this.elements.report.container).oDeskDataTable("generateReport");
    };

    myWeeklyTimesheet.prototype.setSelectedDate = function(d){
        this.report.state.timeline = new oDesk.Timeline(this.parameters.timeline.type, d);
    };

    myWeeklyTimesheet.prototype.canRefreshReport = function(){
        if(!this.initComplete && this.report.state.authUser.id){
            this.initComplete = true;
            return true;
        }
        return false;
    };

    myWeeklyTimesheet.prototype.init = function(){
        var ui = this;
        ui.initComplete = false;
        if(oDeskUtil.getParameterByName("test", null) == "test"){
            oDesk.Services.getProviderHours = function(report, success, failure){
                $.getJSON("js/mytimesheet.json", success);
            };
        }
        this.initialize(function(){
            ui.report.state.provider.id = ui.report.state.authUser.id;
            ui.report.state.provider.name = ui.report.state.authUser.name;
            $(ui.elements.week.selector)
                .weekSelector({weekStartDate: ui.report.state.timeline.startDate})
                .unbind("dateSelected").bind("dateSelected", function(e, selectedDate){
                    ui.setSelectedDate(selectedDate);
                });
            $(ui.elements.report.container)
                    .oDeskDataTable({groupRows:true, report: ui.report, service: oDesk.Services.getProviderHours});
            ui.setSelectedDate(Date.today());
        });
    };

    MyWeeklyTimesheet = new myWeeklyTimesheet();
})(jQuery);