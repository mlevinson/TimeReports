(function($){
    taskSummaryReport = function(){
        oDesk.ReportPage.prototype.constructor.call(this);
        this.companySelectorFlavor = "hiring";
        this.providerSummary = false;
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
    taskSummaryReport.prototype = new oDesk.ReportPage();
    taskSummaryReport.prototype.constructor = taskSummaryReport;


    taskSummaryReport.prototype.refreshReport = function(){
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

    taskSummaryReport.prototype.setSelectedDateRange = function(d1, d2){
        var ui = this;
        this.report.state.timeline = new oDesk.Timeline(
             this.parameters.timeline.type, d1, d2);
    };

    taskSummaryReport.prototype.bindTimeSelector = function(){
        var ui = this;
        Date.format = "dd mmm yyyy";
        var d1 = Date.today();
        var d2 = d1.clone();
        d1.addDays(-30);
        this.setSelectedDateRange(d1, d2);

        $(ui.elements.timerange.startDate)
            .datePicker({startDate:'01/01/1996', clickInput:true, createButton:false})
            .dpSetSelected(d1.asString())
            .dpSetEndDate(d2.asString())
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
            .dpSetSelected(d2.asString())
            .dpSetStartDate(d1.asString())
            .bind('dpClosed', function(e, selectedDates){
                var d = selectedDates[0];
                if (d) {
                    d = new Date(d);
                        $(ui.elements.timerange.startDate).dpSetEndDate(d.addDays(-1).asString());
                    }
                }
            );
    };


    taskSummaryReport.prototype.setParam = function(param, value){
        if(param == "go" && value == "go"){
            this.forceRefresh = true;
        } else if (param =="test" && value == "test") {
            oDesk.Services.getTaskSummary = function(report, success, failure){
               $.getJSON("js/taskSummary.json", function(data){
                   oDesk.Services.addTaskDescriptions(report, data, success, failure);
               });
            };
        }else {
            oDesk.ReportPage.prototype.setParam.call(this, param, value);
        }
    };

    taskSummaryReport.prototype.canRefreshReport = function(){
        return false;
    };

    taskSummaryReport.prototype.completeInitialization = function(){
        var ui = this;
        ui.report.providerSummary = this.providerSummary;
        ui.bindTimeSelector();
        $(ui.elements.report.container)
                .oDeskDataTable({report: ui.report, service: oDesk.Services.getTaskSummary, groupRows:true});
    };

    taskSummaryReport.prototype.init = function(){
        var ui = this;
        ui.initComplete = false;
        this.initialize({go:"go", test:"test"});
    };

    TaskSummaryReport = new taskSummaryReport();
})(jQuery);