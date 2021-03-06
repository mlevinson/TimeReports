(function($){
    oDesk.urls = {
         getAuthUser: "https://www.odesk.com/api/auth/v1/login.json",
         getCompany: "http://www.odesk.com/api/hr/v2/companies/{companyReference}.json",
         getTeams: "http://www.odesk.com/api/hr/v2/companies/{companyReference}/teams.json",
         getProviders: "http://www.odesk.com/api/hr/v2/teams/{teamReference}/users.json",
         getHours: "http://www.odesk.com/gds/timereports/v1/companies/{companyId}",
         getHoursTeamFragment: "/teams/{teamId}",
         getProviderHours: "http://www.odesk.com/gds/timereports/v1/providers/{authUserId}",
         getAgencyHours:
           "http://www.odesk.com/gds/timereports/v1/companies/{companyId}/agencies/{companyId}",
         getTasks:"https://www.odesk.com/api/otask/v1/tasks/companies/{companyId}/teams/{teamId}/tasks/{tasks}.json"
    };

    oDesk.Report = function(sTimeType){
          reportState = function(sTimeType){
              this.authUser = new oDeskObject();
              this.company = new oDeskObject();
              this.team = new oDeskObject();
              this.provider = new oDeskObject();
              this.timeline = new oDeskTime(sTimeType);
          };

          reportState.prototype.makeParams = function(){
                 var params = {};
                 $.each(this, function(key, value){
                     if(!value) return;
                     if (typeof(value.makeParams) == "function"){
                         var subparams = value.makeParams(key);
                         $.each(subparams, function(k, v){
                             if(v && v != "0" && v != ""){
                                 params[k] = v;
                             }
                         });
                     } else {
                         if(value && value != "0" && value != ""){
                             params[key] = value;
                         }
                     }
                 });
                 return params;
             };

          this.state = new reportState(sTimeType);
    };

    oDesk.Report.prototype.getAuthUserQuery = function(){
        return oDesk.urls.getAuthUser;
    }

    oDesk.Report.prototype.getCompanyQuery = function(){
        if(!this.state.company.reference) return null;
        var query = new oDesk.DataSource.Query(this.state.makeParams());
        query.setUrlTemplate(oDesk.urls.getCompany);
        return query.toString();
    };

    oDesk.Report.prototype.getTeamsQuery = function(){
        if(!this.state.company.reference) return null;
        var query = new oDesk.DataSource.Query(this.state.makeParams());
        query.setUrlTemplate(oDesk.urls.getTeams);
        return query.toString();
    };

    oDesk.Report.prototype.getProvidersQuery = function(){
        if(!this.state.company.reference) return null;
        var params = this.state.makeParams();
        params.teamReference = params.teamReference || params.companyReference;
        var query = new oDesk.DataSource.Query(params);
        query.setUrlTemplate(oDesk.urls.getProviders);
        return query.toString();
    };


    oDesk.Report.prototype.getTasksQuery = function(tasks){
        if(!this.state.company.id) return null;
        var params = this.state.makeParams();
        if(!this.state.team.id){
            params.teamId = this.state.company.id;
        }
        params.tasks = tasks.join(";");
        var query = new oDesk.DataSource.Query(params);
        query.setUrlTemplate(oDesk.urls.getTasks);
        return query.toString();

    };


    oDesk.Report.prototype.getHoursQuery = function(){
        if(!this.state.company.id ||
            !this.state.timeline.startDate ||
            !this.state.timeline.endDate ) return null;

        var query = new oDesk.DataSource.Query(this.state.makeParams());
        query.setUrlTemplate(oDesk.urls.getHours);
        query.addUrlFragment(oDesk.urls.getHoursTeamFragment);
        query.addSelectStatement(["worked_on", "provider_id", "provider_name", "sum(hours)", "sum(charges)"]);
        query.addCondition(">=", "worked_on", "{timelineStartDate}");
        query.addCondition("<=", "worked_on", "{timelineEndDate}");
        query.addCondition("=", "provider_id", "{providerId}");
        query.addSortStatement(["provider_id", "worked_on"]);
        return query.toString();
    };



    oDesk.Report.prototype.getProviderHoursQuery = function(){
        if(!this.state.authUser.id
            || !this.state.timeline.startDate || !this.state.timeline.endDate){
            return null;
        }

        var query = new oDesk.DataSource.Query(this.state.makeParams());
        query.setUrlTemplate(oDesk.urls.getProviderHours);
        query.addSelectStatement(["worked_on", "sum(hours)", "sum(earnings)", "team_name", "team_id", "agency_name", "agency_id"]);
        query.addCondition(">=", "worked_on", "{timelineStartDate}");
        query.addCondition("<=", "worked_on", "{timelineEndDate}");
        query.addSortStatement(["team_name", "worked_on"]);
        return query.toString();
    };


    oDesk.Report.prototype.getTaskHoursQuery = function(){
        if(!this.state.company.id ||
            !this.state.timeline.startDate ||
            !this.state.timeline.endDate ) return null;

        var query = new oDesk.DataSource.Query(this.state.makeParams());
        query.setUrlTemplate(oDesk.urls.getHours);
        query.addUrlFragment(oDesk.urls.getHoursTeamFragment);
        query.addSelectStatement(["task", "provider_name", "provider_id", "sum(hours)", "sum(charges)", "task"]);
        query.addCondition(">=", "worked_on", "{timelineStartDate}");
        query.addCondition("<=", "worked_on", "{timelineEndDate}");
        query.addCondition("=", "provider_id", "{providerId}");
        query.addSortStatement(["task", "provider_name"]);
        return query.toString();
    };

    oDesk.Report.prototype.getAgencyQuery = function(){
        if(!this.state.company.id
                || !this.state.timeline.startDate
                || !this.state.timeline.endDate)   return null;


        var query = new oDesk.DataSource.Query(this.state.makeParams());
        query.setUrlTemplate(oDesk.urls.getAgencyHours);
        query.addSelectStatement(["worked_on",
                                  "sum(hours)", "sum(earnings)",
                                  "team_name", "team_id",
                                  "provider_name", "provider_id", "agency_name", "agency_id"]);

        query.addCondition(">=", "worked_on", "{timelineStartDate}");
        query.addCondition("<=", "worked_on", "{timelineEndDate}");
        query.addSortStatement(["provider_id", "team_name", "worked_on"]);
        return query.toString();
    };
})(jQuery);