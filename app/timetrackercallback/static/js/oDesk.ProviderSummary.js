(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var cols = [
                    {sTitle:"Provider", fnRender: oDesk.Report.renderField}];
        var report = this;
        $.each(oDeskUtil.dayNames, function(i, day){
           cols.push({
               sTitle: day,
               fnRender: oDesk.Report.formatHoursField,
               sClass: "numeric"
           });
        });
        cols.push({
          sTitle: "Total Hours",
          fnRender:oDesk.Report.formatHoursField,
          sClass:"numeric total"
        });
        cols.push({
          sTitle: "Total Charges",
          fnRender:oDesk.Report.formatChargesField,
          sClass:"numeric total"
        });

        return cols;
    };

    oDesk.Report.prototype.footerSpec = function(){
          var report = this;
          function dayTotalRenderer(results, col){
                return oDesk.Report.formatHours(results.columnTotals.hours[col-1].value);
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
                      return  oDesk.Report.formatHours(results.grandTotals.hours.value, true);
                  },
                  sClass: "numeric grand-total"
              }
           );
           footerRows.push(
              {
                  fnRender: function(results, col){
                      return oDesk.Report.formatCharges(results.grandTotals.charges.value, true);
                  },
                  sClass: "numeric grand-total"
              }
           );
           return footerRows;
      };



    oDesk.Report.prototype.transformData = function(data){
          var results = new oDesk.DataSource.ResultSet(data);
          results.pivotWeekDays({
              labelFunction: function(record){
                  var provider = new oDesk.Provider(record.provider_id.value, record.provider_name.value);
                  return provider.getDisplayName();
               },
               valueFunction: function(record){
                   return record.hours.value;
               }
          });

          results.calculateTotals({ 
              addRowTotals: true,
              totals : [
                  {
                      name: "hours",
                      label: "Total Hours",
                      valueFunction: function(record){return record.hours.value;}
                  },
                  {
                      name: "charges",
                      label: "Total $",
                      valueFunction: function(record){return record.charges.value;}
                  }
              ]
          });

          return results;
    };
})(jQuery);