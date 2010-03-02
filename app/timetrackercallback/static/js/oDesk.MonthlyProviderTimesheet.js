(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var report = this;
        var cols = [];

        function getTimesheetUrl(field, team, text){
            var url = "timesheet_details.html";
            var params = {
                    startDate: field.startDate.toString("yyyy-MM-dd"),
                    endDate: field.endDate.toString("yyyy-MM-dd"),
                    provider: report.state.provider.id,
                    company_ref: report.state.company.reference,
                    team: team,
                    go:"go"
            };
            return oDesk.Report.renderUrl(text, url, params);
        }

        if(report.state.team.id){
            cols.push({
                sTitle: 'Week<span class="help" style="display:none">Click on the week name to view their timesheet details.</span>',
                sClass: "week details",
                fnRender: function(data){
                    var field = data.aData[data.iDataColumn];
                    return getTimesheetUrl(field, report.state.team.id, field.value);
                }
            });
        } else {
            cols.push({
                sTitle: 'Week',
                sClass: 'week',
                canGroup:true,
                groupValue: function(field){
                  return field.value;
                },
                fnRender: oDesk.Report.renderField
            });
        }
        if(!report.state.team.id){
            cols.push({
                sTitle: 'Team<span  class="help" style="display:none">Click on the team name to view timesheet details.</span>',
                sClass: "team details",
                fnRender: function(data){
                     var field = data.aData[data.iDataColumn];
                     var dateField = data.aData[0];
                     return getTimesheetUrl(dateField, field.teamId, field.value);
                }
            });
        }
        function render(data){
            if(report.state.mustGetHours){
                return oDesk.Report.formatHoursField(data);
            } else {
                return oDesk.Report.formatChargesField(data);
            }
        }
        $.each(oDeskUtil.dayNames, function(i, day){
           var className = i ? "numeric" : "numeric diary";
           cols.push({
               sTitle: i ? day : day + '<span  class="help" style="display:none">Click on the values to view the corresponding work diary.</span>',
               fnRender: function(data){
                   var field = data.aData[data.iDataColumn];
                   var text = oDesk.Report.formatHoursField(data);
                   if(text == "") return text;
                   var url = "http://www.odesk.com/workdiary/{team}/{provider}/{date}";
                   url = oDeskUtil.substitute(url, {
                       team: escape(field.teamId),
                       provider: escape(report.state.provider.id),
                       date: escape(field.date.toString("yyyyMMdd"))
                   });
                   return '<a href="' + url + '">' + text + '</a>';
               },
               sClass: className
           });
        });

        cols.push({
          sTitle: "Total",
          fnRender:render,
          sClass:"numeric total"
        });

        return cols;
    };


    oDesk.Report.prototype.footerSpec = function(){
          var report = this;
          var footerRows = [];
          footerRows.push({
                sClass: "footer-label",
                colspan: report.state.team.id? 8 : 9,
                fnRender: function(results, col){
                    var label = "Total ";
                    label += report.state.mustGetHours ? "Hours" : "Charges";
                    label += " for ";
                    label += report.state.provider.name;
                    label += ":";
                    return label;
                }
          });
          footerRows.push(
              {
                  fnRender: function(results, col){
                      var value = report.state.mustGetHours ?
                                    report.formatHours(results.columnTotals[col].value, true) :
                                    report.formatCharges(results.columnTotals[col].value, true);
                      return value;
                  },
                  sClass: "numeric grand-total"
              }
           );
          return footerRows;
      };

    oDesk.Report.prototype.transformData = function(data){
        if(!data) return null;
        var report = this;
        var results = new oDesk.DataSource.ResultSet(data);
        var weeks = oDeskUtil.getWeeks(report.state.timeline.startDate, report.state.timeline.endDate);
        var labels = [{
            name:"week",
            labelFunction: function(record){
                var whichWeek = 0;
                $.each(weeks.startDates, function(weekIndex, weekDate){
                    if (record.worked_on.value < weekDate){
                        whichWeek = weekIndex - 1;
                        return false;
                    }
                });
                record.whichWeek = whichWeek;
                return weeks.labels[whichWeek];
            },
            labelValues: {
                whichWeek: function(record){return record.whichWeek;},
                startDate: function(record){return weeks.startDates[record.whichWeek];},
                endDate: function(record){return weeks.endDates[record.whichWeek];}
            }
        }];


        if(!report.state.team.id){
            labels.push({
                name: "team",
                labelFunction: function(record){
                    return record.team_name.value;
                },
                labelValues: {
                    teamId: function(record){return record.team_id.value;},
                    date: function(record){return record.worked_on.value;}
                }
            });
        }

        results.pivotWeekDays({
            uniques: {week:weeks.labels},
            labels:labels,
            values:{
                value: function(record){return report.state.mustGetHours?record.hours.value :record.charges.value;}
            }
         });


         results.addTotalColumn("hours", {value: function(f){return f.dataType =="number" ? f.value || 0 : 0;}});
         results.calculateColumnTotals();


        return results;
    };
})(jQuery);