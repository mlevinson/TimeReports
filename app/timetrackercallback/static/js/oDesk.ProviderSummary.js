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
          function columnTotalRenderer(results, col){
                return oDesk.Report.formatHours(results.columnTotals[col].value);
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
                 fnRender: columnTotalRenderer,
                 sClass: "numeric total"
             });
          }

          footerRows.push({
              sClass: "numeric grand-total",
              fnRender: function(results, col){
                  return oDesk.Report.formatHours(results.columnTotals[col].value, true);
              }
          });
          footerRows.push({
              sClass: "numeric grand-total",
              fnRender: function(results, col){
                  return oDesk.Report.formatCharges(results.columnTotals[col].value, true);
              }
          });

          return footerRows;
      };



    oDesk.Report.prototype.transformData = function(data){
          var results = new oDesk.DataSource.ResultSet(data);
          results.pivotWeekDays({
              labels: [
                  {
                      name: "provider",
                      labelFunction: function(record){
                        var provider = new oDesk.Provider(record.provider_id.value, record.provider_name.value);
                        return provider.getDisplayName();
                      }
                  }
              ],
              values: {
                  value: function(record){return record.hours.value;},
                  charges: function(record){return record.charges.value;}
              }
          });

          results.addTotalColumn("hours", {value:function(f){return f.dataType == "number"? f.value || 0 : 0;}});
          results.addTotalColumn("charges", {value:function(f){return f.dataType == "number"? f.charges || 0 : 0;}});

          results.calculateColumnTotals();

          return results;
    };
})(jQuery);