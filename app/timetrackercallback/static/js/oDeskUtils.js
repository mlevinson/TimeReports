function substitute(str, params){ 
     var pattern, re;
     $.each(params, function(key, value){
       pattern = "\\{" + key + "\\}";   
       re = new RegExp(pattern, "g");        
       str = str.replace(re, value);  
     });
     return str; 
}