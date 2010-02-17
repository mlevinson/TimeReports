(function($){
    agencyBuyerReport = function(){
        this.report = null;
        this.elements = {
            "company" : {
                "switcher":"#company_switcher",
                "selector":"#company_selector",
                "button":"#switch_company",
                "textbox": "#company_reference"
            },
            "week":{
                "tableCaption": "#time-week",
                "selector": "#timereports_week_selector"
            },
            "report": {
                "buyerList": "#buyer_list",
                "buyerTemplate": "#buyer_list > li:first",
                "table": " .tabular",
                "buyer_name": " .buyer_name",
                "goButton": "#go_run_report",
                "grandTotal": {
                    "days": " .total.day span",
                    "hours": " #grand_total_hours",
                    "charges": " #grand_total_charges"
                }
            }
        };
        this.parameters = {
            "company" :{
                "name": "company_ref",
                "defaultValue": "49041"
            },
            "timeline": {"type":"week"}
        };

        this.template =
'<li id="#report_{buyer_id}">\
    <h2 class="buyer_name">{buyer_name}</h2>\
</li>';

        function setCompanyDefaults(){
              oDesk.Services.getCompany(this.report,
                  oDeskUtil.getParameterByName(
                      this.parameters.company.name,
                      this.parameters.company.defaultValue), null);
              oDesk.Services.getTeams(this.report);
         };

        function refreshReport(){
              var ui = this;
              $(this.elements.week.tableCaption).text(
                  this.report.state.timeline.getDisplayNameWithAbbreviations());
              var ui = this;
              $(this.elements.report.buyerList + " li").remove();
              ui.report.state.buyer = null;
              ui.report.state.filter_agency_hours = false;
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

         function setSelectedDate(d){
             this.report.state.timeline = new oDesk.Timeline(this.parameters.timeline.type, d);
         };


         function filterBuyers(data){
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

         function createSummaryTable(){
              var ui = this;
              var html = oDeskUtil.substitute(this.template, {"buyer_id":"summary", "buyer_name":"Summary"});
              var element = $(html).appendTo(this.elements.report.buyerList);
              var id = "#" + element.attr("id");
              $(element).oDeskDataTable({"report": ui.report, "service": oDesk.Services.getAgencyHours});
          }

         function createTableForBuyer(index, buyerCompany){
             var ui = this;
             var html = oDeskUtil.substitute(this.template, {"buyer_id":buyerCompany.id, "buyer_name":buyerCompany.name});
             var element = $(html).appendTo(this.elements.report.buyerList);
             var id = "#" + element.attr("id");
             $(element).oDeskDataTable({"report": ui.report, "service": oDesk.Services.getAgencyHours});
         }

         function init(){
              var ui = this;
              this.initComplete = false;
              this.report = new oDesk.Report(ui.parameters.timeline.type);


                $(ui.elements.company.switcher).unbind("click").bind("click", function(){
                      $(ui.elements.company.selector).slideToggle();
                 });
                 $(ui.elements.company.button).unbind("click").bind("click", function(){
                     var new_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
                     new_url += "?company_ref=";
                     new_url += $(ui.elements.company.textbox).val();
                     window.location.assign(new_url);
                 });

              $(ui.elements.report.goButton).unbind("click").bind("click", function(){
                 ui.refreshReport();
              });
              this.setCompanyDefaults();
              this.setSelectedDate(Date.today());

              $(ui.elements.week.selector)
                .weekSelector({weekStartDate: ui.report.state.timeline.startDate})
                .unbind("dateSelected").bind("dateSelected", function(e, selectedDate){
                 ui.setSelectedDate(selectedDate);
              });
              ui.report.state.filter_agency_hours = false;
              if(oDeskUtil.getParameterByName("test", null) == "test"){
                  $.getJSON("js/data.json",
                        function(data){
                            ui.report.state.agency_hours_cache = data;
                            ui.report.state.agency_hours_status_cache = "success";
                            ui.refreshReport();
                            });

              }


               $("body").ajaxStart(function(){
                         loading_process("Loading...", false);
                  });
               $("body").ajaxComplete(function(){
                   loading_process();
                    if(!ui.initComplete && ui.report.state.company.id){
                        ui.initComplete = true;
                        ui.refreshReport();
                   }
               });
           };

           return {
             "init":init,
             "elements":elements,
             "template":template,
             "parameters":parameters,
             "refreshReport": refreshReport,
             "setCompanyDefaults":setCompanyDefaults,
             "setSelectedDate": setSelectedDate,
             "createTableForBuyer": createTableForBuyer,
             "createSummaryTable": createSummaryTable,
             "filterBuyers": filterBuyers
           };
    }();
})(jQuery);