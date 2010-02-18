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
              var record = data.aData[data.iDataColumn].record;
              if (record.taskUrl && record.taskUrl.value && record.taskUrl.value != ""){
                  return '<a href="' + record.taskUrl.value + '">' + record.taskDescription.value + '</a>';
              } else {
                  return record.taskDescription.value;
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
                         var total = results.groupTotals.task[group.value];
                         return report.formatHours(total.hours.value, true);
                      }
                  },
                  {
                      sClass: "numeric grand-total",
                      fnRender: function(results, group){
                         var total = results.groupTotals.task[group.value];
                         return report.formatCharges(total.charges.value, true);
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
                      return report.formatHours(results.grandTotals.hours.value, true);
                  },
                  sClass: "numeric grand-total"
              }
           );
           footerRows.push(
              {
                  fnRender: function(results, col){
                      return report.formatCharges(results.grandTotals.charges.value, true);
                  },
                  sClass: "numeric grand-total"
              }
           );
           return footerRows;
      };

    oDesk.Report.prototype.transformData = function(results){


        results.createRows({
         columns: [
            {name:"task", type:"string", valueFunction: function(record){return record.taskDescription.value;}},
            {name:"provider", type:"string", valueFunction: function(record){return record.provider_name.value;}},
            {name:"hours", type:"string", valueFunction: function(record){return record.hours.value;}},
            {name:"charges", type:"string", valueFunction: function(record){return record.charges.value;}},
         ]
        });

        results.calculateTotals({
            addRowTotals: true,
            groupTotals: [
                {
                    name: "task",
                    groupFunction: function(record){return record.taskDescription.value;}
                }
            ],
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