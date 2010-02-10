(function($){
    oDesk.Services.getCompany = function(report, companyReference, success, failure){
        report.state.company.reference = companyReference;
        
        $.ajax({
             url: report.getCompanyQuery(), 
             dataType: 'jsonp',
             error: function(request, status, error){
                 if($.isFunction(failure)){
                     failure(status, error);                     
                 }   
             },
             success: function(data, status, request){
                 if($.isFunction(success)){
                     success(report.state.company);                     
                 }   
             }
         });
    }


    oDesk.Services.getTeams = function(report, success, failure){
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
        
         $.ajax({
             url: report.getTeamsQuery(), 
             dataType: 'jsonp',
             error: function(request, status, error){
                 if($.isFunction(failure)){
                     failure(status, error);                     
                 }   
             },
             success: function(data, status, request){
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
                 if($.isFunction(success)){
                     success(teams);                     
                 }   
             }
         });
    }  
    
    oDesk.Services.getHours = function(report, success, failure){
        $.ajax({
             url: report.getHoursQuery(), 
             dataType: 'jsonp',
             error: function(request, status, error){
                 if($.isFunction(failure)){
                     failure(status, error);
                 }
                 
             },
             success: function(data, status, request){
                 if($.isFunction(success)){                 
                     success(data, status);
                 }    
             }
         });
    }
 
    oDesk.Services.getProviders = function(report, success, failure){
        
         $.ajax({
             url: report.getProvidersQuery(), 
             dataType: 'jsonp',
             error: function(request, status, error){
                 if($.isFunction(failure)){
                     failure(status, error);                     
                 }   
             },
             success: function(data, status, request){
                 providers = [];
                 $.each(data.users, function(i, provider){
                    var providerObject = new oDesk.Provider();
                    providerObject.id = provider.id;
                    providerObject.reference = provider.reference;
                    providerObject.name = provider.first_name + " " + provider.last_name;
                    providers.push(providerObject);
                 });   
                 providers.sort();
                 if($.isFunction(success)){
                     success(providers);                     
                 }   
             }
         });
    }
})(jQuery);