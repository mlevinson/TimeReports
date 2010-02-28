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
           content: "#report_content",
           displayType: {
               all: "#display_type .toggle",
               compact: "#compact",
               complete: "#complete"
           },
           memo: "td.timesheet_details_memo pre"
        });
        this.parameters.timeline.type = "range";
    };
    timesheetDetails.prototype = new oDesk.ReportPage();
    timesheetDetails.prototype.constructor = timesheetDetails;


    timesheetDetails.prototype.refreshReport = function(){
        var ui = this;
        $(ui.elements.report.placeholder).hide();
        $(ui.elements.report.content).show();
        ui.setSelectedDateRange(
                Date.fromString($(ui.elements.timerange.startDate).val()),
                Date.fromString($(ui.elements.timerange.endDate).val())
            );
        $(ui.elements.team.name).text(ui.report.state.team.name);
        $(ui.elements.provider.name).text(ui.report.state.provider.name);
        $(ui.elements.timerange.tableCaption).text(this.report.state.timeline.getDisplayName());
        $(ui.elements.report.container).oDeskDataTable("generateReport");
    };

    timesheetDetails.prototype.setParam = function(param, value){
        if(param == "go" && value == "go"){
            this.forceRefresh = true;
        } else if (param =="test" && value == "test") {
            oDesk.Services.getTimesheetDetails = function(report, success, failure){
               $.getJSON("js/timesheetDetails.json", function(data){
                   success(new oDesk.DataSource.ResultSet(data));
               });
            };
        }else {
            oDesk.ReportPage.prototype.setParam.call(this, param, value);
        }
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

    timesheetDetails.prototype.canRefreshReport = function(){
        if(!this.initComplete && this.forceRefresh &&
                this.report.state.company.id &&
                this.report.state.provider.id){
            this.initComplete = true;
            return true;
        }
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
        ui.bindTimeSelector();
        $(ui.elements.report.container)
                    .oDeskDataTable({
                        report: ui.report,
                        service: oDesk.Services.getTimesheetDetails,
                        groupRows:true})
                    .bind('dataTablePopulated', function(){
                        $(ui.elements.report.memo).compactness();
                    });
        $(ui.elements.report.displayType.compact).click(function(){
            $(ui.elements.report.displayType.all).removeClass("selected");
            $(this).addClass("selected");
           $(ui.elements.report.memo).compactness("compact");
        });
        $(ui.elements.report.displayType.complete).click(function(){
            $(ui.elements.report.displayType.all).removeClass("selected");
            $(this).addClass("selected");
           $(ui.elements.report.memo).compactness("remove");
        });
    };

    timesheetDetails.prototype.init = function(){
        var ui = this;
        this.initialize({
            providerId: "provider",
            teamId: "team",
            startDate:"startDate",
            endDate:"endDate",
            go:"go",
            test: "test"
        });
    };

    TimesheetDetails = new timesheetDetails();
})(jQuery);