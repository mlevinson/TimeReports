(function($) {
$.widget("ui.oDeskCompanySelector",{
    _init: function(){
      this.populateList();
    },
    populateList: function(){
        var widget = this;
        $(widget.element[0]).children(".customSelector").remove();
        var html = '<div class="customSelector"><div class="selected"></div><ul>';
        $.each(widget.options.companies, function(i, company){
            if (!company.hidden){
                html += '<li class="child">';
                html += company.name;
                html += '</li>';
            }
        });
        html += '</ul></div>';
        $(widget.element[0]).append(html);
    }

});


$.extend($.ui.oDeskDataTable, {
   defaults: {
       containerClass: "customSelector",
       selectionDisplayClass: "selected",
       selectedListItemClass: "selected",
       companies: []
   }
 });
})(jQuery);