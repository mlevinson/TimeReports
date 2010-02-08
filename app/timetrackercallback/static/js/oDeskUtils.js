function substitute(str, params){ 
     var pattern, re;
     $.each(params, function(key, value){
       pattern = "\\{" + key + "\\}";   
       re = new RegExp(pattern, "g");        
       str = str.replace(re, value);  
     });
     return str; 
}                 

function getParameterByName(name, defaultValue){
     name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
     var regexS = "[\\?&]"+name+"=([^&#]*)";
     var regex = new RegExp( regexS );
     var results = regex.exec( window.location.href );
     if( results == null )
       return defaultValue;
     else
       return results[1];
}  
   
function floatToTime(val){
        var hours = parseInt(val);
        var minutes = Math.round((parseFloat(val) - hours) * 60);
        if(minutes == 0){
            minutes = "00";
        }
        val = hours + ":" + minutes;
        return val;
}   

function getDayNumber(date){
    var number = date.getDay();
    number--;
    if(number < 0) number = 6;
    return number;
}