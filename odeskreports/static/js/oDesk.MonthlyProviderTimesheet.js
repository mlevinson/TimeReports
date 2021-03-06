(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var cols = [{sTitle:"Week", fnRender: oDesk.Report.renderField}];
        var report = this;
        function render(data){
            if(report.state.mustGetHours){
                return oDesk.Report.formatHoursField(data);
            } else {
                return oDesk.Report.formatChargesField(data);
            }
        }
        $.each(oDeskUtil.dayNames, function(i, day){
           cols.push({
               sTitle: day,
               fnRender: render,
               sClass: "numeric"
           });
        });

        cols.push({
          sTitle: "Total",
          fnRender:render,
          sClass:"numeric total"
        });

        return cols;
    };


    oDesk.Report.prototype.footerSpec = function(){
          var report = this;
          var footerRows = [];
          footerRows.push({
                sClass: "footer-label",
                colspan: 8,
                fnRender: function(results, col){
                    var label = "Total ";
                    label += report.state.mustGetHours ? "Hours" : "Charges";
                    label += " for ";
                    label += report.state.provider.name;
                    label += ":";
                    return label;
                }
          });
          footerRows.push(
              {
                  fnRender: function(results, col){
                      var value = report.state.mustGetHours ?
                                    report.formatHours(results.columnTotals[8].value, true) :
                                    report.formatCharges(results.columnTotals[8].value, true);
                      return value;
                  },
                  sClass: "numeric grand-total"
              }
           );
          return footerRows;
      };

    function getWeeks(startDate){
        var firstDayOfMonth = startDate;
        var firstDayDayNumber = oDeskUtil.getDayNumber(firstDayOfMonth);
        var daysInMonth = firstDayOfMonth.getDaysInMonth();
        var monthName = firstDayOfMonth.toString("MMM");
        var weekStartDateNumber = 1;
        var year = firstDayOfMonth.toString("yyyy");
        var month = firstDayOfMonth.toString("MM");
        var weekDays = 6 - firstDayDayNumber;
        var weeks = {labels: [], startDates: []};
        var done = false;
        while(!done){
            var startDateDD = ("00" + weekStartDateNumber).slice(-2);
            var start = monthName + " " + startDateDD;
            var weekEndDay =  weekStartDateNumber + weekDays;
            weekDays = 6;
            if (weekEndDay >= daysInMonth){
              weekEndDay = daysInMonth;
              done = true;
            }
            var end = monthName + " "   + ("00" + weekEndDay).slice(-2);
            var weekLabel = start;
            if(end != start){
              weekLabel += " - "  + end;
            }
            weeks.labels.push(weekLabel);
            var startDateString = year + "/" + month + "/" + startDateDD;
            weeks.startDates.push(Date.fromString(startDateString, "yyyy/mm/dd"));
            weekStartDateNumber = weekEndDay + 1;
        }
        return weeks;
    };

    oDesk.Report.prototype.transformData = function(data){
        if(!data) return null;
        var report = this;
        var weeks = getWeeks(report.state.timeline.startDate);


        function labelFunction(record){
            var whichWeek = 0;
            $.each(weeks.startDates, function(weekIndex, weekDate){
                if (record.worked_on.value < weekDate){
                    whichWeek = weekIndex - 1;
                    return false;
                }
            });
            return weeks.labels[whichWeek];
        }

        function valueFunction(record){
            return report.state.mustGetHours? record.hours.value : record.charges.value;
        }

        var results = new oDesk.DataSource.ResultSet(data);

        results.pivotWeekDays({
            uniques: {week:weeks.labels},
            labels:[{name:"week", labelFunction: labelFunction}],
            values:{value:valueFunction}
         });


         results.addTotalColumn("hours", {value: function(f){return f.dataType =="number" ? f.value || 0 : 0;}});
         results.calculateColumnTotals();


        return results;
    };
})(jQuery);