oDesk.HoursRecord = function(record){
   this.workDate = Date.parseExact(record.c[0].v, "yyyyMMdd");
   this.provider = new oDeskObject();
   this.provider.id = record.c[1].v;
   this.provider.name = record.c[2].v;
   this.hours = parseFloat(record.c[3].v);
   this.charges = parseFloat(record.c[4].v);
 };

 oDesk.HoursRecord.prototype.recordDayOfWeek = function(){
     return oDeskUtil.getDayNumber(this.workDate);
 }

oDesk.TaskHoursRecord = function(record){
    this.provider = new oDeskObject();
    this.provider.id = record.c[0].v;
    this.provider.name = record.c[1].v;
    this.hours = parseFloat(record.c[2].v);
    this.charges = parseFloat(record.c[3].v);
    this.taskCode = record.c[4].v;
    this.taskDescription = this.taskCode;
    this.taskUrl = null;
};

 oDesk.TaskHoursRecord.prototype.toString = function(){
     return this.taskDescription + " " + this.provider.name;
 }

 oDesk.ProviderHoursRecord = function(record){
     this.workDate = Date.parseExact(record.c[0].v, "yyyyMMdd");
     this.hours = parseFloat(record.c[1].v);
     this.charges = parseFloat(record.c[2].v);
     this.buyerCompany = new oDeskObject();
     this.buyerCompany.name = record.c[3].v;
     this.buyerCompany.id = record.c[4].v;
     if(record.c.length > 5){
         this.provider = new oDeskObject();
         this.provider.name = record.c[5].v;
         this.provider.id = record.c[6].v;
     }
 };

 oDesk.ProviderHoursRecord.prototype.recordDayOfWeek = function(){
     return oDeskUtil.getDayNumber(this.workDate);
 }