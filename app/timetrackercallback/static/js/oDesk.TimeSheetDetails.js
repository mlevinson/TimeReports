(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var report = this;
        var cols = [];
        cols.push({
            sClass: "timesheet_details_day",
            sTitle:"Date",
            canGroup: true,
            groupValue: function(field){
              return field.value.toString("yyyymmdd");
            },
            fnRender: function(data){
                var field = data.aData[data.iDataColumn];
                var text = field.value.toString("ddd, MMM d yyyy");
                var url = "http://www.odesk.com/workdiary/{team}/{provider}/{date}";
                url = oDeskUtil.substitute(url, {
                    team: escape(field.team),
                    provider: escape(report.state.provider.id),
                    date: escape(field.value.toString("yyyyMMdd"))
                });
                return '<a href="' + url + '">' + text + '</a>';
            }
        });
        if(report.state.showTeamName){
            cols.push({
                sClass:"timesheet_details_team",
                canGroup: true,
                groupValue: function(field){
                  return field.value;
                },
                sTitle:"Team",
                fnRender: oDesk.Report.renderField});
        }
        cols.push({
            sClass:"timesheet_details_memo",
            sTitle:"Memo",
            fnRender: function(data){
                 var field = data.aData[data.iDataColumn];
                 var text = $('<div/>').text(field.value).html();
                 return "<pre>" + text + "</pre>";
        }});
        cols.push({
          sTitle: "Hours",
          fnRender:oDesk.Report.formatHoursField,
          sClass:"numeric total"
        });
        cols.push({
          sTitle: "Charges",
          fnRender:oDesk.Report.formatChargesField,
          sClass:"numeric total"

        });
        return cols;
    };

    oDesk.Report.prototype.getGroupFooter = function(results, group){
        if(group.columnIndex) return null;
        var worked_on_field = results.rows[group.startRowIndex + group.numberOfRows - 1][0];
        if(!worked_on_field.lastDayInWeek) return null;
        var report = this;
        var labelspan = report.state.showTeamName ? 3 : 2;
        return {
              sClass: "footer-row",
              fullRow: true,
              columns: [
                  {   sClass: "footer-label",
                      colspan: labelspan,
                      fnRender: function(results, group){
                          return "Total for week " + group.cell.weekLabel + ":";
                      }
                  },
                  {
                      sClass: "numeric grand-total",
                      fnRender: function(results, group){
                         var total = results.groupTotals[group.cell.weekNumber];
                         return report.formatHours(total[labelspan].value, true);
                      }
                  },
                  {
                      sClass: "numeric grand-total",
                      fnRender: function(results, group){
                         var total = results.groupTotals[group.cell.weekNumber];
                         return report.formatCharges(total[labelspan + 1].value, true);
                      }
                  }
              ]
          };
    };

    oDesk.Report.prototype.transformData = function(results){
        var report = this;
        var weeks =  oDeskUtil.getWeeks(report.state.timeline.startDate, report.state.timeline.endDate);
        if(!weeks.endDates.length) return;
        var previousRecord = null, currentWeek = 0, currentWeekEndDate = weeks.endDates[0];
        $.each(results.records, function(i, record){
            record.worked_on.lastDayInWeek = false;
            if(record.worked_on.value > currentWeekEndDate){
                if(previousRecord){
                    previousRecord.worked_on.lastDayInWeek = true;
                }
                record.firstDayInWeek = true;
                currentWeek ++;
                currentWeekEndDate = weeks.endDates[currentWeek];
            }
            record.worked_on.weekNumber = currentWeek;
            record.worked_on.weekLabel = weeks.labels[currentWeek];
            previousRecord = record;
        });
        previousRecord.worked_on.lastDayInWeek = true;
        var columns = [{
                            name:"date",
                            type:"string",
                            valueFunctions:{
                                value: function(record){return record.worked_on.value;},
                                team: function(record){return record.team_id.value;},
                                lastDayInWeek: function(record){return record.worked_on.lastDayInWeek;},
                                firstDayInWeek: function(record){return record.worked_on.firstDayInWeek;},
                                weekNumber: function(record){return record.worked_on.weekNumber;},
                                weekLabel: function(record){return record.worked_on.weekLabel;}
                            }
                      }];
        var teams = results.getUniqueRecordValues("team_id");
        if(teams.length > 1){
            report.state.showTeamName = true;
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
            {name:"memo", type:"string", valueFunctions:{value: function(record){return record.memo.value;}}},
            {name:"hours", type:"number", valueFunctions:{value: function(record){return record.hours.value;}}},
            {name:"charges", type:"number", valueFunctions:{value: function(record){return record.charges.value;}}}
        );
        results.createRows({columns: columns});

        results.calculateTotalsForCustomGroups(function(row){
            return row[0].weekNumber;
        });
        return results;
    };
})(jQuery);