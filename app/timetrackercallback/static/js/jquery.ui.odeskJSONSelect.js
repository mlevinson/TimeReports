(function($) { 
$.widget("ui.oDeskJSONSelector",{

    _init: function(){     
        var widget = this;
        $(this).each(function(i, element){
            $(this).unbind("change").bind("change", function(){
                var select = this;
                $(this).children("option:selected").each(function(){
                    $.data(select, "selectedReference", $(this).val());
                    if(selectedReference == "0"){
                        widget.setDefaults();
                        widget.selectionChanged(select);
                    } else {                                           
                        $.data(select, "selectedId", $(this).attr("id"));
                        $.data(select, "selectedName", $(this).text());                                                
                         widget.selectionChanged(select);                              
                    }
                });
            });
        });
    },
    setDefaults: function(){
        $.data(select, "selectedReference", null);                           
        $.data(select, "selectedId", 0);
        $.data(select, "selectedName", this.options.all_option_text);        
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
       var options = "<option id='" + this.options.all_option_id + "' value='0'>All</option>";         
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
       }
       
   }
 });          
})(jQuery);