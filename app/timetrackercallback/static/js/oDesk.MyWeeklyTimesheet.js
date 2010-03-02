(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var report = this;
        var cols = [];
        var title = "Buyer";
        var className = "buyer details";
        title += '<span class="help" style="display:none">Click on the buyer name to view timesheet details.</span>';
        cols.push({
            sTitle: title,
            sClass: className,
            canGroup: report.state.showAgencyName,
            groupValue: function(field){return field.value;},
            fnRender: function(data){
                var field = data.aData[data.iDataColumn];
                var url = "timesheet_details.html";
                var params = {
                    startDate: report.state.timeline.startDate.toString("yyyy-MM-dd"),
                    endDate: report.state.timeline.endDate.toString("yyyy-MM-dd"),
                    provider: report.state.provider.id,
                    company_ref: report.state.company.reference,
                    team:  field.teamId,
                    go:"go"
                };
                return oDesk.Report.renderUrl(field.value, url, params);
            }
        });

        if (report.state.showAgencyName){
            cols.push({
                sTitle: "Provider Company",
                fnRender: oDesk.Report.renderField
            });
        }
        var helpSpan = '<span  class="help" style="display:none">Click on the hours to view the corresponding work diary.</span>';
        $.each(oDeskUtil.dayNames, function(i, day){
            var className = i ? "numeric hours" : "numeric hours diary";
            cols.push({
               sTitle: i ? day : day + helpSpan,
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
                colspan:  report.state.showAgencyName ? 2 : 1,
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
        report.state.showAgencyName = false;

        var labels = [{
             name: "buyer",
             labelFunction: function(record){return record.team_name.value;},
             labelValues: {
                 teamId: function(record){return record.team_id.value;}
             }
        }];

        var agencies = results.getUniqueRecordValues("agency_name");
        if (agencies.length > 1){
            labels.push({
                name: "agency",
                labelFunction: function(record){return record.agency_name.value;}
            });
            report.state.showAgencyName = true;
        }

        results.pivotWeekDays({
             labels: labels,
             values: {
                 value: function(record){return record.hours.value;},
                 earnings: function(record){return record.earnings.value;},
                 teamId: function(record){return record.team_id.value;},
                 date: function(record){return record.worked_on.value;},
             }
        });


        results.addTotalColumn("hours", {value:function(f){return f.dataType == "number"? f.value || 0 : 0;}});
        results.addTotalColumn("earnings", {value:function(f){return f.dataType == "number"? f.earnings || 0 : 0;}});

        results.calculateColumnTotals();

        return results;
    };
})(jQuery);