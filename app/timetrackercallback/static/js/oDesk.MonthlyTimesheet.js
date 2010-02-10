(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var cols = [{"sTitle":"Week"}];  
        var report = this; 
        function render(data){
            if(report.state.mustGetHours){
                return report.dtFormatHours(data);
            } else {
                return report.dtFormatCharges(data);                
            }
        }
        $.each(Date.CultureInfo.abbreviatedDayNames, function(i, day){
           cols.push({
               "sTitle": day,
               "fnRender": render,
               "sClass": "numeric"
           }); 
        });
        
        cols.push({          
          "sTitle": "Total",                
          "fnRender":render,
          "sClass":"numeric total",
        });

        return cols;  
    };

    oDesk.Report.prototype.transformData = function(data){
          if(!data) return null;
          var report = this;     
          var grandTotal = 0; 
          var firstDayOfMonth = report.state.timeline.startDate;
          var firstDayDayNumber = getDayNumber(firstDayOfMonth);    
          var daysInMonth = firstDayOfMonth.getDaysInMonth();
          var monthName = firstDayOfMonth.toString("MMM");
          var weekStartDateNumber = 1;     
          var year = firstDayOfMonth.toString("yyyy");
          var month = firstDayOfMonth.toString("MM");
          var rows = [], weeks = [];
          var weekDays = 6 - firstDayDayNumber;
          var done = false;
          while(!done){   
              var start = monthName + " " + ("00" + weekStartDateNumber).slice(-2);           
              var weekEndDay =  weekStartDateNumber + weekDays;
              weekDays = 6;                       
              if (weekEndDay >= daysInMonth){
                  weekEndDay = daysInMonth;   
                  done = true;
              }
              var end = monthName + " "   + ("00" + weekEndDay).slice(-2);
              weeks.push(year + '' + month + '' + ("00" + weekStartDateNumber).slice(-2));  
              var weekLabel = start;
              if(end != start){
                  weekLabel += " - "  + end;
              } 
              rows.push([weekLabel, 0, 0, 0, 0, 0, 0, 0, 0]);
              weekStartDateNumber = weekEndDay + 1;
          }
          
          if(data.table){
              $.each(data.table.rows, function(i, record){
                  if(record=="") return false;            
                  var oRecord = new oDesk.HoursRecord(record);
                  var whichWeek = 0;
                  $.each(weeks, function(weekIndex, weekFirstDay){
                      var weekDate = Date.parseExact(weekFirstDay, "yyyyMMdd"); 
                      if (oRecord.workDate < weekDate){
                          whichWeek = weekIndex - 1; 
                          return false;
                      }
                  });  
                  var recordWeekDay = oRecord.recordDayOfWeek();                
                  var currentVal = parseFloat(rows[whichWeek][recordWeekDay + 1]);    
                  var value = report.state.mustGetHours?  record.c[3].v : record.c[4].v;
                  rows[whichWeek][recordWeekDay + 1] = currentVal + parseFloat(value);
              });
          }

          $.each(rows, function(i, row){
              row[8] = 0;
              var col = 1;
              for(col=1; col<8; col+=1){  
                  if(row[col] != ''){
                      row[8] += parseFloat(row[col]);                      
                  }   
              }              
              grandTotal += row[8];
          });         
                     

          return {
                "rows": rows,
                "grandTotal": grandTotal
          };
    };    
})(jQuery);