(function($){
    oDesk.Services.getCompany = function(report, companyReference, callBack){
        report.state.company.reference = companyReference;
        $.getJSON(report.getCompanyQuery(), function(data){
             report.state.company.name = data.company.name;
             if($.isFunction(callBack)){
                 callBack(report.state.company);             
             }   
        }); 
    }


    oDesk.Services.getTeams = function(report, callBack){
        $.getJSON(report.getTeamsQuery(), function(data){  
            teams = [];
            $.each(data, function(i, team){
               var teamObject = oDesk.Team();
               teamObject.id = team.id;
               teamObject.reference = team.reference;
               teamObject.name = team.name;
               teams.push(teamObject);
               if (team.reference == report.state.company.reference){
                   report.state.company.id = team.id;
               }
            }); 
            if($.isFunction(callBack)){
                callBack(teams);
            }    
        }); 
    }
 
    oDesk.Services.getProviders = function(report, callBack){
        $.getJSON(report.getProvidersQuery(), function(data){  
            providers = [];
            $.each(data, function(i, team){
               var providerObject = oDesk.Provider();
               providerObject.id = provider.id;
               providerObject.reference = provider.reference;
               providerObject.name = provider.name;
               providers.push(providerObject);
            });
             if($.isFunction(callBack)){        
                 callBack(providers);
             }
        }); 
    }
})(jQuery);