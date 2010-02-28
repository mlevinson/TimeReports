(function($){

    oDeskUtil = function(){};

    oDeskUtil.dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    oDeskUtil.decorateUrl = function(links, window){
        $(links).each(function(i, link){
            var href = $(link).attr("href");
            $(link).attr("href", href + window.location.search);
        });
    };

    oDeskUtil.substitute = function(str, params){
         var pattern, re, result;
         $.each(params, function(key, value){
           pattern = "\\{" + key + "\\}";
           re = new RegExp(pattern, "g");
           str = str.replace(re, value);
         });
         return str;
    };

    oDeskUtil.getParameterByName = function(name, defaultValue){
         name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
         var regexS = "[\\?&]"+name+"=([^&#]*)";
         var regex = new RegExp( regexS );
         var results = regex.exec( window.location.href );
         if( results == null )
           return defaultValue;
         else
           return results[1];
    };

    oDeskUtil.floatToTime = function(val){
            var hours = parseInt(val);
            var minutes = Math.round((parseFloat(val) - hours) * 60);
            val = hours + ":" + ("00" + minutes).slice(-2);
            return val;
    };

    oDeskUtil.getDayNumber = function(date){
        var number = date.getDay();
        number--;
        if(number < 0) number = 6;
        return number;
    };

    oDeskUtil.getWeeks = function(startDate, endDate){
        var firstDay = startDate;
        var firstDayDayNumber = oDeskUtil.getDayNumber(firstDay);
        var weekDays = 6 - firstDayDayNumber;
        var weeks = {labels: [], startDates: [], endDates: []};
        var done = false;
        var weekStartDate = firstDay.clone();
        while(!done){
            var weekEndDate = weekStartDate.clone();
            weekEndDate.addDays(weekDays);
            weekDays = 6;
            var start = weekStartDate.toString("dd MMM");
            if (weekEndDate >= endDate){
              weekEndDate = endDate.clone();
              done = true;
            }
            var end = weekEndDate.toString("dd MMM");
            var weekLabel = start;
            if(end != start){
              weekLabel += " - "  + end;
            }

            weeks.labels.push(weekLabel);
            weeks.startDates.push(weekStartDate.clone());
            weeks.endDates.push(weekEndDate.clone());
            weekStartDate = weekEndDate;
            weekStartDate.addDays(1);
        }
        return weeks;
    };

    oDeskUtil.ajax = function(query, success, failure){
        if(!query && $.isFunction(failure)){
            failure("Not Connected.", "Query is null");
            return null;
        }
        $.ajax({
             url: query,
             dataType: 'jsonp',
             error: function(request, status, error){
                 if($.isFunction(failure)){
                     failure(status, error);
                 }

             },
             success: function(data, status, request){
                 if($.isFunction(success)){
                     success(data, status);
                 }
             }
         });
    };


})(jQuery);