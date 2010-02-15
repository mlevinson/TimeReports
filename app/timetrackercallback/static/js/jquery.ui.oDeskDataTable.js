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
         $.each(this.options.columns, function(i, column){
             if(column.bVisible == false) return;
             var th = "<th";
             if(column.sClass){
                 th += " class=\"";
                 th += column.sClass;
                 th += "\"";
             }  
             
             if(column.width){
                 th += " width=\"";
                 th += column.width;
                 th += "\"";
             }
             th += ">";
             th += column.sTitle;
             th += "</th>";
             header += th;
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
         var noRowsHtml = "<tr><td colspan=\"" +
                            this.options.columns.length +
                            "\">No matching records found</td></tr>";
         $(this.options.table).children("tbody").append(noRowsHtml);
     },
     clearData: function(){
        this.createBody();
     },
     triggerError : function(){
         this.clearData();
         this.appendNoRowsTemplate();
         $(this.element[0]).trigger("dataTablePopulated", null);
     },
     getGroupFooterRow: function(results, group){
         var widget = this;
         if ($.isFunction(widget.options.report.getGroupFooter)){
              var groupFooter = widget.options.report.getGroupFooter(results, group);
              if(!groupFooter) return;
              var tr = "<tr";
              if(groupFooter.sClass){
                  tr += " class=\"";
                  tr += groupFooter.sClass;
                  tr += "\"";
              }
              tr += ">";
              $.each(groupFooter.columns, function(c, col){
                  var td = "<td";
                  if(col.sClass){
                     td += " class=\"";
                     td += col.sClass;
                     td += "\"";
                  }

                  td += ">";
                  td += col.fnRender(results, group);
                  td += "</td>";
                  tr += td;
               });
               tr += "</tr>";
               return tr;
         }
         return null;
     },
     addRow: function(rowIndex, row){
         var widget = this;
         if(row == "" || !row.length) return;
         var rowGroupings = [];
         if(widget.options.grouper){
             rowGroupings = widget.options.grouper.getGroupings(rowIndex);
         }
         var columnGroups = {};
         var firstGroupRow = false, lastGroupRow = false, groupRow = false;
         $.each(rowGroupings, function(i, group){
             groupRow = true;
             columnGroups[group.columnIndex] = {
                 grouped: true,
                 groupNow: false,
                 groupDone: false,
                 group: group
             };
             if(group.startRowIndex == rowIndex){
                 $.each(rowGroupings, function(i, group){
                     group.footerRow = widget.getGroupFooterRow(widget.options.results, group);
                     var g = group;
                     while(g && group.footerRow){
                        g.numberOfFooterRows ++;
                        g = g.parent;
                     }
                     firstGroupRow = true;
                 });
                 columnGroups[group.columnIndex].groupNow = true;
             } else if (group.startRowIndex + group.numberOfRows == rowIndex + 1){
                 columnGroups[group.columnIndex].groupDone = true;
                 lastGroupRow = true;
             }
         });
         var rowString = "<tr";

         if (groupRow){
             rowString += " class=\"group_row";
             if(firstGroupRow){
                 rowString += " first_group_row";
             }

             if(lastGroupRow){
                 rowString += " last_group_row";
             }

             rowString += "\"";

         }
         rowString += "></tr>";
         var tr = $(rowString).appendTo(widget.options.table.children("tbody"));
         $.each(widget.options.columns, function(c, col){
              var d = {
                  "aData": row,
                  "iDataColumn": c,
                  "iDataRow": rowIndex
              };

              var columnGroup = columnGroups[c] || {grouped:false, groupNow:false, groupDone: false};

              if(columnGroup.grouped && !columnGroup.groupNow) return;
              if(col.bVisible == false) return;
              var td = "<td";

              var classNames = [];
              if (columnGroup.grouped){
                  classNames.push("group_column");
              }

              if (col.sClass){
                  classNames.push(col.sClass);
              }

              if (classNames.length){
                  td += " class=\"";
                  td += classNames.join(" ");
                  td += "\"";
              }

              if (columnGroup.groupNow){
                  td += " rowSpan=\"";
                  td += columnGroup.group.numberOfFooterRows + columnGroup.group.numberOfRows;
                  td += "\"";
              }

              td += ">";

              if ($.isFunction(col.fnRender)){
                  td += col.fnRender(d);
              } else {
                  td += row[c];
              }
              td += "</td>";

              $(tr).append(td);
          });
          $.each(rowGroupings, function(i, group){
              if(group.startRowIndex + group.numberOfRows == rowIndex + 1){
                $(group.footerRow).appendTo(widget.options.table.children("tbody"));
              }
          });

     },
     addFooterRow: function(results){
          var widget = this;
          var tr = $("<tr></tr>").appendTo(widget.options.table.children("tfoot"));
          widget.options.footerColumns = widget.options.report.footerSpec();
          $.each(widget.options.footerColumns, function(c, col){
               var td = "<td";
               if(col.sClass){
                   td += " class=\"";
                   td += col.sClass;
                   td += "\"";
               }
               td += ">";
               td += col.fnRender(results, c);
               td += "</td>";
               $(tr).append(td);
           });
     },
     processResults: function(results){
         var widget = this;
         widget.options.results = results;
         widget.clearData();
          if (results.rows == "" || results.rows.length == 0){
              widget.appendNoRowsTemplate();
              return;
          }
          if (widget.options.groupRows){
             widget.options.grouper = new widget.columnGrouper();
             widget.options.grouper.defineGroups(results.rows, widget.options.columns);
          }
          $.each(results.rows, function(i, row){
              widget.addRow(i, row);
          });
          if($.isFunction(widget.options.report.footerSpec)){
              widget.addFooterRow(results);
          }
          $(widget.element[0]).trigger("dataTablePopulated", results);
     },
     generateReport: function(){
         var report = this.options.report;
         var table = this.options.table;
         var service = this.options.service;
         var widget = this;
         if(!report || !service){
            widget.triggerError();
            return;
         }
         if(!this.options.table){
             this.createTable();
             this.createHeader();
         }
         service(report, function(data, status){
             var results = report.transformData(data);
             widget.processResults(results);
         }, function(error, status){
             widget.triggerError();
         });
     },

    columnGrouper: function(){

      var groupings = {};
      var currentGroup = null;

      function currentColumnGroup(columnIndex){
          var group = this.currentGroup;
          while(group){
              if (group.columnIndex == columnIndex) break;
              group = group.parent;
          }
          return group;
      };

      function getGroupings(rowIndex){
          var groups = [];
          $.each(this.groupings, function(r, grouping){
              if(r > rowIndex) return;
              $.each(grouping, function(i, group){
                  if (group.startRowIndex <= rowIndex &&
                      group.startRowIndex + group.numberOfRows > rowIndex){
                          groups.push(group);
                      }
              });
          });
          return groups;
      }

      function beginGroup(columnIndex, rowIndex, value){
          var group = this.currentColumnGroup(columnIndex);
          if(group && group.value == value) return;
          else if (group && group.value != value){
            this.endGroup(group);
          }

          group = new this.columnGroup(columnIndex, rowIndex, value);
          if(this.currentGroup){
              group.parent = this.currentGroup;
              this.currentGroup.children.push(group);
          } else {
              this.currentGroup = group;
          }

          var currentRowGroupings = this.groupings[rowIndex];
          if (!currentRowGroupings){
              currentRowGroupings = [];
              this.groupings[rowIndex] = currentRowGroupings;
          }
          currentRowGroupings.push(group);
          return group;
      };

      function endAll(lastRowIndex){
          while(this.currentGroup){
              this.endGroup(this.currentGroup, lastRowIndex);
          }
      };

      function endGroup(group, rowIndex){
          $.each(group.children, function(i, child){
             this.endGroup(child, rowIndex);
          });
          group.numberOfRows = rowIndex - group.startRowIndex + 1;
          if (this.currentGroup == group){
              this.currentGroup = group.parent;
          }
      };

      function defineGroups(rows, columns){
          var grouper = this;
          var previousRow = null;
          $.each(rows, function(r, row){
              if(!previousRow) {
                   previousRow = row;
                   return;
              }
              $.each(columns, function(c, col){
                 if(!col.canGroup) return;
                 var value = row[c];
                 var group = grouper.currentColumnGroup(c);
                 if(group && group.value != value){
                     grouper.endGroup(group, r - 1);
                 } else if (!group && previousRow[c] == value){
                     grouper.beginGroup(c, r - 1, value);
                 }
              });
              previousRow = row;
          });
          grouper.endAll(rows.length - 1);

      };

      function columnGroup(columnIndex, rowIndex, value){
          this.columnIndex = columnIndex;
          this.startRowIndex = rowIndex;
          this.numberOfRows = 0;
          this.value = value;
          this.children = [];
          this.parent = null;
          this.numberOfFooterRows = 0;
      };

      return {
          defineGroups: defineGroups,
          beginGroup: beginGroup,
          endGroup: endGroup,
          currentColumnGroup: currentColumnGroup,
          columnGroup: columnGroup,
          groupings: groupings,
          getGroupings: getGroupings,
          endAll: endAll

      };
    }

});


$.extend($.ui.oDeskDataTable, {
   defaults: {
       report: null,
       service: null,
       groupRows: false

   }
 });
})(jQuery);