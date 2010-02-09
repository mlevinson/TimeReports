(function($) { 
$.widget("ui.oDeskJSONSelector",{

    _init: function(){     
        var widget = this;   
        var select = this.element[0];
        widget.setDefaults(select);                    
        $(select).unbind("change").bind("change", function(){
            $(this).children("option:selected").each(function(){  
                var selectedReference =  $(this).val();
                $.data(select, "selectedReference", selectedReference);
                if(selectedReference == "0"){
                    widget.setDefaults(select);
                } else {                                           
                    $.data(select, "selectedId", $(this).attr("id"));
                    $.data(select, "selectedName", $(this).text());                                                
                     widget.selectionChanged(select);                              
                }
            });
        });
    },
    setDefaults: function(select){    
        if(!select){
            select = this.element[0];
        }
        $.data(select, "selectedReference", null);                           
        $.data(select, "selectedId", 0);
        $.data(select, "selectedName", this.options.all_option_text); 
        this.selectionChanged(select);                              
    },
    selectionChanged: function(select){
        if(this.options.onSelectionChange){
            this.options.onSelectionChange(
                $.data(select, "selectedReference"),
                $.data(select, "selectedId"),
                $.data(select, "selectedName"));
        }
    },
    populate: function(params){              
       if(!this.options.dataVariable)  return;
       var options = "<option id='" + this.options.all_option_id + "' value='0'>" +
                        this.options.all_option_text + "</option>";         
       var url = substitute(this.options.json_url_template, params);
       var widget = this;
       $.getJSON(url, function(data){
            $.each(data[widget.options.dataVariable], function(i, row){
                if (widget.options.processRow(row)){
                    options += "<option id='" + widget.options.rowId(row) + "' value='" +
                                widget.options.rowValue(row) +"'>";
                    options += widget.options.rowName(row);
                    options += "</option>";
                }
            });

            $(widget.element[0]).html(options);  
            if(widget.options.populationComplete){
                widget.options.populationComplete();
            }
       });
    }                                                           
});      
    
$.extend($.ui.oDeskJSONSelector, {
   defaults: {
       json_url_template: null,        
       all_option_text:   "All",
       all_option_id:   "All",       
       onSelectionChange: null,
       dataVariable: null,
       processRow: function(row){
           return true;
       },
       rowId : function(row){
           return row.id;
       },
       rowValue: function(row){
           return row.reference;
       },
       rowName: function(row){
           return row.name;
       },
       populationComplete: function(){
           
       }
       
   }
 });          
})(jQuery);