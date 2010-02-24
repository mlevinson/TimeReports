(function($){
    weeklyCompanyTimesheetBuyer = function(){
        oDesk.ReportPage.prototype.constructor.call(this);
        this.canBindTeamSelector = false;
        $.extend(this.elements, {
            week:{
                tableCaption: "#time-week",
                selector: "#timereports_week_selector"
            }
        });

        $.extend(this.elements.report, {
            buyerList: "#buyer_list",
            buyerTemplate: "#buyer_list > li:first",
            table: " .tabular",
            buyer_name: " .buyer_name"
        });

        this.template =
'<li id="#report_{buyer_id}">\
   <h2 class="buyer_name">{buyer_name}</h2>\
</li>';
    };

    weeklyCompanyTimesheetBuyer.prototype = new oDesk.ReportPage();
    weeklyCompanyTimesheetBuyer.prototype.constructor = weeklyCompanyTimesheetBuyer;


    weeklyCompanyTimesheetBuyer.prototype.refreshReport = function(){
        var ui = this;
        $(this.elements.week.tableCaption).text(
            this.report.state.timeline.getDisplayNameWithAbbreviations());
        var ui = this;
        $(this.elements.report.buyerList + " li").remove();
        ui.report.state.buyer = null;
        ui.report.state.filter_agency_hours = false;
        if(oDeskUtil.getParameterByName("test", null) != "test"){
            ui.report.state.agency_hours_cache = null;
            ui.report.state.agency_hours_status_cache = null;
        }
        oDesk.Services.getAgencyHours(ui.report, function(data, success){
               ui.createSummaryTable();
               ui.report.state.filter_agency_hours = true;
               var buyers = ui.filterBuyers(data);
               $.each(buyers, function(i, buyer){
                   ui.report.state.buyer = buyer;
                   ui.createTableForBuyer(i, buyer);
               });

        });
    };

    weeklyCompanyTimesheetBuyer.prototype.setSelectedDate = function(d){
        this.report.state.timeline = new oDesk.Timeline(this.parameters.timeline.type, d);
    };

    weeklyCompanyTimesheetBuyer.prototype.canRefreshReport = function(){

        if(!this.initComplete && this.report.state.company.id &&
                    (oDeskUtil.getParameterByName("test", null) != "test")){
            this.initComplete = true;
            return true;
        }
        return false;
    };



    weeklyCompanyTimesheetBuyer.prototype.filterBuyers = function(data){
        if(!data ||  !data.table || !data.table.rows) return [];
        var buyers = [], buyerIds = [];
        $.each(data.table.rows, function(i, row){

            if (row == "") return false;
             if($.inArray(row.c[4].v, buyerIds) == -1){
                 var buyer = new oDesk.Company();
                 buyer.name = row.c[3].v;
                 buyer.id = row.c[4].v;
                 buyerIds.push(buyer.id);
                 buyers.push(buyer);
            }
        });

        buyers.sort();
        return buyers;
    }

    weeklyCompanyTimesheetBuyer.prototype.createSummaryTable = function(){
         var ui = this;
         var html = oDeskUtil.substitute(this.template, {"buyer_id":"summary", "buyer_name":"Summary"});
         var element = $(html).appendTo(this.elements.report.buyerList);
         var id = "#" + element.attr("id");
         $(element).oDeskDataTable({"report": ui.report, "service": oDesk.Services.getAgencyHours});
     }

    weeklyCompanyTimesheetBuyer.prototype.createTableForBuyer = function(index, buyerCompany){
        var ui = this;
        var html = oDeskUtil.substitute(this.template, {"buyer_id":buyerCompany.id, "buyer_name":buyerCompany.name});
        var element = $(html).appendTo(this.elements.report.buyerList);
        var id = "#" + element.attr("id");
        $(element).oDeskDataTable({"report": ui.report, "service": oDesk.Services.getAgencyHours});
    }


    weeklyCompanyTimesheetBuyer.prototype.init = function(){
        var ui = this;
        ui.initComplete = false;
        this.initialize(function(){
            $(ui.elements.week.selector)
                .weekSelector({weekStartDate: ui.report.state.timeline.startDate})
                .unbind("dateSelected").bind("dateSelected", function(e, selectedDate){
                    ui.setSelectedDate(selectedDate);
            });
            ui.setSelectedDate(Date.today());
            ui.report.state.filter_agency_hours = false;
            if(oDeskUtil.getParameterByName("test", null) == "test"){
                $.getJSON("js/data.json",
                    function(data){
                        ui.initComplete = true;
                        ui.report.state.agency_hours_cache = data;
                        ui.report.state.agency_hours_status_cache = "success";
                        ui.refreshReport();
                });

            }
        });
    };
})(jQuery);