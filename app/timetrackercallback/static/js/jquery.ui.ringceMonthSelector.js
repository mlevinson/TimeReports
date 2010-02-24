/*
 * jQuery UI Ringce Month Selector
 * version: 0.1b (2010-02-07)
 * @requires jQuery v1.3.1 or later
 * @requires jQuery UI v1.7 or later

 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function($) {
$.widget("ui.ringceMonthSelector",{

    _init: function(){
        var widget = this;
        var displayHtml = "<a href=\"#\" id=\"one_year_back\" class=\"icon first\"></a>\
            <a href=\"#\" id=\"one_month_back\" class=\"icon previous\"></a>\
            <span id=\"selection_display\">\
                <span id=\"month_display\"></span>\
                <span id=\"year_display\"></span>\
                <span class=\"icon arrow_down\"></span>\
            </span>\
            <a href=\"#\" id=\"one_month_forward\" class=\"icon next\"></a>\
            <a href=\"#\" id=\"one_year_forward\" class=\"icon last\"></a>";

        var selectorHtml = "<div id=\"month_selector_container\" style=\"display:none\">\
                                <ul id=\"month_selector_list\"></ul></div>";
        $(widget.element[0]).wrap("<div id=\"month_selector_wrapper\">");
        $(widget.element[0]).addClass("month-selector");
        $(widget.element[0]).append(displayHtml);
        $("#month_selector_wrapper").append(selectorHtml);
        var listHtml = "";
        $.each(Date.CultureInfo.monthNames, function(monthIndex, month){
                    var column = parseInt(monthIndex / 4) + 1;
                    var className = "column" + column;
                    className += (" month" + monthIndex);
                    if(monthIndex == 4 || monthIndex == 8){
                        className += " reset";
                    }
                    listHtml += "<li class=\"" + className + "\"><span>" + month + "</span></li>";
                });
        $("#month_selector_list").html(listHtml);
        var date = Date.today();
        date.moveToFirstDayOfMonth();
        widget.selectDate(date);
        $(document).click(function(event){
            if(!$(event.target).is("#selection_display")){
                $("#month_selector_container").hide();
                $(widget.element[0]).removeClass("popped");
            }
        });
        $("#month_selector_wrapper").click(function(event){
            event.stopPropagation();
        });
        $("#selection_display").unbind("click").bind("click", function(){
           $("#month_selector_container").toggle();
            $(widget.element[0]).toggleClass("popped");
        });

        $("#one_year_back").unbind("click").bind("click", function(){
            date.moveToMonth(date.getMonth(), -1);
            widget.selectDate(date);
        });

        $("#one_year_forward").unbind("click").bind("click", function(){
            if($(this).hasClass("gray")){
                  event.stopPropagation();
                  return false;
            }
            var d = date.clone();
            d.moveToMonth(d.getMonth());
            var today = Date.today();
            date = d > today ? today : d;
            widget.selectDate(date);
        });

        $("#one_month_back").unbind("click").bind("click", function(){
            date.moveToMonth(date.getMonth()-1, -1);
            widget.selectDate(date);
        });

        $("#one_month_forward").unbind("click").bind("click", function(event){
              if($(this).hasClass("gray")){
                  event.stopPropagation();
                  return false;
              }
              var today = Date.today();
              var d = date.clone();
              d.moveToMonth(d.getMonth()+1);
              date = d > today ? today : d;
              widget.selectDate(date);
        });

        $("#month_selector_list li span").unbind("click").bind("click", function(event){
            if(widget.options.disableFutureMonths && $(this).hasClass("future_month")){
               event.stopPropagation();
               return;
            }
            $("#month_selector_container").hide();
            $(widget.element[0]).removeClass("popped");
            var index = $("#month_selector_list li span").index(this);
            date.set({month:index});
            widget.selectDate(date);
        });
    },
    selectDate: function(d){
          var today = Date.today();
          if(d > today){
              d = today;
          }
          $("#month_display").text(d.toString("MMMM"));
          $("#year_display").text(d.toString("yyyy"));
          $("#month_selector_list li span").removeClass("selected");
          $("#month_selector_list li span").removeClass("future_month");
          $("#one_year_forward, #one_month_forward").removeClass("gray");
          var index = d.getMonth();
          this.options.selection = d;
          $("#month_selector_list li span").eq(index).addClass('selected');
          if(this.options.disableFutureMonths && d.getYear() == today.getYear()){
              index = today.getMonth();
              $("#one_year_forward").addClass("gray");
              if(index == d.getMonth()){
                $("#one_month_forward").addClass("gray");
              }
              $("#month_selector_list li span:gt(" + index + ")").addClass('future_month');
          }

          $(this.element[0]).trigger("monthSelected", d);
    }

});

$.extend($.ui.ringceMonthSelector, {
   defaults: {
       closeAfterSelect: true,
       disableFutureMonths: true
   }
 });
})(jQuery);