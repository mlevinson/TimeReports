(function($){
    timesheetDetails = function(){
        oDesk.ReportPage.prototype.constructor.call(this);
        this.companySelectorFlavor = "hiring";
        this.canBindProviderSelector = true;
        this.canBindDateRange = true;
        $.extend(this.elements, {
            timerange:{
                tableCaption: "#time-range",
                startDate: "#date_from",
                endDate: "#date_to"
            }
        });
        $.extend(this.elements.report, {
           placeholder: "#report_placeholder",
           content: "#report_content"
        });
        this.parameters.timeline.type = "range";
    };
    timesheetDetails.prototype = new oDesk.ReportPage();
    timesheetDetails.prototype.constructor = timesheetDetails;


    timesheetDetails.prototype.refreshReport = function(){
        var ui = this;
        ui.setSelectedDateRange(
                Date.fromString($(ui.elements.timerange.startDate).val()),
                Date.fromString($(ui.elements.timerange.endDate).val())
            );
        $(ui.elements.team.name).text(ui.report.state.team.name);
        $(ui.elements.timerange.tableCaption).text(this.report.state.timeline.getDisplayName());
        $(ui.elements.report.placeholder).hide();
        $(ui.elements.report.content).show();
        $(ui.elements.report.container).oDeskDataTable("generateReport");
    };

    timesheetDetails.prototype.setSelectedDateRange = function(d1, d2){
        var ui = this;
        this.report.state.timeline = new oDesk.Timeline(
             this.parameters.timeline.type, d1, d2);
    };

    timesheetDetails.prototype.bindTimeSelector = function(){
        var ui = this;
        $(ui.elements.timerange.startDate)
            .datePicker({startDate:'01/01/1996', clickInput:true, createButton:false})
            .dpSetSelected(ui.report.state.timeline.startDate.asString())
            .dpSetEndDate(ui.report.state.timeline.endDate.asString())
            .bind('dpClosed', function(e, selectedDates){
                var d = selectedDates[0];
                if (d) {
                    d = new Date(d);
                    $(ui.elements.timerange.endDate).dpSetStartDate(d.addDays(1).asString());
                }
            }
        );
        $(ui.elements.timerange.endDate)
            .datePicker({startDate:'01/01/1996', clickInput:true, createButton:false})
            .dpSetSelected(ui.report.state.timeline.endDate.asString())
            .dpSetStartDate(ui.report.state.timeline.startDate.asString())
            .bind('dpClosed', function(e, selectedDates){
                var d = selectedDates[0];
                if (d) {
                    d = new Date(d);
                        $(ui.elements.timerange.startDate).dpSetEndDate(d.addDays(-1).asString());
                    }
                }
            );
    };

    timesheetDetails.prototype.teamChanged = function(company){
        var ui = this;
        $(ui.elements.provider.selector).oDeskSelectWidget("populate");
    };

    timesheetDetails.prototype.canRefreshReport = function(){
        return false;
    };

    timesheetDetails.prototype.setDefaults = function(){
        Date.format = "dd mmm yyyy";
        var d1 = Date.today();
        var d2 = d1.clone();
        d1.addDays(-30);
        this.setSelectedDateRange(d1, d2);
    };

    timesheetDetails.prototype.completeInitialization = function(){
        var ui = this;
        ui.bindProviderSelector();
        ui.bindTimeSelector();
        $(ui.elements.report.container)
                    .oDeskDataTable({
                        report: ui.report,
                        service: oDesk.Services.getTaskSummary,
                        groupRows:true});
    };

    timesheetDetails.prototype.init = function(){
        var ui = this;
        this.initialize({
            providerId: "provider",
            teamId: "team",
            startDate:"startDate",
            endDate:"endDate"});
    };

    TimesheetDetails = new timesheetDetails();
})(jQuery);