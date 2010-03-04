(function($){
    monthlyProviderTimesheet = function(){
        oDesk.ReportPage.prototype.constructor.call(this);
        this.companySelectorFlavor = "hiring";
        $.extend(this.elements, {
            timeline:{
                tableCaption: "#time-month-name",
                selector: "#month_year_display"
            }
        });

        this.parameters.timeline.type = "month";
    };
    monthlyProviderTimesheet.prototype = new oDesk.ReportPage();
    monthlyProviderTimesheet.prototype.constructor = monthlyProviderTimesheet;


    monthlyProviderTimesheet.prototype.refreshReport = function(){
        $(this.elements.provider.name).text(this.report.state.provider.name);
        $(this.elements.team.name).text(this.report.state.team.name);
        $(this.elements.timeline.tableCaption).text(this.report.state.timeline.getDisplayName());
        $(this.elements.report.container).oDeskDataTable("generateReport");
    };

    monthlyProviderTimesheet.prototype.setSelectedDate = function(d){
        this.report.state.timeline = new oDesk.Timeline(this.parameters.timeline.type, d);
    };

    monthlyProviderTimesheet.prototype.canRefreshReport = function(){
        if(!this.initComplete && this.report.state.company.id && this.report.state.provider.name){
            this.initComplete = true;
            return true;
        }
        return false;
    };

    monthlyProviderTimesheet.prototype.setParam = function(param, value){
        var ui = this;
        if(param == "go" && value == "go"){
            this.forceRefresh = true;
        } else if (param =="test" && value == "test") {
            var d = Date.parseExact("20100201", "yyyyMMdd");
            ui.setSelectedDate(d);
            $(ui.elements.timeline.selector).ringceMonthSelector("selectDate", d);
            oDesk.Services.getHours = function(report, success, failure){
               $.getJSON("js/monthlytimesheet.json", function(data, status){
                   success(data, status);
               });
            };
        } else {
            oDesk.ReportPage.prototype.setParam.call(this, param, value);
        }
    };


    monthlyProviderTimesheet.prototype.setDefaults = function(){
        this.setSelectedDate(Date.today());
    };

    monthlyProviderTimesheet.prototype.completeInitialization = function(){
        var ui = this;
        $(ui.elements.timeline.selector)
            .ringceMonthSelector()
            .ringceMonthSelector("selectDate", ui.report.state.timeline.startDate)
            .unbind("monthSelected").bind("monthSelected", function(e, selectedDate){
                ui.setSelectedDate(selectedDate);
        });

        $(ui.elements.report.container)
                .oDeskDataTable({report: ui.report, service: oDesk.Services.getHours})
                .unbind("dataTablePopulated").bind("dataTablePopulated", function(){
                      ui.bindTableHeaderHelp();
                  });
    };

    monthlyProviderTimesheet.prototype.init = function(){
        var ui = this;
        ui.initComplete = false;
        this.providerSelectorOptions = {
            useDisplayName:true,
            all_option_id: "all_providers",
            all_option_text: "All Providers",
            includeAllOption:true

        };
        this.canBindProviderSelector = true;
        this.initialize({
            test:"test",
            providerId:"provider",
            teamId:"team",
            go:"go",
            startDate: "startDate"
        });
    };

    MonthlyProviderTimesheet = new monthlyProviderTimesheet();
})(jQuery);