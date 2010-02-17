(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var report = this;
        var cols = [];
        if (report.state.buyer){
            cols.push({sTitle:"Provider", width:"218px"});
        } else {
            cols.push({sTitle:"Buyer", width:"218px"});
        }
        $.each(oDeskUtil.dayNames, function(i, day){
           cols.push({
               sTitle: day,
               fnRender: report.dtFormatHours,
               sClass: "numeric",
               width: "56px"
           });
        });
         cols.push({
              sTitle: "Total Hours",
              fnRender:report.dtFormatHours,
              sClass:"numeric total",
              width: "90px"
            });
        cols.push({
          sTitle: "Total $",
          fnRender:report.dtFormatCharges,
          sClass:"numeric total",
          width: "90px"
        });
        return cols;
    };

    oDesk.Report.prototype.footerSpec = function(){
          var report = this;
          function dayTotalRenderer(results, col){
                return report.formatHours(results.dayTotals[col-1]);
          }

          var footerRows = [];
          footerRows.push({
                fnRender: function(results, col){
                    if (results.buyer){
                        return "Total for " + results.buyer.name + ":";
                    }  else {
                        return "Total:";
                    }

                }
          });
          for(d = 0; d < 7; d++) {
             footerRows.push({
                 fnRender: dayTotalRenderer,
                 sClass: "numeric total"
             });
          }

          footerRows.push(
              {
                  fnRender: function(results, col){
                      return report.formatHours(results.grandTotalHours, true);
                  },
                  sClass: "numeric grand-total"
              }
           );
           footerRows.push(
              {
                  fnRender: function(results, col){
                      return report.formatCharges(results.grandTotalCharges, true);
                  },
                  sClass: "numeric grand-total"
              }
           );
           return footerRows;
      };

    oDesk.Report.prototype.transformSummary = function(data){
        if(!data) return null;
          var grandTotalHours = 0, grandTotalCharges = 0, dayTotals = [0, 0, 0, 0, 0, 0, 0];
          var rows = [], records = [], buyers = [];
          if(data.table){
              $.each(data.table.rows, function(i, record){
                  if(record=="") return false;
                  var oDeskRecord = new oDesk.ProviderHoursRecord(record);
                  records.push(oDeskRecord);
                  var buyerName = oDeskRecord.buyerCompany.name;
                  if($.inArray(buyerName, buyers) == -1){
                      buyers.push(buyerName);
                  }
              });
              buyers.sort();
              $.each(buyers, function(i, buyerName){
                  rows.push([buyerName, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
              });

              $.each(records, function(i, record){
                   var buyerName = record.buyerCompany.name;
                   var row = rows[$.inArray(buyerName, buyers)];
                   var recordWeekDay = record.recordDayOfWeek();
                   var currentVal = parseFloat(row[recordWeekDay + 1]);
                   row[recordWeekDay + 1] = currentVal + record.hours;
                   dayTotals[recordWeekDay] += record.hours;
                   row[8] += record.hours;
                   row[9] += record.charges;
                   grandTotalHours +=  record.hours;
                   grandTotalCharges +=  record.charges;
              });
          }
          return {
                "rows": rows,
                "grandTotalHours": grandTotalHours,
                "grandTotalCharges": grandTotalCharges,
                "dayTotals": dayTotals
          };
    }

    oDesk.Report.prototype.transformBuyer = function(data){
         if(!data) return null;
          var grandTotalHours = 0, grandTotalCharges = 0, dayTotals = [0, 0, 0, 0, 0, 0, 0];
          var rows = [], records = [], providers = [];
          if(data.table){
              $.each(data.table.rows, function(i, record){
                  if(record=="") return false;
                  var oDeskRecord = new oDesk.ProviderHoursRecord(record);
                  records.push(oDeskRecord);
                  var providerName = oDeskRecord.provider.name;
                  if($.inArray(providerName, providers) == -1){
                      providers.push(providerName);
                  }
              });
              providers.sort();
              $.each(providers, function(i, providerName){
                  rows.push([providerName, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
              });

              $.each(records, function(i, record){
                   var providerName = record.provider.name;
                   var row = rows[$.inArray(providerName, providers)];
                   var recordWeekDay = record.recordDayOfWeek();
                   var currentVal = parseFloat(row[recordWeekDay + 1]);
                   row[recordWeekDay + 1] = currentVal + record.hours;
                   dayTotals[recordWeekDay] += record.hours;
                   row[8] += record.hours;
                   row[9] += record.charges;
                   grandTotalHours +=  record.hours;
                   grandTotalCharges +=  record.charges;
              });
          }
          return {
                "rows": rows,
                "buyer": this.state.buyer,
                "grandTotalHours": grandTotalHours,
                "grandTotalCharges": grandTotalCharges,
                "dayTotals": dayTotals
          };
    }


    oDesk.Report.prototype.transformData = function(data){
          if (this.state.buyer) {
              return this.transformBuyer(data);
          }else {
              return this.transformSummary(data);
          }

    };
})(jQuery);