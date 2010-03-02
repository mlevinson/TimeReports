(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var report = this;
        var cols = [];

        function getTimesheetUrl(field, text){
            var url = "timesheet_details.html";
            var params = {
                    startDate: field.startDate.toString("yyyy-MM-dd"),
                    endDate: field.endDate.toString("yyyy-MM-dd"),
                    provider: report.state.provider.id,
                    company_ref: report.state.company.reference,
                    go:"go"
            };
            return oDesk.Report.renderUrl(text, url, params);
        }


        cols.push({
            sTitle: 'Week<span class="help" style="display:none">Click on the week name to view their timesheet details.</span>',
            sClass: "week details",
            fnRender: function(data){
                var field = data.aData[data.iDataColumn];
                return getTimesheetUrl(field, field.value);
            }
        });

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
                colspan:  8,
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

    oDesk.Report.prototype.transformData = function(data){
        if(!data) return null;
        var report = this;
        var results = new oDesk.DataSource.ResultSet(data);
        var weeks = oDeskUtil.getWeeks(report.state.timeline.startDate, report.state.timeline.endDate);
        var labels = [{
            name:"week",
            labelFunction: function(record){
                var whichWeek = weeks.startDates.length - 1;
                $.each(weeks.startDates, function(weekIndex, weekDate){
                    if (record.worked_on.value < weekDate){
                        whichWeek = weekIndex - 1;
                        return false;
                    }
                });

                record.whichWeek = whichWeek;
                return weeks.labels[whichWeek];
            },
            labelValues: {
                whichWeek: function(record){return record.whichWeek;},
                startDate: function(record){return weeks.startDates[record.whichWeek];},
                endDate: function(record){return weeks.endDates[record.whichWeek];}
            }
        }];

        results.pivotWeekDays({
            uniques: {week:weeks.labels},
            labels:labels,
            values:{
                value: function(record){return report.state.mustGetHours?record.hours.value :record.charges.value;},
                date: function(record){return record.worked_on.value;}
            }
         });

         results.addTotalColumn("hours", {value: function(f){return f.dataType =="number" ? f.value || 0 : 0;}});
         results.calculateColumnTotals();

        return results;
    };
})(jQuery);