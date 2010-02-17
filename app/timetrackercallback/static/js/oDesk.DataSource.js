(function($){

    oDesk.DataSource = function(){

        field = function(name, dataType, value){
            this.name = name;
            this.dataType = dataType || "string";
            this.set(value || null);
        };

        field.prototype.clone = function(){
            var cloned = new this.constructor();
            cloned.name = this.name;
            cloned.dataType = this.dataType;
            cloned.value = this.value;
            return cloned;
        }

        field.prototype.set = function(value){
            this.value = value;
        }

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
        }

        dateField.prototype.setString = function(value, format){
            if(!value) {
                this.value = null;
            } else {
                var f = format || dateField.format;
                this.value = Date.fromString(value, f);
            }
        }

        dateField.prototype.dayOfWeek = function(){
            return oDeskUtil.getDayNumber(this.value);
        };


        numberField = function(name, value){
            field.prototype.constructor.call(this, name, "number", value);
        }
        numberField.prototype = new field();
        numberField.prototype.constructor = numberField;
        numberField.prototype.set = function(value){
            this.value = parseFloat(value);
        }
        numberField.prototype.toHours = function(){
            return oDeskUtil.floatToTime(this.value);
        }
        numberField.prototype.toMoney = function(){
            return currencyFromNumber(this.value);
        }

        return {
            Field: field,
            DateField: dateField,
            NumberField: numberField
        };

    }();


})(jQuery);