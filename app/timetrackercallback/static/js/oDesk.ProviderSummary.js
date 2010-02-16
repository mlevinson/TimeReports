(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var cols = [{sTitle:"Provider"}];
        var report = this;
        $.each(oDeskUtil.dayNames, function(i, day){
           cols.push({
               sTitle: day,
               fnRender: report.dtFormatHours,
               sClass: "numeric"
           });
        });
        cols.push({
          sTitle: "Total Hours",
          fnRender:report.dtFormatHours,
          sClass:"numeric total"
        });
        cols.push({
          sTitle: "Total Charges",
          fnRender:report.dtFormatCharges,
          sClass:"numeric total"
        });

        return cols;
    };

    oDesk.Report.prototype.footerSpec = function(){
          var report = this;
          function dayTotalRenderer(results, col){
                return report.formatHours(results.dayTotals[col-1]);
          }

          var footerRows = [];
          footerRows.push({
                sClass: "footer-label",
                fnRender: function(results, col){
                   return "Total for " + report.state.team.name + ":";
                }
          });
          for(d = 0; d < 7; d++) {
             footerRows.push({
                 fnRender: dayTotalRenderer,
                 sClass: "numeric total"
             });
          }

          footerRows.push(
              {
                  fnRender: function(results, col){
                      return report.formatHours(results.grandTotalHours, true);
                  },
                  sClass: "numeric grand-total"
              }
           );
           footerRows.push(
              {
                  fnRender: function(results, col){
                      return report.formatCharges(results.grandTotalCharges, true);
                  },
                  sClass: "numeric grand-total"
              }
           );
           return footerRows;
      };



    oDesk.Report.prototype.transformData = function(data){
          if(!data) return null;
          var grandTotalHours = 0, grandTotalCharges = 0, dayTotals = [0, 0, 0, 0, 0, 0, 0];
          var rows = [], records = [], providers = [];
          if(data.table){
              $.each(data.table.rows, function(i, record){
                  if(record=="") return false;
                  var oDeskRecord = new oDesk.HoursRecord(record);
                  records.push(oDeskRecord);
                  var providerName = oDeskRecord.provider.getDisplayName();
                  if($.inArray(providerName, providers) == -1){
                      providers.push(providerName);
                  }
              });
              providers.sort();
              $.each(providers, function(i, providerName){
                  rows.push([providerName, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
              });

              $.each(records, function(i, record){
                   var providerName = record.provider.getDisplayName();
                   var row = rows[$.inArray(providerName, providers)];
                   var recordWeekDay = record.recordDayOfWeek();
                   var currentVal = parseFloat(row[recordWeekDay + 1]);
                   row[recordWeekDay + 1] = currentVal + record.hours;
                   dayTotals[recordWeekDay] += record.hours;
                   row[8] += record.hours;
                   row[9] += record.charges;
                   grandTotalHours +=  record.hours;
                   grandTotalCharges +=  record.charges;
              });
          }
          return {
                "rows": rows,
                "grandTotalHours": grandTotalHours,
                "grandTotalCharges": grandTotalCharges,
                "dayTotals": dayTotals
          };
    };
})(jQuery);