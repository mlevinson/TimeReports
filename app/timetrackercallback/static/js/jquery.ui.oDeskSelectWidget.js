(function($) {
$.widget("ui.oDeskSelectWidget",{
    _init: function(){
        var widget = this;
        var select = this.element[0];
        $(select).unbind("change").bind("change", function(){
            $(this).children("option:selected").each(function(){
                var selectedReference =  $(this).val();
                if(selectedReference == "0"){
                    widget.setDefaults(select);
                } else {
                    widget._selectionChanged(this);
                }
            });
        });
    },
    _selectionChanged: function(element){
        var widget = this;
        if(!element || !$(element).length) return;
         $(element).attr("selected", true);
         var obj = widget.options.stateVariable;
         obj.reference = $(element).val();
         obj.id = $(element).attr("id");
         if (obj.id == widget.options.all_option_id){
             obj.id = 0;
         }
         if(widget.options.useDisplayName){
             obj.setDisplayName($(element).text());
         } else {
             obj.name = $(element).text();
         }
         $(widget.element[0]).trigger("selectionChanged", obj);
    },
    selectWithId: function(id){
      var element = $(this.element[0]).children("option#" + id);
      this._selectionChanged(element);
    },
    selectWithReference: function(reference){
      var element = $(this.element[0]).children("option:[value=" + reference + "]");
      this._selectionChanged(element);
    },
    setDefaults: function(select){
        this._selectionChanged($(this.element[0]).children("option:first-child"));
    },
    populate: function(params){
       if(!this.options.stateVariable || !this.options.report || !this.options.service)  return;
       var options = "";
       if (this.options.includeAllOption){
           options += "<option id='" +
                      this.options.all_option_id + "' value='0'>" +
                      this.options.all_option_text + "</option>";
       }

       var widget = this;
       this.options.service(this.options.report, function(objs){
           var selectedObj = null;
           $.each(objs, function(i, obj){
               var selected = false;
               if(obj.id == widget.options.stateVariable.id){
                   selected = true;
                   selectedObj = obj;
               }
               options += "<option id='" + obj.id + "' value='" +
                           obj.reference + "' selected='" + selected + "'>";

               options += widget.options.useDisplayName ? obj.getDisplayName() : obj.name;
               options += "</option>";
           });
           $(widget.element[0]).html(options);
           $(widget.element[0]).trigger("populationComplete", objs);
           if(selectedObj){
               widget.options.stateVariable = selectedObj;
               widget.selectWithReference(selectedObj.reference);
           } else {
               widget.setDefaults();
           }

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
       all_option_id:   "All",
       includeAllOption: true
   }
 });
})(jQuery);