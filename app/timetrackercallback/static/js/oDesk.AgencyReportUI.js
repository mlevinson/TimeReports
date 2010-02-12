(function($){
    agencyReport = function(){  
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
                "providerList": "#provider_list",
                "providerTemplate": "#provider_list > li:first",
                "table": " .tabular",
                "provider_name": " .provider_name",                
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
        
        this.template = '<li id="#report_{provider_id}">\
            <h2 class="provider_name">{provider_name}</h2>\
            <table class="tabular">\
                <tfoot>\
                    <tr>\
                        <td>Total for {provider_name}:</td>\
                        <td class="numeric total day"><span></span></td>\
                        <td class="numeric total day"><span></span></td>\
                        <td class="numeric total day"><span></span></td>\
                        <td class="numeric total day"><span></span></td>\
                        <td class="numeric total day"><span></span></td>\
                        <td class="numeric total day"><span></span></td>\
                        <td class="numeric total day"><span></span></td>\
                        <td class="numeric grand-total">\
                            <span class="grand_total_hours"></span></td>\
                        <td class="numeric grand-total">\
                            <span class="grand_total_charges"></span></td>\
                    </tr>\
                </tfoot>\
            </table>\
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
              $(this.elements.report.providerList + " li").remove();
              oDesk.Services.getAgencyHours(ui.report, function(data, success){
                     ui.report.state.filter_agency_hours = true;                  
                     var providers = ui.filterProviders(data);
                     $.each(providers, function(i, provider){
                         ui.report.state.provider.id = provider.id;
                         ui.report.state.provider.name = provider.name;
                         ui.createTableForProvider(i, provider);
                     });

              });                                          
        };
    
         function setSelectedDate(d){   
             this.report.state.timeline = new oDesk.Timeline(this.parameters.timeline.type, d);
         };
         
         
         function filterProviders(data){
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
         } 
         
         function createTableForProvider(index, provider){  
             var ui = this;                       
             var html = oDeskUtil.substitute(this.template, {"provider_id":provider.id, "provider_name":provider.name});
             var element = $(this.elements.report.providerList).append(html);  
             var id = "#" + element.attr("id");    
             
             $(id + ui.elements.report.table)
               .oDeskTimeReports({"report": ui.report, "oneshot":true, "service": oDesk.Services.getAgencyHours})
               .unbind("dataTablePopulated").bind("dataTablePopulated", function(e, results){
                     var grandTotalHours = results ? results.grandTotalHours : 0;  
                     var grandTotalCharges = results ? results.grandTotalCharges : 0;                       
                     var dayTotals = results? results.dayTotals : [0,0,0,0,0,0,0];
                     $(id + ui.elements.report.grandTotal.days).each(function(index, element){  
                          var value = dayTotals[index] == 0 ? "" : oDeskUtil.floatToTime(dayTotals[index]);
                          $(element).text(value); 
                     });                      
                     $(id + ui.elements.report.grandTotal.hours).text(
                         oDeskUtil.floatToTime(grandTotalHours));
                     $(id + ui.elements.report.grandTotal.charges).text(
                         currencyFromNumber(grandTotalCharges)); 
               })
               .oDeskTimeReports("generateReport");   
                         
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
              $.getJSON("js/data.json", function(data){
                                ui.report.state.agency_hours_cache = data;
                                ui.report.state.agency_hours_status_cache = "success";
                                ui.refreshReport(); 
                          });                       
            

               $("body").ajaxStart(function(){
                         loading_process("Loading...", false); 
                  });
               $("body").ajaxComplete(function(){ 
                   loading_process();
                    if(!ui.initComplete && ui.report.state.company.id){
                        ui.initComplete = true;     
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
             "createTableForProvider": createTableForProvider,
             "filterProviders": filterProviders
           };
    }();
})(jQuery);