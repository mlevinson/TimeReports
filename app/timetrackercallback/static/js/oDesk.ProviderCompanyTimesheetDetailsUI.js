(function($){
    providerCompanyTimesheetDetails = function(){
        oDesk.ReportPage.prototype.constructor.call(this);
        this.companySelectorFlavor = "affiliate";
        this.canBindTeamSelector = false;
        this.canBindDateRangeSelector = true;
        this.parameters.buyerId = null;
        $.extend(this.elements, {
            buyer: {
                name: ".buyer-name",
                selector: "#timereports_buyer_selector SELECT"
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
    providerCompanyTimesheetDetails.prototype = new oDesk.ReportPage();
    providerCompanyTimesheetDetails.prototype.constructor = providerCompanyTimesheetDetails;

    providerCompanyTimesheetDetails.prototype.refreshReport = function(){
        var ui = this;
        $(ui.elements.report.placeholder).hide();
        $(ui.elements.report.content).show();
        ui.setSelectedDateRange(
                Date.fromString($(ui.elements.timerange.startDate).val()),
                Date.fromString($(ui.elements.timerange.endDate).val())
            );
        $(ui.elements.buyer.name).text(ui.report.state.buyer.name);
        $(ui.elements.provider.name).text(ui.report.state.provider.name);
        $(ui.elements.timerange.tableCaption).text(this.report.state.timeline.getDisplayName());
        $(ui.elements.report.container).oDeskDataTable("generateReport");
    };

    providerCompanyTimesheetDetails.prototype.setParam = function(param, value){
        var ui = this;
        if(param == "go" && value == "go"){
            this.forceRefresh = true;
        } else if (param =="test" && value == "test") {
            ui.report.state.company.reference = "49041";
            ui.report.state.company.id = "teammichael:teammichael";
            ui.report.state.company.name = "Michael";
            oDesk.Services.getAgencyTimesheetDetails = function(report, success, failure){
               $.getJSON("js/providerCompanyTimesheetDetails.json", function(data){
                   success(new oDesk.DataSource.ResultSet(data));
               });
            };
        } else if (param == "buyerReference" && value){
            oDesk.Services.findCompany(value, function(buyerCompany){
               ui.report.state.buyer = buyerCompany;
               $(ui.elements.buyer.name).text(ui.report.state.buyer.name);
            });
        } else {
            oDesk.ReportPage.prototype.setParam.call(this, param, value);
        }

        if(param == "providerId"){
            oDesk.Services.findProvider(ui.report);
        }
    };

    providerCompanyTimesheetDetails.prototype.setSelectedDateRange = function(d1, d2){
        var ui = this;
        this.report.state.timeline = new oDesk.Timeline(
             this.parameters.timeline.type, d1, d2);
    };


    providerCompanyTimesheetDetails.prototype.canRefreshReport = function(){
        if(!this.initComplete && this.forceRefresh &&
                this.report.state.buyer &&
                this.report.state.buyer.id){
            this.initComplete = true;
            return true;
        }
        return false;
    };


    providerCompanyTimesheetDetails.prototype.bindBuyerSelector = function(){
         var ui = this;
         if(ui.buyerSelectorBound) return;
         var defaults = {
             report: ui.report,
             all_option_id: "all_buyers",
             all_option_text: "All Buyers",
             includeAllOption:false,
             stateVariable: ui.report.state.buyer,
             service: oDesk.Services.getBuyersForProvider,
             useDisplayName: false
         };
         $(ui.elements.buyer.selector).oDeskSelectWidget(defaults)
         .unbind("selectionChanged").bind("selectionChanged", function(){
             ui.buyerChanged(ui.report.state.buyer);
         });
         ui.buyerSelectorBound = true;
    };

    providerCompanyTimesheetDetails.prototype.setDefaults = function(){
        Date.format = "dd mmm yyyy";
        var d1 = Date.today();
        var d2 = d1.clone();
        d1.moveToDayOfWeek(1, -1);
        this.setSelectedDateRange(d1, d2);
        this.report.state.buyer = new oDesk.oDeskObject();
    };

    providerCompanyTimesheetDetails.prototype.buyerChanged = function(buyer){
        this.report.state.hasWorkDiaryAccess = this.report.state.authUser.teamHasFlavor(buyer.reference, {roles:["hiring"]});
    };

    providerCompanyTimesheetDetails.prototype.providerChanged = function(company){
       this.bindBuyerSelector();
       $(this.elements.buyer.selector).oDeskSelectWidget("populate");
    };

    providerCompanyTimesheetDetails.prototype.companyChanged = function(company){
        oDesk.ReportPage.prototype.companyChanged.call(this, company);
        this.bindProviderSelector();
        $(this.elements.provider.selector).oDeskSelectWidget("populate");
    };

    providerCompanyTimesheetDetails.prototype.completeInitialization = function(){
        var ui = this;
        $(ui.elements.report.container)
                    .oDeskDataTable({
                        report: ui.report,
                        service: oDesk.Services.getAgencyTimesheetDetails,
                        groupRows:true})
                    .unbind("dataTablePopulated").bind("dataTablePopulated", function(){
                            ui.bindTableHeaderHelp();
                            $(ui.elements.report.memo).compactness();
                            if($(ui.elements.report.displayType.compact).hasClass("selected")){
                                $(ui.elements.report.memo).compactness("compact");
                            }
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

    providerCompanyTimesheetDetails.prototype.init = function(){
        var ui = this;
        this.canBindProviderSelector = true;
        this.initialize({
            startDate:"startDate",
            endDate:"endDate",
            go:"go",
            test: "test",
            buyerReference: "buyer_ref",
            providerId: "provider"
        });
    };

    ProviderCompanyTimesheetDetails = new providerCompanyTimesheetDetails();
})(jQuery);