(function($){

    oDesk.ReportPage = function(){
        this.report = null;
        this.companySelectorFlavor = "member";
        this.canBindCompanySelector = true;
        this.canBindDateRangeSelector = false;
        this.canBindTeamSelector = true;
        this.canBindProviderSelector = false;
        this.companyReference = null;
        this.canBindGoButton = true;
        this.providerSelectorOptions = {};
        this.companySelectorBound = false;
        this.teamSelectorBound = false;
        this.providerSelectorBound = false;
        this.dateRangeSelectorBound = false;
        this.elements = {
            company : {
                name: ".company-name",
                selector:"#top_selector"
            },
            provider : {
                name : ".provider-name",
                selector: "#timereports_provider_selector SELECT"
            },
            team : {
                 name : ".team-name",
                 selector: "#timereports_team_selector SELECT"
            },
            report: {
                home: "#reports_home",
                container: "#reports-grid",
                goButton: "#go_run_report"
            },
            help:{
                all: "th.details, th.diary",
                details: "th.details",
                providerDetails: "th.provider.details",
                teamDetails: "th.team.details",
                diary: "th.diary",
                help: "span.help"
            },
            timerange:{
                tableCaption: "#time-range",
                startDate: "#date_from",
                endDate: "#date_to"
            }
        };

        this.parameters = {
            company :{
                name: "company_ref",
                defaultValue: "49041"
            },
            timeline: {type:"week"}
        };
    };

    oDesk.ReportPage.prototype.decorateReportsHome = function(){
        var ui = this;
        var url = $(ui.elements.report.home).attr("href");
        var searchIndex = url.indexOf("?");
        if(searchIndex != -1){
         url = url.substr(0, searchIndex);
        }
        url += "?company_ref=";
        url += ui.report.state.company.reference;
        $(ui.elements.report.home).attr("href", url);
    };

    oDesk.ReportPage.prototype.canRefreshReport = function(){ return true;};

    oDesk.ReportPage.prototype.addLoadingIndicator = function(){
        var ui = this;
        $("body").ajaxStart(function(){
            loading_process("Loading...", false);
        });
        $("body").ajaxComplete(function(){
            loading_process();
            if(ui.canRefreshReport()){
                ui.refreshReport();
            }
        });
    };

    oDesk.ReportPage.prototype.setParam = function(param, value){
        var ui = this;
        if (param == "providerId") {
            ui.report.state.provider.id = value;
        } else if (param == "teamId") {
            ui.report.state.team.id = value;
        } else if (param == "startDate" && value){
            if(value){
                ui.report.state.timeline.setStartDate(Date.fromString(value, "yyyy-mm-dd"));
            }
        } else if (param == "endDate" && value){
            ui.report.state.timeline.setEndDate(Date.fromString(value, "yyyy-mm-dd"));
        }
    };

    oDesk.ReportPage.prototype.setDefaults = function(){};
    oDesk.ReportPage.prototype.completeInitialization = function(){};
    oDesk.ReportPage.prototype.validateState = function(){
        this.report.state.timeline.validateAndFix();
    };

    oDesk.ReportPage.prototype.initialize = function(parameters){
        var ui = this;
        ui.report = new oDesk.Report(ui.parameters.timeline.type);
        ui.setDefaults();

        ui.companyReference = oDeskUtil.getParameterByName(
                                    ui.parameters.company.name,
                                    ui.parameters.company.defaultValue);
        var params = parameters || {};
        $.each(params, function(param, name){
           ui.setParam(param, oDeskUtil.getParameterByName(name, null));
        });
        ui.validateState();
        ui.bindGoButton();
        ui.addLoadingIndicator();
        if(ui.canBindDateRangeSelector){
            ui.bindDateRangeSelector();
        }
        oDesk.Services.getAuthUserAndRoles(function(user){
            ui.report.state.authUser = user;
            ui.bindCompanySelector();
            ui.bindTeamSelector();
            ui.bindProviderSelector();
            ui.completeInitialization();
        });

    };

    oDesk.ReportPage.prototype.refreshReport = function(){};
    oDesk.ReportPage.prototype.companyChanged = function(company){
        var ui = this;
        ui.report.state.company = company;
        if(ui.canBindTeamSelector){
            ui.bindTeamSelector();
            $(ui.elements.team.selector).oDeskSelectWidget("populate");
        }
    };

    oDesk.ReportPage.prototype.providerChanged = function(team){};

    oDesk.ReportPage.prototype.teamChanged = function(team){
        var ui = this;
        if (ui.canBindProviderSelector){
            ui.bindProviderSelector();
            $(ui.elements.provider.selector).oDeskSelectWidget("populate");
        }
    };

    oDesk.ReportPage.prototype.bindGoButton = function(){
        var ui = this;
        if(!ui.canBindGoButton) return;
        $(ui.elements.report.goButton).unbind("click").bind("click", function(){
             ui.refreshReport();
             return false;
        });
    };

    oDesk.ReportPage.prototype.bindCompanySelector = function(){
        var ui = this;
        if(!ui.canBindCompanySelector || ui.companySelectorBound) return;
        $(ui.elements.company.selector).unbind("change").bind("change", function(event, selection){
            ui.report.state.company = selection.item;
            ui.decorateReportsHome();
            ui.companyChanged(selection.item);
        });
        ui.report.state.companySelectorFlavor = ui.companySelectorFlavor;
        $(ui.elements.company.selector).oDeskCompanySelector({
            showTeams: false,
            companies: ui.report.state.authUser.getCompanies(
                    oDesk.AuthUser.Flavors[ui.companySelectorFlavor]),
            selection: {
                reference: ui.companyReference
            }
        });
        ui.companySelectorBound = true;
    };

     oDesk.ReportPage.prototype.bindProviderSelector = function(){
        var ui = this;
        if(!ui.canBindProviderSelector || ui.providerSelectorBound) return;
        var defaults = {
            report: ui.report,
            includeAllOption: false,
            stateVariable: ui.report.state.provider,
            service: oDesk.Services.getProviders,
            useDisplayName: false
        };
        var opts = $.extend({}, defaults, ui.providerSelectorOptions);
        $(ui.elements.provider.selector).oDeskSelectWidget(opts)
        .unbind("selectionChanged").bind("selectionChanged", function(){
            ui.providerChanged(ui.report.state.provider);
        });
        ui.providerSelectorBound = true;
    };

    oDesk.ReportPage.prototype.bindDateRangeSelector = function(){
        var ui = this;
        if(!ui.canBindDateRangeSelector || ui.dateRangeSelectorBound) return;
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
        ui.dateRangeSelectorBound = true;
    };


    oDesk.ReportPage.prototype.bindTeamSelector = function(){
        var ui = this;
        if(!ui.canBindTeamSelector || ui.teamSelectorBound) return;
        $(ui.elements.team.selector).oDeskSelectWidget({
            report: ui.report,
            all_option_id: "all_teams",
            all_option_text: "All Teams",
            stateVariable: ui.report.state.team,
            service: oDesk.Services.getTeams
        })
        .unbind("selectionChanged").bind("selectionChanged", function(){
            ui.teamChanged(ui.report.state.team);
        });
        ui.teamSelectorBound = true;
    };

    oDesk.ReportPage.prototype.bindTableHeaderHelp = function(){
        var ui = this;
        $(ui.elements.help.all).each(function(){
            var help = $(this).children(ui.elements.help.help);
            var pos = $(this).position();
            var top = pos.top - help.outerHeight();
            $(this).children(ui.elements.help.help).css("top", top);
            $(this).children(ui.elements.help.help).css("left", pos.left);
        });
        $(ui.elements.help.all).unbind("mouseover").bind("mouseover", function(){
            $(this).children(ui.elements.help.help).show();
        }).unbind("mouseout").bind("mouseout", function(){
            $(this).children(ui.elements.help.help).hide();
        });
    }

})(jQuery);