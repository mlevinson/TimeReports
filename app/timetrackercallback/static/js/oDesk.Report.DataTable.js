oDesk.Report.prototype.dtFormatHours = function(data){
     val = data.aData[data.iDataColumn]; 
     if(val == 0){
         return "";
     }  
     return floatToTime(val);
}

oDesk.Report.prototype.dtFormatCharges = function(data){  
    val = data.aData[data.iDataColumn];
     if(val == 0){
               return "";
        }
     return currencyFromNumber(val);
}
