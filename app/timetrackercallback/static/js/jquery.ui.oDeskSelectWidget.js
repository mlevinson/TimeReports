(function($) { 
$.widget("ui.oDeskSelectWidget",{
    _init: function(){     
        var widget = this;   
        var select = this.element[0];
        widget.setDefaults(select);                    
        $(select).unbind("change").bind("change", function(){
            $(this).children("option:selected").each(function(){  
                var selectedReference =  $(this).val();
                if(selectedReference == "0"){
                    widget.setDefaults(select);
                } else {      
                     var obj = widget.options.stateVariable; 
                     obj.reference = selectedReference; 
                     obj.id = $(this).attr("id"); 
                     if(widget.options.useDisplayName){
                         obj.setDisplayName($(this).text());
                     } else {
                         obj.name = $(this).text();                                                                         
                     }   
                     $(select).trigger("selectionChanged", obj);                            
                }
            });
        });
    },
    setDefaults: function(select){    
        if(!select){
            select = this.element[0];
        }        
        var obj = this.options.stateVariable;
        if(!obj) return;
        obj.reference = null;
        obj.id = 0;        
        obj.name = this.options.all_option_text;
        $(select).trigger("selectionChanged", obj);
    },
    populate: function(params){              
       if(!this.options.stateVariable || !this.options.report || !this.options.service)  return;
       var options = "<option id='" + this.options.all_option_id + "' value='0'>" +
                        this.options.all_option_text + "</option>";         
       var widget = this;  
       this.options.service(this.options.report, function(objs){
           $.each(objs, function(i, obj){
               options += "<option id='" + obj.id + "' value='" +
                           obj.reference +"'>";
               options += widget.options.useDisplayName ? obj.getDisplayName() : obj.name;
               options += "</option>";
           }); 
           $(widget.element[0]).html(options);  
           $(widget.element[0]).trigger("populationComplete", objs);
       });
    }                                                           
});      
    
$.extend($.ui.oDeskSelectWidget, {
   defaults: {
       report: null,
       stateVariable: null,
       service: null,
       useDisplayName:  false,
       all_option_text: "All",
       all_option_id:   "All"
   }
 });          
})(jQuery);