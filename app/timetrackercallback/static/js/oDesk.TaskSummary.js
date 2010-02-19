(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var report = this;
        var cols = [];
        cols.push({
            sTitle:"Task",
            width:"360px",
            canGroup: true,
            groupValue: function(field){
              return field.value;
            },
            fnRender: function(data){
              var taskField = data.aData[data.iDataColumn];
              if (taskField.url && taskField.url != ""){
                  return '<a href="' + taskField.url + '">' + taskField.value + '</a>';
              } else {
                  return taskField.value;
              }

            }
        });
        cols.push({sTitle:"User", width:"218px", fnRender: function(data){return data.aData[data.iDataColumn].value;}});
        cols.push({
          sTitle: "Total Hours",
          fnRender:oDesk.Report.formatHoursField,
          sClass:"numeric total",
          width:"90px"
        });
        cols.push({
          sTitle: "Total $",
          fnRender:oDesk.Report.formatChargesField,
          sClass:"numeric total",
          width:"90px"

        });
        return cols;
    };

    oDesk.Report.prototype.getGroupFooter = function(results, group){
          var report = this;
          return {
              sClass: "footer-row",
              columns: [
                  {   sClass: "footer-label",
                      fnRender: function(results, group){
                          return "Total:";
                      }
                  },
                  {
                      sClass: "numeric grand-total",
                      fnRender: function(results, group){
                         var total = results.groupTotals[group.value];
                         return report.formatHours(total[2].value, true);
                      }
                  },
                  {
                      sClass: "numeric grand-total",
                      fnRender: function(results, group){
                         var total = results.groupTotals[group.value];
                         return report.formatCharges(total[3].value, true);
                      }
                  }
              ]
          };
    };

    oDesk.Report.prototype.footerSpec = function(){
          var report = this;
          var footerRows = [];
          footerRows.push({
                sClass: "footer-label",
                colspan: 2,
                fnRender: function(results, col){
                    return "Total for all tasks and users:";
                }
          });
          footerRows.push(
              {
                  fnRender: function(results, col){
                      return report.formatHours(results.columnTotals[2].value, true);
                  },
                  sClass: "numeric grand-total"
              }
           );
           footerRows.push(
              {
                  fnRender: function(results, col){
                      return report.formatCharges(results.columnTotals[3].value, true);
                  },
                  sClass: "numeric grand-total"
              }
           );
           return footerRows;
      };

    oDesk.Report.prototype.transformData = function(results){
        results.createRows({
         columns: [
            {name:"task", type:"string", valueFunctions:{
                    value: function(record){return record.taskDescription.value;},
                    url: function(record){return record.taskUrl? record.taskUrl.value : null;}
                }},
            {name:"provider", type:"string", valueFunctions:{value: function(record){return record.provider_name.value;}}},
            {name:"hours", type:"number", valueFunctions:{value: function(record){return record.hours.value;}}},
            {name:"charges", type:"number", valueFunctions:{value: function(record){return record.charges.value;}}}
         ]
        });

        results.calculateColumnTotals();
        results.calculateGroupTotals(0);
        return results;
    };
})(jQuery);