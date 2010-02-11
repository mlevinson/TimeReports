oDesk = function(){         
    oDeskObject = function(){
        this.reference = null;
        this.name = null;        
        this.id = null;
    };   
    
    oDeskObject.prototype.toString = function(){
      return this.getDisplayName();  
    };   
    
    oDeskObject.prototype.getDisplayName = function(){
        if(this.id == 0) return this.name;
        return this.name + " (" + this.id + ")";
    };  
    
    oDeskObject.prototype.setDisplayName = function(displayName){
        this.name = displayName.replace(" (" + this.id + ")", "");
    };
    
    urlTemplates = {
        "company": "http://www.odesk.com/api/hr/v2/companies/{company}.json",
        "team": "http://www.odesk.com/api/hr/v2/companies/{company}/teams.json",
        "provider": "http://www.odesk.com/api/hr/v2/teams/{team}/users.json",
        "hours": "http://www.odesk.com/gds/timereports/v1/companies/",
        "providerHours": "http://www.odesk.com/gds/timereports/v1/providers/{provider}",        
    };
    
    oDeskHoursRecord = function(record){
      this.workDate = Date.parseExact(record.c[0].v, "yyyyMMdd");
      this.provider = new oDeskObject();
      this.provider.id = record.c[1].v;
      this.provider.name = record.c[2].v;      
      this.hours = parseFloat(record.c[3].v);
      this.charges = parseFloat(record.c[4].v);
    };  
    
    
    oDeskHoursRecord.prototype.recordDayOfWeek = function(){
        return oDeskUtil.getDayNumber(this.workDate);
    }                       
    
    
    oDeskProviderHoursRecord = function(record){
        this.workDate = Date.parseExact(record.c[0].v, "yyyyMMdd");
        this.hours = parseFloat(record.c[1].v);
        this.buyerCompany = new oDeskObject();  
        this.buyerCompany.name = record.c[2].v;
        this.buyerCompany.id = record.c[3].v;        
    };

    oDeskProviderHoursRecord.prototype.recordDayOfWeek = function(){
           return oDeskUtil.getDayNumber(this.workDate);
    }
    
    oDeskTime = function(sTimeType, d){
        var dt = d ? d.clone() : Date.today();
        this.timeType = sTimeType;
        if(this.timeType == "month"){
            this.startDate = dt;
            this.startDate.moveToFirstDayOfMonth();
            this.endDate = this.startDate.clone();
            this.endDate.moveToLastDayOfMonth();
        } else if (this.timeType == "week"){ 
            if(oDeskUtil.getDayNumber(dt) > 0){
                 dt.moveToDayOfWeek(1, -1);
             }
             this.startDate = dt;
             this.endDate = dt.clone();
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

    services = function(){
        
    }; 
    
    services.prototype.dummyService = function(){};
    
    report = function(sTimeType){
        this.state = new reportState(sTimeType);
    };                                           

    report.prototype.getCompanyQuery = function(){  
        if(!this.state.company.reference) return null;
        return oDeskUtil.substitute(urlTemplates.company, {"company": this.state.company.reference});
    };                                            
    report.prototype.getTeamsQuery = function(){ 
        if(!this.state.company.reference) return null;        
        return oDeskUtil.substitute(urlTemplates.team, {"company": this.state.company.reference});
    };
    report.prototype.getProvidersQuery = function(){     
        if(!this.state.company.reference) return null;        
        var val = this.state.team.reference ? this.state.team.reference : this.state.company.reference;
        return oDeskUtil.substitute(urlTemplates.provider, {"team": val});
    }; 
    
    report.prototype.getProviderHoursQuery = function(){
        if(!this.state.provider.id 
            || !this.state.timeline.startDate || !this.state.timeline.endDate){
            return null;
        }               
        var tq = "SELECT worked_on, sum(hours), team_name, team_id WHERE worked_on >= '";
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
    }
    
    report.prototype.getHoursQuery = function(){
        if(!this.state.company.id ||
            !this.state.timeline.startDate ||
            !this.state.timeline.endDate ) return null;
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
        return query;                       
    };
    
    return {
            "Team": oDeskObject, 
            "Company": oDeskObject, 
            "Provider": oDeskObject, 
            "Report": report, 
            "Services": services, 
            "Timeline":oDeskTime, 
            "HoursRecord": oDeskHoursRecord,
            "ProviderHoursRecord": oDeskProviderHoursRecord            
          };
}();