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

        $.extend(this.elements.report, {
            displayType: "#display_type .radio",
            displayTypeHours: "#display_type #hours",
            hoursOrCharges: ".hours_label"
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
        if(!this.initComplete && this.report.state.company.id){
            this.initComplete = true;
            return true;
        }
        return false;
    };

    monthlyProviderTimesheet.prototype.setDefaults = function(){
        this.report.state.mustGetHours = true;
        this.setSelectedDate(Date.today());
    };

    monthlyProviderTimesheet.prototype.completeInitialization = function(){
        var ui = this;
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
            useDisplayName:true
        };
        this.canBindProviderSelector = true;
        this.initialize(function(){

        });
    };

    MonthlyProviderTimesheet = new monthlyProviderTimesheet();
})(jQuery);