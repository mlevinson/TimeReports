(function($){

    oDesk.ReportPage = function(){
        this.report = null;
        this.companySelectorFlavor = "member";
        this.canBindCompanySelector = true;
        this.canBindTeamSelector = true;
        this.canBindProviderSelector = false;
        this.companyReference = null;
        this.canBindGoButton = true;
        this.providerSelectorOptions = {};
        this.companySelectorBound = false;
        this.teamSelectorBound = false;
        this.providerSelectorBound = false;
        this.elements = {
            company : {
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
        } else if (param == "startDate"){
            if(value){
                ui.report.state.timeline.startDate = Date.fromString(value, "yyyy-mm-dd");
            }
        }  else if (param == "endDate"){
            if(value){
                ui.report.state.timeline.endDate = Date.fromString(value, "yyyy-mm-dd");
            }
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
        $(ui.elements.provider.selector).oDeskSelectWidget(
            $.extend({}, defaults, ui.providerSelectorOptions)
        );
        ui.providerSelectorBound = true;
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



})(jQuery);