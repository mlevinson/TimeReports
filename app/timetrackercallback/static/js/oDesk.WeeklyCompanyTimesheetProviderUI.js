(function($){
    weeklyCompanyTimesheetProvider = function(){
        oDesk.ReportPage.prototype.constructor.call(this);
        this.canBindTeamSelector = false;
        $.extend(this.elements, {
            week:{
                tableCaption: "#time-week",
                selector: "#timereports_week_selector"
            }
        });

        $.extend(this.elements.report, {
            providerList: "#provider_list",
            providerTemplate: "#provider_list > li:first",
            table: " .tabular",
            provider_name: " .provider_name"
        });

        this.template =
'<li id="#report_{provider_id}">\
    <h2 class="provider_name">{provider_name}</h2>\
</li>';
    };

    weeklyCompanyTimesheetProvider.prototype = new oDesk.ReportPage();
    weeklyCompanyTimesheetProvider.prototype.constructor = weeklyCompanyTimesheetProvider;


    weeklyCompanyTimesheetProvider.prototype.refreshReport = function(){
        var ui = this;
        $(this.elements.week.tableCaption).text(
            this.report.state.timeline.getDisplayNameWithAbbreviations());
        var ui = this;
        $(this.elements.report.providerList + " li").remove();
        ui.report.state.provider.id = ui.report.state.provider.name = null;
        ui.report.state.filter_agency_hours = false;
        if(oDeskUtil.getParameterByName("test", null) != "test"){
            ui.report.state.agency_hours_cache = null;
            ui.report.state.agency_hours_status_cache = null;
        }
        oDesk.Services.getAgencyHours(ui.report, function(data, success){
               ui.createSummaryTable();
               ui.report.state.filter_agency_hours = true;
               var providers = ui.filterProviders(data);
                $.each(providers, function(i, provider){
                    ui.report.state.provider.id = provider.id;
                    ui.report.state.provider.name = provider.name;
                    ui.createTableForProvider(i, provider);
                });
        });
    };

    weeklyCompanyTimesheetProvider.prototype.setSelectedDate = function(d){
        this.report.state.timeline = new oDesk.Timeline(this.parameters.timeline.type, d);
    };

    weeklyCompanyTimesheetProvider.prototype.canRefreshReport = function(){

        if(!this.initComplete && this.report.state.company.id &&
                    (oDeskUtil.getParameterByName("test", null) != "test")){
            this.initComplete = true;
            return true;
        }
        return false;
    };



    weeklyCompanyTimesheetProvider.prototype.filterProviders = function(data){
        if(!data ||  !data.table || !data.table.rows) return [];
        var providers = [], providerIds = [];
        $.each(data.table.rows, function(i, row){

            if (row == "") return false;
             if($.inArray(row.c[6].v, providerIds) == -1){
                 var provider = new oDesk.Provider();
                 provider.name = row.c[5].v;
                 provider.id = row.c[6].v;
                 providerIds.push(provider.id);
                 providers.push(provider);
            }
        });

        providers.sort();
        return providers;
    };

    weeklyCompanyTimesheetProvider.prototype.createSummaryTable = function(){
         var ui = this;
         var html = oDeskUtil.substitute(this.template, {"provider_id":"summary", "provider_name":"Summary"});
         var element = $(html).appendTo(this.elements.report.providerList);
         var id = "#" + element.attr("id");
         $(element).oDeskDataTable({"report": ui.report, "service": oDesk.Services.getAgencyHours});
     };

    weeklyCompanyTimesheetProvider.prototype.createTableForProvider = function(index, provider){
        var ui = this;
        var html = oDeskUtil.substitute(this.template, {"provider_id":provider.id, "provider_name":provider.name});
        var element = $(html).appendTo(this.elements.report.providerList);
        var id = "#" + element.attr("id");
        $(element).oDeskDataTable({"report": ui.report, "service": oDesk.Services.getAgencyHours});
    };


    weeklyCompanyTimesheetProvider.prototype.init = function(){
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