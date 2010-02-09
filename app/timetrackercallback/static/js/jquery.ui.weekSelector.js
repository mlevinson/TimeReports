(function($) { 
$.widget("ui.weekSelector",{

    _init: function(){     
            var widget = this;
            var displayHtml = "<a href=\"#\" id=\"previous_week\" class=\"icon previous\"></a>\
                                    <a id=\"week_selector\" class=\"dispatchable\">\
                                        <span id=\"week_selector_name\"></span>\
                                        <span class=\"icon arrow_down\"></span>\
                                    </a>\
                               <a href=\"#\" id=\"next_week\" class=\"icon next\"></a>";
            
            $(widget.element[0]).append(displayHtml);                              
            $("#previous_week").unbind("click").bind("click", function(){
                var newStartDate = $("#week_selector").dpGetSelected().clone();
                newStartDate.moveToDayOfWeek(1, -1); 
                $("#week_selector").dpSetSelected(newStartDate.toString("dd/MM/yyyy"));
            });           

            $("#next_week").unbind("click").bind("click", function(){
                var newStartDate = idget.options.weekStartDate.clone();
                newStartDate.moveToDayOfWeek(1, 1); 
                $("#week_selector").dpSetSelected(newStartDate.toString("dd/MM/yyyy"));
            });

            $("#week_selector").datePicker({
                startDate:"01/01/1996", 
                selectWeek:true, 
                createButton:false,
            })            
            .unbind("click").bind("click", function(){$("#week_selector").dpDisplay();})
            .unbind("dateSelected").bind("dateSelected",function(e, selectedDate, $td){
                var displayText = selectedDate.toString("dd MMM yyyy"); 
                displayText += " - ";
                displayText += selectedDate.clone().addDays(6).toString("dd MMM yyyy");
                $("#week_selector_name").text(displayText);
                $(widget.element[0]).trigger("dateSelected", selectedDate);
             })
             .dpSetSelected(widget.options.weekStartDate.toString("dd/MM/yyyy"));        
    }                                                           
});      
    
$.extend($.ui.ringceMonthSelector, {
   defaults: {
       weekStartDate: Date.today()
   }
 });          
})(jQuery);