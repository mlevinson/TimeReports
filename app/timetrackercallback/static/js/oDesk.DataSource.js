(function($){

    oDesk.DataSource = function(){
        field = function(name, dataType, value){
            this.name = name;
            this.label = name;
            this.dataType = dataType || "string";
            this.set(value || null);
        };

        field.prototype.clone = function(){
            var cloned = new this.constructor();
            cloned.name = this.name;
            cloned.dataType = this.dataType;
            cloned.value = this.value;
            cloned.label = this.label;
            return cloned;
        };

        field.prototype.set = function(value){
            this.value = value;
        };

        dateField = function(name, value){
            field.prototype.constructor.call(this, name, "date", value);
        };
        dateField.prototype = new field();
        dateField.prototype.constructor = dateField;
        dateField.format = "yyyymmdd";
        dateField.prototype.set = function(value){
            if(typeof(value) == 'string'){
                this.setString(value);
            } else{
                this.value = value;
            }
        };

        dateField.prototype.setString = function(value, format){
            if(!value) {
                this.value = null;
            } else {
                var f = format || dateField.format;
                this.value = Date.fromString(value, f);
            }
        };

        dateField.prototype.dayOfWeek = function(){
            return oDeskUtil.getDayNumber(this.value);
        };


        numberField = function(name, value){
            field.prototype.constructor.call(this, name, "number", value);
        };
        numberField.prototype = new field();
        numberField.prototype.constructor = numberField;
        numberField.prototype.set = function(value){
            this.value = parseFloat(value);
        };
        numberField.prototype.toHours = function(){
            return oDeskUtil.floatToTime(this.value);
        };
        numberField.prototype.toMoney = function(){
            return currencyFromNumber(this.value);
        };

        query = function(params){
            this.params = params;
            this.urlTemplate = null;
            this.urlFragments = [];
            this.selectStatement = null;
            this.conditions = [];
            this.orderStatement = null;

        };

        query.prototype.setUrlTemplate = function(urlTemplate){
            this.urlTemplate = urlTemplate;
        };

        query.prototype.addUrlFragment = function(fragment){
            this.urlFragments.push(fragment);
        };

        query.prototype.addSelectStatement = function(names){
            if(!names || !names.length) return;
            this.selectStatement = "SELECT ";
            this.selectStatement += names.join(",");
        };

        query.prototype.addCondition = function(operator, name, value){
            this.conditions.push(name + " " + operator + " '" + value + "'");
        };

        query.prototype.addSortStatement = function(names){
            this.orderStatement = " ORDER BY ";
            this.orderStatement += names.join(",");
        };

        query.prototype.toString = function(){
            var params = {};
            $.each(this.params, function(key, value){
                   params[key] = escape(value);
                });
            var url = oDeskUtil.substitute(this.urlTemplate, params);
            $.each(this.urlFragments, function(i, fragmentTemplate){
               var fragment = oDeskUtil.substitute(fragmentTemplate, params);
               if(fragment.indexOf("{") == -1){
                   url += fragment;
               }
            });
            if(this.selectStatement){
                var tq = this.selectStatement;
                var conditions = [];
                $.each(this.conditions, function(i, condition){
                    var condition = oDeskUtil.substitute(condition, params);
                    if(condition.indexOf("{") == -1){
                       conditions.push(condition);
                    }
                });
                if(conditions.length){
                    tq += " WHERE ";
                    tq += conditions.join(" AND ");
                }
                if(this.orderStatement){
                    tq += this.orderStatement;
                }
                url += "?tq=";
                url += escape(tq);
            }
            return url;
        };

        function constructField(name, type){
            var f = field;
            if(type == "number") f = numberField;
            else if(type == "date") f = dateField;
            return new f(name);
        };

        function readStructure(data){
            var fields = [];
            if( !data.table ||
                !data.table.cols ||
                !data.table.cols.length) return fields;
            $.each(data.table.cols, function(i, col){
                fields.push(constructField(col.label, col.type));
            });
            return fields;
        }

        function read(data, fields){
            var datasource = this;
            var records = [];

            if( !data.table ||
                !data.table.cols ||
                !data.table.cols.length ||
                !data.table.rows ||
                data.table.rows == "" ||
                !data.table.rows.length) return records;

            if(!fields){
                fields = readStructure(data);
            }

            $.each(data.table.rows, function(i, row){
                var record = {};
                $.each(row.c, function(colIndex, col){
                    var field = fields[colIndex].clone();
                    record[field.name] = field;
                    field.set(col.v);
                });
                records.push(record);
            });
            return records;
        };

        resultset = function(data){
            this.fields = readStructure(data);
            this.records = read(data, this.fields);
            this.rows = [];
            this.columnTotals = {};
            this.grandTotals = {};
        };

        resultset.prototype.getUniqueValues = function(columnName){
            var uniqueList = [];
            $.each(this.records, function(i, record){
             var f = null;
             if($.isFunction(columnName)){
                 f = columnName(record);
             } else {
                 f = record[columnName].value;
             }
             if($.inArray(f, uniqueList) == -1){
                uniqueList.push(f);
             }
            });
            uniqueList.sort();
            return uniqueList;
        };

        resultset.prototype.pivotWeekDays = function(s){

            var defaults = {
                labelFunction:null,
                valueFunction:null,
                dateField:"worked_on"
            };

            var spec = $.extend({}, defaults, s);
            var l = constructField("label");
            var f = constructField("value", "number");
            f.set(0);
            var uniques = this.getUniqueValues(spec.labelFunction);
            this.rows = [];
            var resultset = this;
            $.each(uniques, function(i, unique){
                var row = [];
                var label = l.clone();
                label.set(unique);
                row.push(label);
                for ( c = 0; c < 7; c++){
                    row.push(f.clone());
                }
                resultset.rows.push(row);
            });


            $.each(this.records, function(i, record){
                var label = spec.labelFunction(record);
                var row = resultset.rows[$.inArray(label, uniques)];
                var weekDay = record[spec.dateField].dayOfWeek();
                var field = row[weekDay + 1];
                field.value += spec.valueFunction(record);
                field.record = record;
            });
        };

        resultset.prototype.calculateTotals = function(spec){  
            // TODO: Too much complexity - must refactor to make it manageable.
            if(!this.rows || !this.rows.length) return;
            var results = this;
            var totalColumns = this.rows[0].length;
            var totals = [];
            $.each(spec.totals, function(i, totalSpec){
                var f = constructField(totalSpec.name, "number");
                f.label = totalSpec.label;
                f.set(0);
                totals.push(f);
                var columnTotals = [];
                results.columnTotals[totalSpec.name] = columnTotals;
                results.grandTotals[totalSpec.name] = f.clone();
                for(col = 0; col < totalColumns; col ++){
                    columnTotals.push(f.clone());
                }
            });
            var totalCount = totals.length;
            var calculateGroupTotals = false;
            var groupValues = {};
            var groupTotals = {};
            if(spec.groupTotals && spec.groupTotals.length){
                calculateGroupTotals = true;
                $.each(spec.groupTotals, function(i, groupTotalSpec){
                    groupTotals[groupTotalSpec.name] = {};
                    var uniqueGroupValues = results.getUniqueValues(groupTotalSpec.groupFunction);
                    groupValues[groupTotalSpec.name] = uniqueGroupValues;
                    $.each(uniqueGroupValues, function(g, v){
                        groupTotals[groupTotalSpec.name][v] = {};
                        var f = constructField(groupTotalSpec.name, "number");
                        f.set(0);
                        $.each(spec.totals, function(i, totalSpec){
                            var totals = [];
                            for(col = 0; col < totalColumns + totalCount; col ++){
                                totals.push(f.clone());
                            }
                            groupTotals[groupTotalSpec.name][v][totalSpec.name] = totals;
                        });
                    });
                });
            }


            var rowTotals = {};
            $.each(this.rows, function(rowIndex, row){
                $.each(totals, function(ti, tf){
                    var totalField = tf.clone();
                    row.push(totalField);
                    rowTotals[totalField.name] = totalField;
                });
                var colIndex = -1;
                $.each(row, function(j, field){
                    if (field.name == "value") {
                      colIndex ++;
                      if(!field.record) return;
                      $.each(totals, function(totalIndex, totalField){
                          var val = spec.totals[totalIndex].valueFunction(field.record);
                          rowTotals[totalField.name].value += val;
                          results.columnTotals[totalField.name][colIndex].value += val;
                          results.grandTotals[totalField.name].value += val;
                          if(calculateGroupTotals){
                              $.each(spec.groupTotals, function(g, groupTotalSpec){
                                  var groupValue = groupTotalSpec.groupFunction(field.record);
                                  groupTotals[groupTotalSpec.name][groupValue][totalField.name][colIndex].value += val;
                              });
                          }
                      });
                    }
                });
            });

            this.groupTotals = groupTotals;
        };

        return {
            Field: field,
            DateField: dateField,
            NumberField: numberField,
            Query: query,
            read: read,
            constructField: constructField,
            ResultSet: resultset
        };

    }();


})(jQuery);