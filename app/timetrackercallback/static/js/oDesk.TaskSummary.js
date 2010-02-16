(function($){
    oDesk.Report.prototype.columnSpec = function(){
        var report = this;
        var cols = [];
        cols.push({
            sTitle:"Task", 
            width:"360px",
            fnRender: function(data){
              var record = data.aData[data.iDataColumn]; 
              if (record.taskUrl && record.taskUrl != ""){
                  return '<a href="' + record.taskUrl + '">' + record.taskDescription + '</a>';                  
              } else {
                  return record.taskDescription;
              }

            }
        });
        cols.push({sTitle:"User", width:"218px"});
        cols.push({
          sTitle: "Total Hours",
          fnRender:report.dtFormatHours,
          sClass:"numeric total",
          width:"90px"
        });
        cols.push({
          sTitle: "Total $",
          fnRender:report.dtFormatCharges,
          sClass:"numeric total",
          width:"90px"

        });
        return cols;
    };
     
    oDesk.Report.prototype.transformData = function(records){
          var rows = [];
          var totals = {};
          var grandTotalHours = 0;
          var grandTotalCharges = 0;
          var currentTotalHours = 0;
          var currentTotalCharges = 0;
          var currentTask = null;
          
          
          function taskDone(){
              if(currentTask != null){
                  totals[currentTask] = {hours:currentTotalHours, charges:currentTotalCharges};
                  grandTotalHours += currentTotalHours;
                  grandTotalCharges += currentTotalCharges;
              }
          }
          
          $.each(records, function(i, record){
              if(currentTask != record.taskDescription){
                  taskDone();
                  currentTask = record.taskDescription;
                  currentTotalCharges =  currentTotalHours = 0;
              }
              rows.push([record, record.provider.name, record.hours, record.charges]);
              currentTotalHours += record.hours;
              currentTotalCharges += record.charges;
          });                                       
          taskDone();
          return {
              rows: rows,
              totals: totals,
              grandTotalCharges: grandTotalCharges,
              grandTotalHours: grandTotalHours
          };
    };
})(jQuery);