oDesk.Report.prototype.dtFormatHours = function(data){
     val = data.aData[data.iDataColumn]; 
     if(val == 0){
         return "";
     }  
     return oDeskUtil.floatToTime(val);
}

oDesk.Report.prototype.dtFormatCharges = function(data){  
    val = data.aData[data.iDataColumn];
     if(val == 0){
               return "";
        }
     return currencyFromNumber(val);
}  

oDesk.Report.prototype.formatHours = function(val, zeroOk){
     if(val == 0 && !zeroOk){
         return "";
     }  
     return oDeskUtil.floatToTime(val);
}

oDesk.Report.prototype.formatCharges = function(val, zeroOk){  
     if(val == 0  && !zeroOk){
         return "";
     }
     return currencyFromNumber(val);
}
