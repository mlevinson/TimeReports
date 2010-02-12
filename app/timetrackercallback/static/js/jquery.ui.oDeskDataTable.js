(function($) { 
$.widget("ui.oDeskDataTable",{
     _init: function(){
        this.refresh();
     },
     refresh: function(){
        var el = this.element[0];
        var widget = this;
        this.createTable();
        this.createHeader();    
        this.createBody();
        this.generateReport();
     }, 
     createTable: function(){
         if(this.options.table){
             $(this.options.table).remove();
         }         
         var el = this.element[0];
         this.options.table = $("<table class=\"tabular\"></table>").appendTo(el);         
     },
     createHeader: function(){
         $(this.options.table).children("thead").remove();          
         this.options.columns = this.options.report.columnSpec();
         var header = "<thead><tr>";
         var columnTemplate = '<th class="{sClass}">{sTitle}</th>';
         $.each(this.options.columns, function(i, column){
             if(column.bVisible == false) return;             
             header += oDeskUtil.substitute(columnTemplate, column);
         });
         header += "</tr></thead>";      
         header += "<tfoot></tfoot>";
         $(this.options.table).prepend(header);         
     },                            
     createBody: function(){     
        $(this.options.table).children("tbody").remove();                   
        $(this.options.table).append("<tbody></tbody"); 
     },
     appendNoRowsTemplate: function(){
         var noRowsHtml = "<td colspan=\"" +  
                            this.options.columns.length + 
                            "\">No matching records found</td>"; 
         $(this.options.table).children("tbody").append(noRowsHtml);
     },                                                             
     clearData: function(){
        $(this.options.table).children("tbody tr").remove();
     },
     triggerError : function(){          
         this.clearData();
         this.appendNoRowsTemplate();         
         $(this.element[0]).trigger("dataTablePopulated", null);
     },
     addRow: function(rowIndex, row){   
         var widget = this;  
         if(row == "" || !row.length) return; 
         var tr = $("<tr></tr>").appendTo(widget.options.table.children("tbody"));
         widget.options
         $.each(widget.options.columns, function(c, col){
              var d = {
                  "aData": row,
                  "iDataColumn": c,
                  "iDataRow": rowIndex
              };
              
              if(col.bVisible == false) return;
              var td = "<td class=\"";
              td += col.sClass;
              td += "\">";
              if ($.isFunction(col.fnRender)){
                  td += col.fnRender(d);
              } else {
                  td += row[c];
              }
              td += "</td>";                                     
              
              $(tr).append(td);
          });
     },
     addFooterRow: function(results){
          var widget = this;  
          var tr = $("<tr></tr>").appendTo(widget.options.table.children("tfoot"));
          widget.options.footerColumns = widget.options.report.footerSpec();
          $.each(widget.options.footerColumns, function(c, col){
               var td = "<td class=\"";
               td += col.sClass;
               td += "\">";
               td += col.fnRender(results, c);
               td += "</td>";                                     
               $(tr).append(td);
           }); 
     },
     generateReport: function(){
         var report = this.options.report;
         var table = this.options.table;  
         var service = this.options.service;
         var widget = this; 
         if(!report || !service){
            widget.triggerError();
         }
         if(!this.options.table){
             this.createTable();
             this.createHeader();
         }
         service(report, function(data, status){
             var results = report.transformData(data);
             widget.clearData();
             if (results.rows == "" || results.rows.length == 0){
                 widget.appendNoRowsTemplate();
                 return;
             }         
             $.each(results.rows, function(i, row){
                 widget.addRow(i, row);
             });
             if($.isFunction(widget.options.report.footerSpec)){
                 widget.addFooterRow(results);                 
             }
             $(widget.element[0]).trigger("dataTablePopulated", results);
         }, function(error, status){
             widget.triggerError();
         });
     }

});

$.extend($.ui.oDeskTimeReports, {
   defaults: {
       "report": null,
       "service": null
   }
 });
})(jQuery);