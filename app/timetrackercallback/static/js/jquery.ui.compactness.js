(function($) {
$.widget("ui.compactness",{

    _init: function(){
    },
    _shortstring: function(text){
       var widget = this;
       var shortened = {done:false, text:text, rest:null};
       if (text == null || text == "") return shortened;
       var cutoff = text.length - widget.options.letterCount;
       if (cutoff > 0) {
           shortened.text = text.substr(0, widget.options.letterCount);
           shortened.rest = text.substr(cutoff);
           shortened.done = true;
        };
       return shortened;
    },
    compact: function(){
        var widget = this;
        var wrapper = '<span class="compact-wrap" style="display:none"></span>';
        var moreHtml = '<a href="#" onclick="$(this).parent().compactness(\'remove\'); return false;" class="' + widget.options.moreClass + '" >' + widget.options.moreText + '</a>';
        $(widget.element).each(function(){
            var text = $(this).text();
            var shortness = widget._shortstring(text);
            if(shortness.done){
                $(this).after(wrapper);
                $(this).next(".compact-wrap").text(text);
                $(this).text(shortness.text);
                $(this).append(moreHtml);
            }
        });
    },
    remove: function(){
        var widget = this;
        $(widget.element).children("." + widget.options.moreClass).remove();
        $(widget.element).each(function(){
            var compactness = $(this).next(".compact-wrap");
            if(compactness.length){
                $(this).text(compactness.text());
                compactness.remove();
            }
        });
    }
});

$.extend($.ui.compactness, {
   defaults: {
       moreClass: "compactness-more",
       moreText: "…",
       letterCount: 70
   }
 });
})(jQuery);