(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var report = this;
        var cols = [];
        if (report.state.buyer){
            cols.push({sTitle:"Provider", width:"218px", fnRender: oDesk.Report.renderField});
        } else {
            cols.push({sTitle:"Buyer", width:"218px", fnRender: oDesk.Report.renderField});
        }
        $.each(oDeskUtil.dayNames, function(i, day){
           cols.push({
               sTitle: day,
               fnRender: oDesk.Report.formatHoursField,
               sClass: "numeric",
               width: "56px"
           });
        });
         cols.push({
              sTitle: "Total Hours",
              fnRender: oDesk.Report.formatHoursField,
              sClass:"numeric total",
              width: "90px"
            });
        cols.push({
          sTitle: "Total $",
          fnRender: oDesk.Report.formatChargesField,
          sClass:"numeric total",
          width: "90px"
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
                    if (report.state.buyer){
                        return "Total for " + report.state.buyer.name + ":";
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
                           return report.state.buyer?
                                record.provider_name.value :
                                record.team_name.value;
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