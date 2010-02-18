oDesk.Report = function(sTimeType){
      reportState = function(sTimeType){
          this.company = new oDeskObject();
          this.team = new oDeskObject();
          this.provider = new oDeskObject();
          this.timeline = new oDeskTime(sTimeType);
      };

      reportState.prototype.makeParams = function(){
          var params = {};
          $.each(this, function(key, value){
              if (typeof(value.makeParams) == "function"){
                  var subparams = value.makeParams(key);
                  $.each(subparams, function(k, v){
                      params[k] = v;
                  });
              } else {
                  params[key] = value;
              }
          });
          return params;
      };

      urlTemplates = {
          "company": "http://www.odesk.com/api/hr/v2/companies/{company}.json",
          "team": "http://www.odesk.com/api/hr/v2/companies/{company}/teams.json",
          "provider": "http://www.odesk.com/api/hr/v2/teams/{team}/users.json",
          "hours": "http://www.odesk.com/gds/timereports/v1/companies/",
          "providerHours": "http://www.odesk.com/gds/timereports/v1/providers/{provider}",
          "agencyHours":
           "http://www.odesk.com/gds/timereports/v1/companies/{agency}/agencies/{agency}",
          "tasks":"https://www.odesk.com/api/otask/v1/tasks/companies/{company}/tasks/{tasks}.json",
          "all_tasks":"https://www.odesk.com/api/otask/v1/tasks/companies/{company}/tasks/full_list.json"
      };


      this.state = new reportState(sTimeType);
};



oDesk.Report.prototype.getTasksQuery = function(tasks){
    // TODO: The specific tasks query does not work
    // Using the full list for now.
    // Also, currently not using the team. Must.
    //
    if(!this.state.company.id) return null;
    return oDeskUtil.substitute(
        urlTemplates.all_tasks,
        // urlTemplates.tasks,
        {
            company:this.state.company.id,
            tasks: escape(tasks.join(";"))
        }
     );

};

oDesk.Report.prototype.getCompanyQuery = function(){
    if(!this.state.company.reference) return null;
    return oDeskUtil.substitute(urlTemplates.company,
        {"company": this.state.company.reference});
};

oDesk.Report.prototype.getTeamsQuery = function(){
    if(!this.state.company.reference) return null;
    return oDeskUtil.substitute(urlTemplates.team,
        {"company": this.state.company.reference});
};

oDesk.Report.prototype.getProvidersQuery = function(){
    if(!this.state.company.reference) return null;
    var val = this.state.team.reference ?
                    this.state.team.reference :
                    this.state.company.reference;
    return oDeskUtil.substitute(urlTemplates.provider, {"team": val});
};

oDesk.Report.prototype.getProviderHoursQuery = function(){
    if(!this.state.provider.id
        || !this.state.timeline.startDate || !this.state.timeline.endDate){
        return null;
    }
    var tq = "SELECT worked_on, sum(hours), sum(earnings), team_name, team_id WHERE worked_on >= '";
    tq += this.state.timeline.startDate.toString("yyyy-MM-dd");
    tq += "' AND worked_on <= '";
    tq += this.state.timeline.endDate.toString("yyyy-MM-dd");
    tq += "'";
    tq += " ORDER BY team_name, worked_on";
    var query = urlTemplates.providerHours;
    query = oDeskUtil.substitute(query, {"provider":this.state.provider.id});
    query += "?tq=";
    query += escape(tq);
    return query;
};


oDesk.Report.prototype.getTaskHoursQuery = function(){
    if(!this.state.company.id ||
        !this.state.timeline.startDate ||
        !this.state.timeline.endDate ) return null;
    var tq = "SELECT provider_id, provider_name, sum(hours), sum(charges), task WHERE worked_on >= '";
    tq += this.state.timeline.startDate.toString("yyyy-MM-dd");
    tq += "' AND worked_on <= '";
    tq += this.state.timeline.endDate.toString("yyyy-MM-dd");
    tq += "'";
    if(this.state.provider.id){
       tq += " AND provider_id='";
       tq += this.state.provider.id;
       tq += "'";
    }
    tq += " ORDER BY task, provider_name";

    var query = urlTemplates.hours;
    query += this.state.company.id;
    if(this.state.team.id){
        query += "/teams/";
        query += this.state.team.id;
    }
    query += "?tq=";
    query += escape(tq);
    return query;
};

oDesk.Report.prototype.getHoursQuery = function(){
    if(!this.state.company.id ||
        !this.state.timeline.startDate ||
        !this.state.timeline.endDate ) return null;
    var tq = "SELECT worked_on, provider_id, provider_name,\
              sum(hours), sum(charges), task WHERE worked_on >= '";
    tq += this.state.timeline.startDate.toString("yyyy-MM-dd");
    tq += "' AND worked_on <= '";
    tq += this.state.timeline.endDate.toString("yyyy-MM-dd");
    tq += "'";
    if(this.state.provider.id){
       tq += " AND provider_id='";
       tq += this.state.provider.id;
       tq += "'";
    }
    tq += " ORDER BY provider_id, worked_on";

    var query = urlTemplates.hours;
    query += this.state.company.id;
    if(this.state.team.id){
        query += "/teams/";
        query += this.state.team.id;
    }
    query += "?tq=";
    query += escape(tq);
    return query;
};

oDesk.Report.prototype.getAgencyQuery = function(){
    if(!this.state.company.id
            || !this.state.timeline.startDate
            || !this.state.timeline.endDate){

           return null;
       }
       var tq = "SELECT worked_on, sum(hours), sum(earnings), team_name, team_id,";
       tq += " provider_name, provider_id";

       tq += " WHERE worked_on >= '";
       tq += this.state.timeline.startDate.toString("yyyy-MM-dd");
       tq += "' AND worked_on <= '";
       tq += this.state.timeline.endDate.toString("yyyy-MM-dd");
       tq += "'";
       tq += " ORDER BY provider_name, team_name, worked_on";
       var query = urlTemplates.agencyHours;
       query = oDeskUtil.substitute(query, {"agency":this.state.company.id});
       query += "?tq=";
       query += escape(tq);
       return query;
};
