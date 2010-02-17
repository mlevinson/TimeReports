(function($){

    oDesk.DataSource.test = function(){

        function canClone(f, value1, value2){
            var name = "test_field";
            var f = new oDesk.DataSource.Field(name);
            f.set(value1);
            var new_f = f.clone();
            equals(f.name, new_f.name, "names are equal");
            equals(f.dataType, new_f.dataType, "type is good");
            equals(f.value, new_f.value, "value is good");
            new_f.set(value2);
            equals(new_f.value, value2, "new field is good");
            equals(f.value, value1, "first field is good");
        }

        module("Field");

        test("Field with just name", function(){
            var name = "test_field";
            var f = new oDesk.DataSource.Field(name);
            equals(f.name, name, "names are equal");
            equals(f.value, null, "value is null");
            equals(f.dataType, "string", "type is string");
        });

        test("Field with value and data type", function(){
            var name = "test_field";
            var type = "test_type";
            var value = "test_value";
            var f = new oDesk.DataSource.Field(name, type, value);
            equals(f.name, name, "names are equal");
            equals(f.dataType, type, "type is good");
            equals(f.value, value, "value is good");
        });

        test("Can Set Value", function(){
            var name = "test_field";
            var type = "test_type";
            var value = "test_value";
            var new_value = "new_test_value";
            var f = new oDesk.DataSource.Field(name, type, value);
            f.set(new_value);
            equals(f.name, name, "names are equal");
            equals(f.dataType, type, "type is good");
            equals(f.value, new_value, "value is good");
        });

        test("Can Clone", function(){
            var value = "test_value";
            var new_value = "new_test_value";
            canClone(oDesk.DataSource.Field, value, new_value);
        });

        module("Date Field");

        test("Can Create Date Field", function(){
            var name = "test_date_field";
            var value = new Date();
            var f = new oDesk.DataSource.DateField(name, value);
            equals(f.name, name, "names are equal");
            equals(f.dataType, "date", "type is good");
            equals(f.value, value, "value is good");
        });

        test("Can Clone", function(){
            var value = new Date();
            var new_value = new Date();
            new_value.setDate(new_value.getDate() + 5);
            canClone(oDesk.DataSource.DateField, value, new_value);
        });

        test("Can Set String Value", function(){
            var name = "test_date_field";
            var value = new Date();
            var new_value = new Date();
            new_value.zeroTime();
            var format = dateField.format;
            new_value.setDate(new_value.getDate() + 5);
            var f = new oDesk.DataSource.DateField(name, value);
            equals(f.value, value, "value is good");
            f.setString(new_value.asString(format));
            equals(f.value.asString(format), new_value.asString(format), "new value is good");
        });

        test("Can Get Day Of Week", function(){
            var aMonday = "20100201";
            var format = dateField.format;
            var value = Date.fromString(aMonday, format);
            var f = new oDesk.DataSource.DateField("test_date_field", value);
            equals(0, f.dayOfWeek(), "Day Of Week OK");
            value.addDays(5);
            f.set(value);
            equals(5, f.dayOfWeek(), "Day Of Week Still OK");
        });

        test("Can Create with String Value", function(){
               var aMonday = "20100201";
               var f = new oDesk.DataSource.DateField("test_date_field", aMonday);
               equals(aMonday, f.value.asString(dateField.format));
         });

        module("Number Field");

        test("Can Create Number Field", function(){
            var name = "test_number_field";
            var value = 10.5;
            var f = new oDesk.DataSource.NumberField(name, value);
            equals(f.name, name, "names are equal");
            equals(f.dataType, "number", "type is good");
            equals(f.value, value, "value is good");
        });

        test("Can Create Number Field With String Value", function(){
            var name = "test_number_field";
            var value = 10.5;
            var f = new oDesk.DataSource.NumberField(name, "" + value);
            equals(f.value, value, "value is good");
        });

        test("Can Clone", function(){
            var value = 10.5;
            var new_value = 120.7;
            canClone(oDesk.DataSource.NumberField, value, new_value);
        });

        test("Can Get Hours", function(){
            var name = "test_number_field";
            var value = 10.5;
            var f = new oDesk.DataSource.NumberField(name, value);
            equals("10:30", f.toHours());
         });

         test("Can Get Money", function(){
             var name = "test_number_field";
             var value = 10.5;
             var f = new oDesk.DataSource.NumberField(name, value);
             equals("$10.50", f.toMoney());
          });

        if ( typeof fireunit === "object" ) {
                QUnit.log = fireunit.ok;
                QUnit.done = fireunit.testDone;
        }
    };

})(jQuery);