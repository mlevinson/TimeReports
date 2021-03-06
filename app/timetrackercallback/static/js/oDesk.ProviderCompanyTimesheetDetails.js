(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var report = this;
        var cols = [];

        function getWorkDiaryUrl(field, text){
            if(!report.state.hasWorkDiaryAccess) return text;
            var url = "http://www.odesk.com/workdiary/{team}/{provider}/{date}";
            url = oDeskUtil.substitute(url, {
                    team: escape(field.team),
                    provider: escape(report.state.provider.id),
                    date: escape(field.value.toString("yyyyMMdd"))
                });
            return '<a href="' + url + '">' + text + '</a>';
        };

        cols.push({
            sClass: report.state.showTeamName ? "timesheet_details_day" : "timesheet_details_day details",
            sTitle: report.state.showTeamName ? 'Date' : 'Date<span class="help" style="display:none">Click on the date to view the work diary.</span>',
            canGroup: true,
            groupValue: function(field){
              return field.value.toString("yyyymmdd");
            },
            fnRender: function(data){
                var field = data.aData[data.iDataColumn];
                var text = field.value.toString("ddd, MMM d yyyy");
                return report.state.showTeamName ? text :  getWorkDiaryUrl(field, text);
            }
        });
        if(report.state.showTeamName){
            cols.push({
                sClass:"timesheet_details_team details",
                canGroup: true,
                groupValue: function(field){
                  return field.value;
                },
                sTitle: 'Team<span class="help" style="display:none">Click on the team name to view the work diary.</span>',
                fnRender: function(data){
                    var field = data.aData[data.iDataColumn];
                    var dateField = data.aData[0];
                    return getWorkDiaryUrl(dateField, field.value || "No name");
                }
           });
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
                          return "Total for the week " + group.cell.weekLabel + " of " + group.cell.value.toString("yyyy:");
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
        if(previousRecord){
            previousRecord.worked_on.lastDayInWeek = true;
        }
        var columns = [{
                            name:"date",
                            type:"string",
                            valueFunctions:{
                                value: function(record){return record.worked_on.value;},
                                team: function(record){return record.team_id? record.team_id.value : report.state.team.id;},
                                lastDayInWeek: function(record){return record.worked_on.lastDayInWeek;},
                                firstDayInWeek: function(record){return record.worked_on.firstDayInWeek;},
                                weekNumber: function(record){return record.worked_on.weekNumber;},
                                weekLabel: function(record){return record.worked_on.weekLabel;}
                            }
                      }];
        report.state.showTeamName = false;
        if(report.state.showTeamName){
            columns.push({
                name: "team",
                type: "string",
                valueFunctions: {
                    value: function(record){return record.team_name? record.team_name.value : report.state.team.name;},
                    id: function(record){return record.team_id? record.team_id.value : report.state.team.id;}
                }
            });
        }
        columns.push(
            {name:"memo", type:"string", valueFunctions:{value: function(record){return record.memo.value;}}},
            {name:"hours", type:"number", valueFunctions:{value: function(record){return record.hours.value;}}},
            {name:"charges", type:"number", valueFunctions:{value: function(record){return record.charges? record.charges.value : record.earnings.value;}}}
        );
        results.createRows({columns: columns});

        results.calculateTotalsForCustomGroups(function(row){
            return row[0].weekNumber;
        });
        return results;
    };
})(jQuery);