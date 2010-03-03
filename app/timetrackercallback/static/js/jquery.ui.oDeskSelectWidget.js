(function($) {
$.widget("ui.oDeskSelectWidget",{
    _init: function(){
        var widget = this;
        var select = this.element[0];
        $(select).after('<span style="display:none" class="' + widget.options.noItemStyle + '"></span>');
        $(select).after('<span style="display:none" class="' + widget.options.singleItemStyle + '"></span>');
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
        if(!element || !$(element).length) {
            $(widget.element[0]).trigger("selectionChanged", null);
            return;
        };
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
    _createNoItemLabel: function(){
        var widget = this;
        var select = this.element[0];
        $(select).hide();
        $(select).nextAll("." + widget.options.singleItemStyle).hide();
        $(select).nextAll("." + widget.options.noItemStyle)
            .show()
            .text(widget.options.noItemsText);
        var obj = widget.options.stateVariable;
        obj.reference = null;
        obj.id = 0;
        obj.name = "";
        $(select).trigger("selectionChanged", null);
    },
    _createSingleLabel: function(obj){
        var widget = this;
        var select = this.element[0];
        $(select).hide();
        $(select).nextAll("." + widget.options.noItemStyle).hide();
        $(select).nextAll("." + widget.options.singleItemStyle)
            .text(widget.options.useDisplayName ? obj.getDisplayName() : obj.name)
            .show();
        widget.options.stateVariable.reference = obj.reference;
        widget.options.stateVariable.id = obj.id;
        widget.options.stateVariable.name = obj.name;
        $(select).trigger("selectionChanged", obj);
    },
    populate: function(params){
       if(!this.options.stateVariable || !this.options.report || !this.options.service)  return;
       var select = this.element[0];
       var options = "";
       if (this.options.includeAllOption){
           options += "<option id='" +
                      this.options.all_option_id + "' value='0'>" +
                      this.options.all_option_text + "</option>";
       }

       var widget = this;
       this.options.service(this.options.report, function(objs){

           if(objs.length == 1){
               widget._createSingleLabel(objs[0]);
               return;
           } else if (objs.length == 0){
               widget._createNoItemLabel();
               return;
           }
           $(select).nextAll(widget.options.noItemStyle).hide();
           $(select).nextAll(widget.options.singleItemStyle).hide();
           $(select).show();
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
               widget.options.stateVariable.id = selectedObj.id;
               widget.options.stateVariable.reference = selectedObj.reference;
               widget.options.stateVariable.name = selectedObj.name;
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
       includeAllOption: true,
       noItemsText: "Nothing to select",
       singleItemStyle: "single_value",
       noItemStyle: "no_value"
   }
 });
})(jQuery);