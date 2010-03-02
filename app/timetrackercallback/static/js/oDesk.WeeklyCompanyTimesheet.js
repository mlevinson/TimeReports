(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var cols = [{
            sTitle:'Provider<span class="help" style="display:none">Click on the provider name to view their timesheet details.</span>',
            sClass: "provider details",
            canGroup:true,
            groupValue: function(field){
              return field.value;
            },
            fnRender: function(data){
                var field = data.aData[data.iDataColumn];
                var url = "timesheet_details.html";
                var params = {
                    startDate: report.state.timeline.startDate.toString("yyyy-MM-dd"),
                    endDate: report.state.timeline.endDate.toString("yyyy-MM-dd"),
                    provider: field.providerId,
                    company_ref: report.state.company.reference,
                    go:"go"
                };
                if(report.state.team.id){
                    params.team = report.state.team.id;
                }
                return oDesk.Report.renderUrl(field.value, url, params);
            }
            }];
        var report = this;
        if(!report.state.team.id){
            cols.push({
                sTitle: 'Team<span  class="help" style="display:none">Click on the team name to view timesheet details.</span>',
                sClass: "team details",
                fnRender: function(data){
                     var field = data.aData[data.iDataColumn];
                     var url = "timesheet_details.html";
                     var params = {
                        startDate: report.state.timeline.startDate.toString("yyyy-MM-dd"),
                        endDate: report.state.timeline.endDate.toString("yyyy-MM-dd"),
                        provider: field.providerId,
                        company_ref: report.state.company.reference,
                        team: field.teamId,
                        go:"go"
                     };
                     return oDesk.Report.renderUrl(field.value, url, params);
                }
            });
        }
        $.each(oDeskUtil.dayNames, function(i, day){
           var className = i ? "numeric hours" : "numeric hours diary";
           cols.push({
               sTitle: i ? day : day + '<span  class="help" style="display:none">Click on the hours to view the corresponding work diary.</span>',
               fnRender: function(data){
                   var field = data.aData[data.iDataColumn];
                   var text = oDesk.Report.formatHoursField(data);
                   if(text == "") return text;
                   var url = "http://www.odesk.com/workdiary/{team}/{provider}/{date}";
                   url = oDeskUtil.substitute(url, {
                       team: escape(field.teamId),
                       provider: escape(field.providerId),
                       date: escape(field.date.toString("yyyyMMdd"))
                   });
                   return '<a href="' + url + '">' + text + '</a>';
               },
               sClass: className
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
                colspan: report.state.team.id? 1 : 2,
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
          var report = this;
          var results = new oDesk.DataSource.ResultSet(data);
          var labels = [
                {
                    name: "provider",
                    labelFunction: function(record){
                        return record.provider_name.value;
                    },
                    labelValues: {
                        providerId: function(record){return record.provider_id.value;}
                    }
                }
          ];
          if(!report.state.team.id){
              labels.push({
                  name: "team",
                  labelFunction: function(record){
                      return record.team_name.value;
                  },
                  labelValues: {
                      providerId: function(record){return record.provider_id.value;},
                      teamId: function(record){return record.team_id.value;}
                  }
              });
          }
          results.pivotWeekDays({
              labels: labels,
              values: {
                  value: function(record){return record.hours.value;},
                  charges: function(record){return record.charges.value;},
                  providerId: function(record){return record.provider_id.value;},
                  teamId: function(record){return report.state.team.id? report.state.team.id : record.team_id.value;},
                  date: function(record){return record.worked_on.value;}
              }
          });

          results.addTotalColumn("hours", {value:function(f){return f.dataType == "number"? f.value || 0 : 0;}});
          results.addTotalColumn("charges", {value:function(f){return f.dataType == "number"? f.charges || 0 : 0;}});

          results.calculateColumnTotals();

          return results;
    };
})(jQuery);