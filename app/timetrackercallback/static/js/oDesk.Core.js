oDesk = function(){
    oDeskObject = function(id, name, reference){
        this.reference = reference || null;
        this.name = name || null;
        this.id = id || null;
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

    oDeskObject.prototype.makeParams = function(prefix){
        var params = {};
        params[prefix + "Id"] = this.id;
        params[prefix + "Reference"] = this.reference;
        params[prefix + "Name"] = this.name;
        return params;
    };


    oDeskTime = function(sTimeType, start, end){
        var dt = start ? start.clone() : Date.today();
        this.timeType = sTimeType;
        this.setStartDate(start);
        if (this.timeType == "range"){
            this.setEndDate(end ? end.clone() : Date.today());
        }
    };

    oDeskTime.prototype.setStartDate = function(date){
        var dt = date ? date.clone() : Date.today();
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
        } else if (this.timeType == "range"){
            this.startDate = dt;
            if(!this.endDate || (this.endDate < this.startDate)){
                this.endDate = this.startDate.clone();
            }
        } else {
            this.startDate = dt;
            this.endDate = dt.clone();
        }
    };

    oDeskTime.prototype.setEndDate = function(date){

        if(this.timeType == "range"){
            var dt = date ? date.clone() : Date.today();
            this.endDate = dt;
            if(this.startDate > this.endDate){
                this.startDate = this.endDate;
            }
        }  else {
            this.setStartDate(date);
        }
    };

    oDeskTime.prototype.validateAndFix = function(){
          this.setStartDate(this.startDate);
    };

    oDeskTime.prototype.makeParams = function(prefix){
        var params = {};
        params[prefix + "StartDate"] = this.startDate.asString("yyyy-mm-dd");
        params[prefix + "EndDate"] = this.endDate.asString("yyyy-mm-dd");
        return params;
    };

    oDeskTime.prototype.getDisplayName = function(abbr){
      var monthString = abbr? "MMM" : "MMMM";
      var name = "";
      if(this.timeType == "month"){
          name = this.startDate.toString(monthString + " yyyy");
      } else if(this.timeType == "week" || this.timeType == "range"){
          name = this.startDate.toString("dd " + monthString + " yyyy");
          if (this.endDate > this.startDate){
              name += (" - " + this.endDate.toString("dd " + monthString + " yyyy"));
          }
      } else {
          name = this.startDate.toString("dd " + monthString + " yyyy");
      }
      return name;
    };

    oDeskTime.prototype.getDisplayNameWithAbbreviations = function(){
        return this.getDisplayName(true);
    };

    services = function(){};
    datasource = function(){};
    report = function(sTimeType){};



    return {
            oDeskObject: oDeskObject,
            Team: oDeskObject,
            Company: oDeskObject,
            Provider: oDeskObject,
            DataSource: datasource,
            Report: report,
            Services: services,
            Timeline:oDeskTime
          };
}();