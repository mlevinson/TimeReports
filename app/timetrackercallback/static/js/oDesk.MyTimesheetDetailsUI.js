(function($){
    myTimesheetDetails = function(){
        oDesk.ReportPage.prototype.constructor.call(this);
        this.companySelectorFlavor = "engaged";
        this.canBindTeamSelector = false;
        this.canBindDateRangeSelector = true;
        this.elements.company.selector = "#buyer_selector";
        this.parameters.buyerId = null;
        $.extend(this.elements, {
            buyer: {
                name: ".buyer-name"
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
    myTimesheetDetails.prototype = new oDesk.ReportPage();
    myTimesheetDetails.prototype.constructor = myTimesheetDetails;

    oDesk.ReportPage.prototype.companyChanged = function(company){
        var ui = this;
        ui.report.state.buyer = company;
     };

    myTimesheetDetails.prototype.refreshReport = function(){
        var ui = this;
        $(ui.elements.report.placeholder).hide();
        $(ui.elements.report.content).show();
        ui.report.state.showTeamName = (ui.report.state.buyer.team.teams.length > 0);
        ui.setSelectedDateRange(
                Date.fromString($(ui.elements.timerange.startDate).val()),
                Date.fromString($(ui.elements.timerange.endDate).val())
            );
        $(ui.elements.buyer.name).text(ui.report.state.buyer.name);
        $(ui.elements.provider.name).text(ui.report.state.authUser.name);
        $(ui.elements.timerange.tableCaption).text(this.report.state.timeline.getDisplayName());
        $(ui.elements.report.container).oDeskDataTable("generateReport");
    };

    myTimesheetDetails.prototype.setParam = function(param, value){
        if(param == "go" && value == "go"){
            this.forceRefresh = true;
        } else if (param =="test" && value == "test") {
            oDesk.Services.getmyTimesheetDetails = function(report, success, failure){
               $.getJSON("js/myTimesheetDetails.json", function(data){
                   success(new oDesk.DataSource.ResultSet(data));
               });
            };
        } else if (param == "buyerId" && value){
            this.parameters.buyerId = value;
        } else {
            oDesk.ReportPage.prototype.setParam.call(this, param, value);
        }
    };

    myTimesheetDetails.prototype.setSelectedDateRange = function(d1, d2){
        var ui = this;
        this.report.state.timeline = new oDesk.Timeline(
             this.parameters.timeline.type, d1, d2);
    };


    myTimesheetDetails.prototype.canRefreshReport = function(){
        if(!this.initComplete && this.forceRefresh &&
                this.report.state.buyer &&
                this.report.state.buyer.id){
            this.initComplete = true;
            return true;
        }
        return false;
    };

    myTimesheetDetails.prototype.setDefaults = function(){
        Date.format = "dd mmm yyyy";
        var d1 = Date.today();
        var d2 = d1.clone();
        d1.moveToDayOfWeek(1, -1);
        this.setSelectedDateRange(d1, d2);
    };

    myTimesheetDetails.prototype.completeInitialization = function(){
        var ui = this;   
        if(this.parameters.buyerId){
            $(this.elements.company.selector).oDeskCompanySelector("selectWithId", this.parameters.buyerId);
        }
        $(ui.elements.report.container)
                    .oDeskDataTable({
                        report: ui.report,
                        service: oDesk.Services.getMyTimesheetDetails,
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

    myTimesheetDetails.prototype.init = function(){
        var ui = this;
        this.initialize({
            startDate:"startDate",
            endDate:"endDate",
            go:"go",
            test: "test",
            buyerId: "buyer"
        });
    };

    MyTimesheetDetails = new myTimesheetDetails();
})(jQuery);