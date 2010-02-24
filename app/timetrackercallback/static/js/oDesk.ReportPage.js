(function($){

    oDesk.ReportPage = function(){
        this.report = null;
        this.canBindCompanySelector = true;
        this.companyReference = null;
        this.canBindGoButton = true;
        this.elements = {
            company : {
                selector:"#top_selector"
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


    oDesk.ReportPage.prototype.initialize = function(initComplete){
        var ui = this;
        ui.report = new oDesk.Report(ui.parameters.timeline.type);
        ui.companyReference = oDeskUtil.getParameterByName(
                                    ui.parameters.company.name,
                                    ui.parameters.company.defaultValue);
        ui.bindGoButton();
        ui.addLoadingIndicator();
        oDesk.Services.getAuthUserAndRoles(function(user){
            ui.report.state.authUser = user;
            ui.bindCompanySelector();
            if($.isFunction(initComplete)){
                initComplete();
            }
        });

    };

    oDesk.ReportPage.prototype.refreshReport = function(){};
    oDesk.ReportPage.prototype.companyChanged = function(company){};

    oDesk.ReportPage.prototype.bindGoButton = function(){
        var ui = this;
        if(!ui.canBindGoButton) return;
        $(ui.elements.report.goButton).unbind("click").bind("click", function(){
             ui.refreshReport();
        });
    };

    oDesk.ReportPage.prototype.bindCompanySelector = function(){
        var ui = this;
        if(!ui.canBindCompanySelector) return;
        $(ui.elements.company.selector).unbind("change").bind("change", function(event, selection){
            ui.report.state.company = selection.item;
            ui.decorateReportsHome();
            ui.companyChanged(selection.item);
        });

        $(ui.elements.company.selector).oDeskCompanySelector({
            showTeams: false,
            companies: ui.report.state.authUser.getCompanies(oDesk.AuthUser.Flavors["manager"]),
            selection: {
                selectedReference: ui.companyReference
            }
        });

    };

})(jQuery);