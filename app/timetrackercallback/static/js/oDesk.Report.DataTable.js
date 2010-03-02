oDesk.Report.renderField = function(data){
    var val = data.aData[data.iDataColumn].value;
    if (val == null) return "";
    return val;
};

oDesk.Report.renderUrl = function(value, url, params, classname){
    var paramString = "";
    $.each(params, function(key, value){
       paramString +=  paramString.length ? "&" : "?";
       paramString += key;
       paramString += "=";
       paramString += escape(value);
    });
    var link  = '<a';
    if(classname){
        link += ' class="' + classname + '"';
    }
    link += ' href="'  + url + paramString + '">' + value + '</a>';
    return link;
};

oDesk.Report.prototype.dtFormatHours = function(data){
     val = data.aData[data.iDataColumn];
     if(val == 0){
         return "";
     }
     return oDeskUtil.floatToTime(val);
};

oDesk.Report.prototype.dtFormatCharges = function(data){
    val = data.aData[data.iDataColumn];
     if(val == 0){
               return "";
        }
     return currencyFromNumber(val);
};

oDesk.Report.formatHoursField = function(data, zeroOk){
     var field = data.aData[data.iDataColumn];
     return oDesk.Report.formatHours(field.value, zeroOk);
};

oDesk.Report.formatChargesField = function(data, zeroOk){
    var field = data.aData[data.iDataColumn];
    return oDesk.Report.formatCharges(field.value, zeroOk);
};

oDesk.Report.formatHours = function(val, zeroOk){
     if(val == 0 && !zeroOk){
         return "";
     }
     return oDeskUtil.floatToTime(val);
};

oDesk.Report.formatCharges = function(val, zeroOk){
     if(val == 0  && !zeroOk){
         return "";
     }
     return currencyFromNumber(val);
};


oDesk.Report.prototype.formatHours = function(val, zeroOk){
     if(val == 0 && !zeroOk){
         return "";
     }
     return oDeskUtil.floatToTime(val);
};

oDesk.Report.prototype.formatCharges = function(val, zeroOk){
     if(val == 0  && !zeroOk){
         return "";
     }
     return currencyFromNumber(val);
};
