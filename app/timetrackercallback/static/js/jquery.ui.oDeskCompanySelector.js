(function($) {
$.widget("ui.oDeskCompanySelector",{
    _init: function(){
      this.populateList();
    },
    populateList: function(){
        var widget = this;
        $(widget.element[0]).children("." + widget.options.containerClass).remove();
        var html = '<div class="';
        html += widget.options.containerClass;
        html += '"><div class="';
        html += widget.options.selectionDisplayClass;
        html += '"></div><ul>';
        var totalItems = 0;
        $.each(widget.options.companies, function(i, company){
            if (!company.hidden){
                totalItems++;
                html += '<li class="';
                html += widget.options.listItemClass;
                if (i == widget.options.selectedIndex){
                    html += " ";
                    html += widget.options.selectedListItemClass;
                }
                html += '">';
                html += company.name;
                html += '</li>';
            }
        });
        html += '</ul></div>';
        widget.options.selector = $(html).appendTo(widget.element[0]);
        if (totalItems){
            $(widget.options.selector).toggle(function(){
                 // place the menu relative to the bottom
                 var dropdownHeightOffset = $(this).height();
                 $('ul',this).css('top',dropdownHeightOffset + 'px');
                 $('ul',this).show();
            }, function(){
                $('ul',this).hide();

            });
        } else {
            $(widget.options.selector).toggle(function(){}, function(){});
        }
        widget.applySelection();

    },
    _selectionDisplay: function(){
        return $(this.options.selector).children("div." + this.options.selectionDisplayClass);
    },
    applySelection: function(){
        var widget = this;
        if(!widget.options.companies.length ||
            widget.options.selectedIndex >= widget.options.companies.length) return;
        this._selectionDisplay().text(widget.options.companies[widget.options.selectedIndex].name);

    }

});


$.extend($.ui.oDeskCompanySelector, {
   defaults: {
       containerClass: "customSelector",
       selectionDisplayClass: "display",
       listItemClass: "child",
       selectedListItemClass: "selected",
       companies: [],
       selectedIndex:0
   }
 });
})(jQuery);