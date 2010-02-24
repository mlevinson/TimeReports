(function($){
    monthlyProviderTimesheet = function(){
        oDesk.ReportPage.prototype.constructor.call(this);
        $.extend(this.elements, {
            team : {
                name : ".team-name",
                selector: "#timereports_team_selector SELECT"
            },
            provider : {
                name : ".provider-name",
                selector: "#timereports_provider_selector SELECT"
            },
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

    monthlyProviderTimesheet.prototype.companyChanged = function(company){
        var ui = this;
        ui.report.state.company = company;
        $(ui.elements.team.selector).oDeskSelectWidget("populate");
    };

    monthlyProviderTimesheet.prototype.bindTeamSelector = function(){
        var ui = this;

        $(ui.elements.team.selector).oDeskSelectWidget({
            report: ui.report,
            all_option_id: "all_teams",
            all_option_text: "All Teams",
            stateVariable: ui.report.state.team,
            service: oDesk.Services.getTeams
        })
        .unbind("selectionChanged").bind("selectionChanged", function(){
            $(ui.elements.provider.selector).oDeskSelectWidget("populate");
        })
        .unbind("populationComplete").bind("populationComplete", function(){
            $(this).oDeskSelectWidget("setDefaults");
        }).oDeskSelectWidget("populate");
    };


    monthlyProviderTimesheet.prototype.bindProviderSelector = function(){
        var ui = this;
         $(ui.elements.provider.selector).oDeskSelectWidget({
                report: ui.report,
                all_option_id: "all_providers",
                all_option_text: "All providers",
                stateVariable: ui.report.state.provider,
                service: oDesk.Services.getProviders,
                useDisplayName: true
            })
            .unbind("populationComplete").bind("populationComplete", function(){
                var selectedProviderId = ui.report.state.provider.id;
                var selectedProviderOption = ui.elements.provider.selector + " #" + selectedProviderId;
                if(!selectedProviderId || !$(selectedProviderOption).length){
                    $(this).oDeskSelectWidget("setDefaults");
                } else {
                    $(selectedProviderOption).each(function(){
                        this.selected = true;
                    });
                }
             }).oDeskSelectWidget("populate");
    };

    monthlyProviderTimesheet.prototype.canRefreshReport = function(){
        if(!this.initComplete && this.report.state.company.id){
            this.initComplete = true;
            return true;
        }
        return false;
    };

    monthlyProviderTimesheet.prototype.init = function(){
        var ui = this;
        ui.initComplete = false;
        this.initialize(function(){
            ui.report.state.mustGetHours = true;
            ui.bindTeamSelector();
            ui.bindProviderSelector();

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
                    .oDeskDataTable({report: ui.report, service: oDesk.Services.getHours});
            ui.setSelectedDate(Date.today());
        });
    };
})(jQuery);