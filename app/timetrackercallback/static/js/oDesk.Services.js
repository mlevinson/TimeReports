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
            var companyTeamObject = null;
            $.each(data.teams, function(i, team){
               var teamObject = new oDesk.Team();
               teamObject.id = team.id;
               teamObject.reference = team.reference;
               teamObject.name = team.name;
               if (team.reference == report.state.company.reference){
                   report.state.company.id = team.id;
                   companyTeamObject = teamObject;
               } else {
                   teams.push(teamObject);                   
               }   
            });    
            teams.sort();                    
            if(companyTeamObject){
                teams.unshift(companyTeamObject);                
            }   
            if($.isFunction(callBack)){
                callBack(teams);
            }    
        }); 
    }
 
    oDesk.Services.getProviders = function(report, callBack){
        $.getJSON(report.getProvidersQuery(), function(data){  
            providers = [];
            $.each(data.users, function(i, provider){
               var providerObject = new oDesk.Provider();
               providerObject.id = provider.id;
               providerObject.reference = provider.reference;
               providerObject.name = provider.first_name + " " + provider.last_name;
               providers.push(providerObject);
            });   
            providers.sort();
            if($.isFunction(callBack)){        
                callBack(providers);
            }
        }); 
    }
})(jQuery);