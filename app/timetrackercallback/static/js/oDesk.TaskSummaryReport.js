(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var report = this;
        var cols = [];
        var taskColumn = {
            sTitle:"Task",
            canGroup: !report.providerSummary || (report.providerSummary && report.state.showTeamName),
            groupValue: function(field){
              return field.value;
            },
            fnRender: function(data){
                var taskField = data.aData[data.iDataColumn];
                var text = taskField.code;
                if (taskField.value && taskField.value != "" && taskField.value != text){
                    text += " - ";
                    text += taskField.value;
                }
                if (taskField.url && taskField.url != ""){
                    text = '<a href="' + taskField.url + '">' + text + '</a>';
                }

                return text;
            }
        };
        var providerColumn = {
            sTitle:"User",
            canGroup: report.providerSummary || report.state.showTeamName,
            groupValue: function(field){
              return field.value;
            },
            fnRender: function(data){return data.aData[data.iDataColumn].value;}
        };

        if (report.providerSummary){
            cols.push(providerColumn);
            cols.push(taskColumn);
        } else {
            cols.push(taskColumn);
            cols.push(providerColumn);
        }

        if(report.state.showTeamName){
            cols.push({
                sClass:"task_summary_details_team",
                sTitle:"Team",
                fnRender: oDesk.Report.renderField
            });
        }

        cols.push({
          sTitle: "Total Hours",
          fnRender:oDesk.Report.formatHoursField,
          sClass:"numeric total"
        });
        cols.push({
          sTitle: "Total $",
          fnRender:oDesk.Report.formatChargesField,
          sClass:"numeric total"

        });
        return cols;
    };

    oDesk.Report.prototype.getGroupFooter = function(results, group){
          if(group.columnIndex) return;
          var report = this;
          var labelspan = report.state.showTeamName ? 2 : 1;
          return {
              sClass: "footer-row",
              columns: [
                  {
                      sClass: "footer-label",
                      colspan:labelspan,
                      fnRender: function(results, group){
                          if(report.providerSummary){
                              return "Total for " + group.value + ":";
                          } else {
                              return "Total:";
                          }
                      }
                  },
                  {
                      sClass: "numeric grand-total",
                      fnRender: function(results, group){
                         var total = results.groupTotals[group.value];
                         return report.formatHours(total[labelspan + 1].value, true);
                      }
                  },
                  {
                      sClass: "numeric grand-total",
                      fnRender: function(results, group){
                         var total = results.groupTotals[group.value];
                         return report.formatCharges(total[labelspan + 2].value, true);
                      }
                  }
              ]
          };
    };

    oDesk.Report.prototype.footerSpec = function(){
          var report = this;
          var labelspan = report.state.showTeamName ? 3 : 2;
          var footerRows = [];
          footerRows.push({
                sClass: "footer-label",
                colspan: labelspan,
                fnRender: function(results, col){
                    return report.providerSummary ? "Total for all users:" : "Total for all tasks:";
                }
          });
          footerRows.push(
              {
                  fnRender: function(results, col){
                      return report.formatHours(results.columnTotals[labelspan].value, true);
                  },
                  sClass: "numeric grand-total"
              }
           );
           footerRows.push(
              {
                  fnRender: function(results, col){
                      return report.formatCharges(results.columnTotals[labelspan + 1].value, true);
                  },
                  sClass: "numeric grand-total"
              }
           );
           return footerRows;
      };

    oDesk.Report.prototype.transformData = function(results){
        var report = this;
        var taskColumn = {name:"task", type:"string", valueFunctions:{
            value: function(record){return record.taskDescription.value;},
            code: function(record){return record.task.value;},
            url: function(record){return record.taskUrl? record.taskUrl.value : null;}
        }};
        var providerColumn = {name:"provider", type:"string", valueFunctions:{value: function(record){return record.provider_name.value;}}};
        var columns = [];
        if (report.providerSummary){
            columns.push(providerColumn);
            columns.push(taskColumn);
        } else {
            columns.push(taskColumn);
            columns.push(providerColumn);
        }
        report.state.showTeamName = (report.state.team.id == 0);
        if(report.state.showTeamName){
            columns.push({
                name: "team",
                type: "string",
                valueFunctions: {
                    value: function(record){return record.team_name.value;},
                    id: function(record){return record.team_id.value;}
                }
            });
        }
        columns.push(
            {name:"hours", type:"number", valueFunctions:{value: function(record){return record.hours.value;}}},
            {name:"charges", type:"number", valueFunctions:{value: function(record){return record.charges.value;}}}
        );
        results.createRows({columns: columns});
        results.calculateGroupTotals(0);
        results.calculateColumnTotals();
        return results;
    };
})(jQuery);