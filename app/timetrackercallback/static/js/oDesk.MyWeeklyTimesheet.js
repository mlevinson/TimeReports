(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var report = this;
        var cols = [];
        if(report.state.provider.id){
            cols.push({sTitle:"Buyer",fnRender: oDesk.Report.renderField});
        } else {
            cols.push({sTitle:"Provider", fnRender: oDesk.Report.renderField});
        }
        $.each(oDeskUtil.dayNames, function(i, day){
           cols.push({
               sTitle: day,
               fnRender:  oDesk.Report.formatHoursField,
               sClass: "numeric"
           });
        });
         cols.push({
              sTitle: "Total Hours",
              fnRender: oDesk.Report.formatHoursField,
              sClass:"numeric total"
            });
        cols.push({
          sTitle: "Total $",
          fnRender: oDesk.Report.formatChargesField,
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
                    if (report.state.provider.name){
                        return "Total for " + report.state.provider.name + ":";
                    }  else {
                        return "Total:";
                    }
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
        var report = this;
        var results = new oDesk.DataSource.ResultSet(data);


        results.pivotWeekDays({
             labels: [
                 {
                     name: report.state.provider.id ? "provider" : "buyer",
                     labelFunction: function(record){
                         if (report.state.provider.id) {
                             return record.team_name.value;
                         } else {
                             var provider = new oDesk.Provider(record.provider_id.value, record.provider_name.value);
                             return provider.getDisplayName();
                         }
                     }
                 }
             ],
             values: {
                 value: function(record){return record.hours.value;},
                 earnings: function(record){return record.earnings.value;}
             }
        });


        results.addTotalColumn("hours", {value:function(f){return f.dataType == "number"? f.value || 0 : 0;}});
        results.addTotalColumn("earnings", {value:function(f){return f.dataType == "number"? f.earnings || 0 : 0;}});

        results.calculateColumnTotals();

        return results;
    };
})(jQuery);