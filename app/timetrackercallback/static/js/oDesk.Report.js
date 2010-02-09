oDesk = function(){         
    oDeskObject = function(){
        this.reference = null;
        this.name = null;        
        this.id = null;
    };
    
    oDeskObject.prototype.getDisplayName = function(){
        return this.name + " (" + this.id + ")";
    };  
    
    urlTemplates = {
        "company": "http://www.odesk.com/api/hr/v2/companies/{company}.json?callback=?",
        "team": "http://www.odesk.com/api/hr/v2/companies/{company}/teams.json?callback=?",
        "provider": "http://www.odesk.com/api/hr/v2/teams/{team}/users.json?callback=?",
        "hours": "http://www.odesk.com/gds/timereports/v1/companies/"
    };
    
    oDeskTime = function(sTimeType){
        this.timeType = sTimeType;
        if(this.timeType == "month"){
            this.startDate = Date.today();
            this.startDate.moveToFirstDayOfMonth();
            this.endDate = this.startDate.clone();
            this.endDate.moveToLastDayOfMonth();
        } else if (this.timeType == "week"){ 
            var d = Date.today();   
            if(getDayNumber(d) > 0){
                 d.moveToDayOfWeek(1, -1);
             }
             this.startDate = d;
             this.endDate = d.clone();
             this.endDate.addDays(6);
        } else {
            this.startDate = this.endDate = Date.today();
        }
    }; 
    
    oDeskTime.prototype.getDisplayName = function(abbr){
        var monthString = abbr? "MMM" : "MMMM";
        
      if(this.timeType == "month"){
          return this.startDate.toString(monthString + " yyyy");
      } else if(this.timeType == "week"){
          return this.startDate.toString("dd " + monthString + " yyyy") + " - " + 
                    this.endDate.toString("dd " + monthString + " yyyy");
      } else {
          return this.startDate.toString("dd " + monthString + " yyyy");
      }  
    };
    
    oDeskTime.prototype.getDisplayNameWithAbbreviations = function(){
        return this.getDisplayName(true);
    };

    reportState = function(sTimeType){
        this.company = new oDeskObject();
        this.team = new oDeskObject();
        this.provider = new oDeskObject();
        this.timeline = new oDeskTime(sTimeType);        
    };
    
    report = function(sTimeType){
        this.state = new reportState(sTimeType);
    };                                           
    
    report.prototype.getCompanyQuery = function(){  
        if(!this.state.company.reference) return null;
        return substitute(urlTemplates.company, {"company": this.state.company.reference});
    };                                            
    report.prototype.getTeamQuery = function(){ 
        if(!this.state.company.reference) return null;        
        return substitute(urlTemplates.team, {"company": this.state.company.reference});
    };
    report.prototype.getProviderQuery = function(){     
        if(!this.state.company.reference) return null;        
        var val = this.state.team.reference ? this.state.team.reference : this.state.company.reference;
        return substitute(urlTemplates.provider, {"team": val});
    }; 
    
    report.prototype.getHoursQuery = function(){
            if(!this.state.company.reference) return null;
             var tq = "SELECT worked_on, provider_id, provider_name, sum(hours), sum(charges) WHERE worked_on >= '";
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
             query += "&callback=?" 
             return query;
    };
    
    return {"Report": report};
}();
