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
            this.groupTotals = {};
        };

        resultset.prototype.getUniqueRecordValues = function(columnName){
            var uniqueList = [];
            $.each(this.records, function(i, record){
             var f = null;
             if($.isFunction(columnName)){
                 f = columnName(record);
             } else if (record[columnName] == undefined){
                 return [];
             }
             else {
                 f = record[columnName].value;
             }
             if($.inArray(f, uniqueList) == -1){
                uniqueList.push(f);
             }
            });
            uniqueList.sort();
            return uniqueList;
        };



        resultset.prototype.getUniqueRowValues = function(columnIndex){
            var uniqueList = [];
            $.each(this.rows, function(i, row){
                var value;
                if($.isFunction(columnIndex)){
                    value = columnIndex(row);
                } else {
                    if(columnIndex >= row.length) return [];
                    value = row[columnIndex].value;
                }
                if($.inArray(value, uniqueList) == -1){
                    uniqueList.push(value);
                }
            });
            uniqueList.sort();
            return uniqueList;
        };

        resultset.prototype.createRows = function(s){
           var results = this;
           $.each(this.records, function(r, record){
               var row = [];
               $.each(s.columns, function(i, column){
                   var f = constructField(column.name, column.type);
                   $.each(column.valueFunctions, function(valueName, valueFunction){
                       f[valueName] = valueFunction(record);
                   });
                   row.push(f);
               });
               results.rows.push(row);
           });
        };

        resultset.prototype.pivotWeekDays = function(s){
            var resultset = this;
            var defaults = {
                uniques: {},
                labels:null,
                values:null,
                dateField:"worked_on"
            };

            var spec = $.extend({}, defaults, s);
            var uniques = spec.uniques;
            var labelToRowMap = {};
            resultset.rows = [];
            var totalRows = 0;

            // Get Unique Values for every label column
            //
            $.each(spec.labels, function(i, labelSpec){
               if(!uniques[labelSpec.name]) {
                   uniques[labelSpec.name] = resultset.getUniqueRecordValues(labelSpec.labelFunction);
               }
               if(!totalRows){
                   totalRows = uniques[labelSpec.name].length;
               } else {
                   totalRows *= uniques[labelSpec.name].length;
               }

            });

            // Add empty rows
            for(rowIndex = 0; rowIndex < totalRows; rowIndex++){
                 resultset.rows.push([]);
            }

            // Populate Labels
            var repeatCount = 1;
             $.each(spec.labels, function(specIndex, labelSpec){
                 var rowIndex = 0;
                 var labelNames = uniques[labelSpec.name];
                 repeatCount *= labelNames.length;
                 var repeatFactor = totalRows/repeatCount;
                 var labelIndex = -1;
                 var repeats = 0;
                 var f;
                 for(rowIndex = 0; rowIndex < totalRows; rowIndex++){
                    if(repeats == 0){
                        labelIndex ++;
                        if(labelIndex >= labelNames.length) labelIndex = 0;
                        f = constructField(labelSpec.name, "string");
                        f.set(labelNames[labelIndex]);
                        repeats = repeatFactor;
                    }
                    resultset.rows[rowIndex].push(f.clone());
                    repeats --;
                 }
             });

            // Add Zero values for all week day columns
            for(rowIndex = 0; rowIndex < totalRows; rowIndex++){
               var row = resultset.rows[rowIndex];
               var label = "";
               for (c = 0; c < spec.labels.length; c++){
                   label += row[c].value;
                }
                labelToRowMap[label] = row;
                for (c = 0; c < 7; c++){
                   var f = constructField("value", "number");
                    f.set(0);
                    $.each(spec.values, function(valueName, valueFunction){
                       f[valueName] = 0;
                    });
                    row.push(f);
                }
            }

            // Populate values, aggregate if needed
            //


            $.each(this.records, function(i, record){
                var labelCombo = "";
                $.each(spec.labels, function(specIndex, labelSpec){
                    labelCombo += labelSpec.labelFunction(record);
                });
                var row = labelToRowMap[labelCombo];
                $.each(spec.labels, function(specIndex, labelSpec){
                    if(labelSpec.labelValues){
                        $.each(labelSpec.labelValues, function(valueName, valueFunction){
                           row[specIndex][valueName] = valueFunction(record);
                        });
                    }
                });
                var weekDay = record[spec.dateField].dayOfWeek();
                var field = row[weekDay + spec.labels.length];
                $.each(spec.values, function(valueName, valueFunction){
                    var value = valueFunction(record);
                    if(typeof(value) == "number"){
                        field[valueName] += value;
                    } else {
                        field[valueName] = value;
                    }

                });
            });
            var labelCount = spec.labels.length;

            resultset.rows = $.map(resultset.rows, function(row){
                var allZero = true;
                for (var i = 0; i < 7; i++){
                    if(row[i + labelCount].value) {
                        allZero = false;
                        break;
                    }
                };
                return allZero? null : [row];
            });
        };

        resultset.prototype.addTotalColumn = function(name, valueSpec){
            if(!this.rows || !this.rows.length) return;
            var results = this;
            $.each(this.rows, function(rowIndex, row){
                var f = constructField(name, "number");
                f.set(0);
                $.each(valueSpec, function(valueName, valueFunction){
                    var total = 0;
                    $.each(row, function(colIndex, field){
                        total += valueFunction(field);
                    });
                   f[valueName] = total;
                });
               row.push(f);
            });
        };

        resultset.prototype.getColumnTotals = function(rowFilter){
            if(!this.rows || !this.rows.length) return [];
            var results = this;
            columnTotals = [];
            var totalColumns = this.rows[0].length;
            for(col = 0; col < totalColumns; col ++){
                var f = constructField("columnTotal", "number");
                f.set(0);
                columnTotals.push(f);
                if(results.rows[0][col].dataType != "number") continue;
                $.each(results.rows, function(rowIndex, row){
                     if(!rowFilter || rowFilter(row, row[col])){
                         f.value += row[col].value;
                     }
                });
            }
            return columnTotals;
        };

        resultset.prototype.calculateColumnTotals = function(){
            this.columnTotals = this.getColumnTotals();
        };

        resultset.prototype.calculateTotalsForCustomGroups = function(groupFunction){
               var results = this;
               var uniqueGroupValues = results.getUniqueRowValues(groupFunction);
               $.each(uniqueGroupValues, function(groupIndex, group){
                   results.groupTotals[group] = results.getColumnTotals(function(row){
                       return (groupFunction(row) == group);
                   });
               });
           };

        resultset.prototype.calculateGroupTotals = function(columnIndex){
            var results = this;
            var uniqueGroupValues = results.getUniqueRowValues(columnIndex);
            $.each(uniqueGroupValues, function(groupIndex, group){
                results.groupTotals[group] = results.getColumnTotals(function(row){
                    return (row[columnIndex].value == group);
                });
            });
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