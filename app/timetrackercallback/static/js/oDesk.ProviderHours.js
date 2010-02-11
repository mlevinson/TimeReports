(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var cols = [{"sTitle":"Buyer"}];  
        var report = this;
        $.each(Date.CultureInfo.abbreviatedDayNames, function(i, day){
           cols.push({
               "sTitle": day,     
               "fnRender": report.dtFormatHours,           
               "sClass": "numeric"
           }); 
        });
        cols.push({          
          "sTitle": "Total Hours",                
          "fnRender":report.dtFormatHours,
          "sClass":"numeric total"
        });
        return cols;  
    };

    oDesk.Report.prototype.transformData = function(data){
          if(!data) return null;     
          var grandTotalHours = 0, dayTotals = [0, 0, 0, 0, 0, 0, 0];
          var records = oDesk.DataSource.read(data);
          var rowRecords = oDesk.Report.pivotWeekDays(records, {
                      "pivotFunction": function(record){return record.team_name.value;},
                      "valueFunction": function(record){return record.hours.value;},                      
                      "dateField": "worked_on",
                      "row_aggregates": ["value"],
                      "column_aggregates": ["value"]
                  }); 
                  
                  
          // Totals        
          
          var rows = $.map(rowRecords, function(rowRecord){
               var rowTotalHours = 0;
               var row = $.map(rowRecord, function(col, i){
                  if(i == 0)  return col;
                  var total = 0;
                  $.each(col, function(i, record){
                     total += record.hours.value; 
                     dayTotals[];
                  });    
                  rowTotalHours += total;
                  grandTotalHours += total;   
                  return 
               });
          });
          
          
          var rows = [], records = [], buyers = []; 
          if(data.table){
              var reco = oDesk.DataSource.read(data);
              
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
                  rows.push([buyerName, 0, 0, 0, 0, 0, 0, 0, 0]);
              });

              $.each(records, function(i, record){
                   var buyerName = record.buyerCompany.name;   
                   var row = rows[$.inArray(buyerName, buyers)];   
                   var recordWeekDay = record.recordDayOfWeek();
                   var currentVal = parseFloat(row[recordWeekDay + 1]);    
                   row[recordWeekDay + 1] = currentVal + record.hours;
                   dayTotals[recordWeekDay] += record.hours;
                   row[8] += record.hours;
                   grandTotalHours +=  record.hours;                  
              });
          } 
          return {
                "rows": rows,
                "grandTotalHours": grandTotalHours,
                "dayTotals": dayTotals
          };
    };    
})(jQuery);