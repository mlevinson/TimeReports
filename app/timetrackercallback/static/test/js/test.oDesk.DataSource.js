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
            var format = oDesk.DataSource.DateField.format;
            new_value.setDate(new_value.getDate() + 5);
            var f = new oDesk.DataSource.DateField(name, value);
            equals(f.value, value, "value is good");
            f.setString(new_value.asString(format));
            equals(f.value.asString(format), new_value.asString(format), "new value is good");
        });

        test("Can Get Day Of Week", function(){
            var aMonday = "20100201";
            var format = oDesk.DataSource.DateField.format;
            var value = Date.fromString(aMonday, format);
            var f = new oDesk.DataSource.DateField("test_date_field", value);
            equals(f.dayOfWeek(), 0, "Day Of Week OK");
            value.addDays(5);
            f.set(value);
            equals(f.dayOfWeek(), 5, "Day Of Week Still OK");
        });

        test("Can Create with String Value", function(){
               var aMonday = "20100201";
               var f = new oDesk.DataSource.DateField("test_date_field", aMonday);
               equals(f.value.asString(oDesk.DataSource.DateField.format), aMonday);
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
            equals(f.toHours(), "10:30");
         });

        test("Can Get Money", function(){
            var name = "test_number_field";
            var value = 10.5;
            var f = new oDesk.DataSource.NumberField(name, value);
            equals(f.toMoney(), "$10.50");
         });

        module("Query");

        test("Can substitute url", function(){
            var params = {
                companyId: "teammichael:teammichael"
            };
            var url = "http://www.odesk.com/api/hr/v2/companies/{companyId}/teams.json";
            var expected_url = "http://www.odesk.com/api/hr/v2/companies/teammichael%3Ateammichael/teams.json";
            var query = new oDesk.DataSource.Query(params);
            query.setUrlTemplate(url);
            equals(query.toString(), expected_url);
        });

        test("Can add url fragments", function(){
            var params = {
                companyId: "teammichael:teammichael"
            };
            var teamId = "teammichael:ML Development";
            var url = "http://www.odesk.com/gds/timereports/v1/companies/{companyId}";
            var expected_url = "http://www.odesk.com/gds/timereports/v1/companies/teammichael%3Ateammichael.json";
            var expected_url_with_team = "http://www.odesk.com/gds/timereports/v1/companies/teammichael%3Ateammichael/teams/teammichael%3AML%20Development.json";
            var teamFragment = "/teams/{teamId}";
            var query = new oDesk.DataSource.Query(params);
            query.setUrlTemplate(url);
            query.addUrlFragment(teamFragment);
            query.addUrlFragment(".json");
            equals(query.toString(), expected_url);
            query.params.teamId = teamId;
            equals(query.toString(), expected_url_with_team);
        });

        test("Can add select statement", function(){
            var params = {
                companyId: "teammichael:teammichael"
            };
            var url = "http://www.odesk.com/gds/timereports/v1/companies/{companyId}";
            var expected_url = "http://www.odesk.com/gds/timereports/v1/companies/teammichael%3Ateammichael.json?tq=SELECT%20worked_on%2Cprovider_id%2Cprovider_name%2Csum%28hours%29%2Csum%28charges%29";
            var teamFragment = "/teams/{teamId}";
            var query = new oDesk.DataSource.Query(params);
            query.setUrlTemplate(url);
            query.addUrlFragment(".json");
            query.addSelectStatement(["worked_on", "provider_id", "provider_name", "sum(hours)", "sum(charges)"]);
            equals(query.toString(), expected_url);
        });

        test("Can add condition", function(){
            var params = {
                companyId: "teammichael:teammichael",
                timelineStartDate: "2010-02-01",
                timelineEndDate: "2010-02-28"
            };
            var url = "http://www.odesk.com/gds/timereports/v1/companies/{companyId}";
            var expected_url = "http://www.odesk.com/gds/timereports/v1/companies/teammichael%3Ateammichael.json?tq=SELECT%20worked_on%2Cprovider_id%2Cprovider_name%2Csum%28hours%29%2Csum%28charges%29%20WHERE%20worked_on%20%3E%3D%20%272010-02-01%27%20AND%20worked_on%20%3C%3D%20%272010-02-28%27";
            var teamFragment = "/teams/{teamId}";
            var query = new oDesk.DataSource.Query(params);
            query.setUrlTemplate(url);
            query.addUrlFragment(".json");
            query.addSelectStatement(["worked_on", "provider_id", "provider_name", "sum(hours)", "sum(charges)"]);
            query.addCondition(">=", "worked_on", "{timelineStartDate}");
            query.addCondition("<=", "worked_on", "{timelineEndDate}");
            equals(query.toString(), expected_url);
        });

        test("Can add Sorting", function(){
            var params = {
                companyId: "teammichael:teammichael",
                timelineStartDate: "2010-02-01",
                timelineEndDate: "2010-02-28"
            };
            var url = "http://www.odesk.com/gds/timereports/v1/companies/{companyId}";
            var expected_url = "http://www.odesk.com/gds/timereports/v1/companies/teammichael%3Ateammichael?tq=SELECT%20worked_on%2Cprovider_id%2Cprovider_name%2Csum%28hours%29%2Csum%28charges%29%20WHERE%20worked_on%20%3E%3D%20%272010-02-01%27%20AND%20worked_on%20%3C%3D%20%272010-02-28%27%20ORDER%20BY%20provider_id%2Cworked_on";
            var teamFragment = "/teams/{teamId}";
            var query = new oDesk.DataSource.Query(params);
            query.setUrlTemplate(url);
            query.addSelectStatement(["worked_on", "provider_id", "provider_name", "sum(hours)", "sum(charges)"]);
            query.addCondition(">=", "worked_on", "{timelineStartDate}");
            query.addCondition("<=", "worked_on", "{timelineEndDate}");
            query.addSortStatement(["provider_id", "worked_on"]);
            equals(query.toString(), expected_url);
        });

        module("Resultset");

        test("Can Read Google DataSource Result Set", function(){
            var dataset = getTestGDSDataSet();
            var format = oDesk.DataSource.DateField.format;
            var records = oDesk.DataSource.read(dataset);
            equals(records.length, dataset.table.rows.length);
            $.each(dataset.table.cols, function(i, col){
                ok(records[0][col.label], col.label + " Exists.");
            });
            equals(records[3].worked_on.value.asString(format), dataset.table.rows[3].c[0].v);
        });

        test("Can Get Unique Column Values", function(){
            var dataset = getTestGDSDataSet();
            var format = oDesk.DataSource.DateField.format;
            var results = new oDesk.DataSource.ResultSet(dataset);
            var expected = ["belnac", "lakshmivyas", "mlevinson"];
            var uniqueValues = results.getUniqueValues("provider_id");
            $.each(expected, function(i, providerId){
               equals(uniqueValues[i], providerId);
            });

        });

        test("Can Get Row Pivoted By Weekdays", function(){

            var dataset = getTestGDSDataSet();
            var format = oDesk.DataSource.DateField.format;
            var results = new oDesk.DataSource.ResultSet(dataset);
            results.pivotWeekDays({
                labelFunction: function(record){return record.provider_id.value;},
                valueFunction: function(record){return record.hours.value;}
            });

            var expected = getGDSPivotedByWeekDaysOnProviderId();

            $.each(expected, function(i, row){
               $.each(row, function(j, val){
                  equals(results.rows[i][j].value, val);
               });
            });

        });
        function numberEquals(actual, expected, text){
            var actualNumber = parseFloat(actual).toFixed(2);
            var expectedNumber = parseFloat(expected).toFixed(2);
            equals(actualNumber, expectedNumber, text)
        };
        test("Can Calculate Totals", function(){

            var dataset = getTestGDSDataSet();
            var format = oDesk.DataSource.DateField.format;
            var results = new oDesk.DataSource.ResultSet(dataset);
            results.pivotWeekDays({
                labelFunction: function(record){return record.provider_id.value;},
                valueFunction: function(record){return record.hours.value;}
            });
            results.calculateTotals([
                {hours: function(record){return record.hours.value;}},
                {charges: function(record){return record.charges.value;}}
            ]);
            log(JSON.stringify(results.rows));
            var expected = getGDSPivotedByWeekDaysOnProviderIdWithTotals();

            $.each(expected, function(i, row){
               equals(results.rows[i].length, row.length);
               $.each(row, function(j, val){
                   if(results.rows[i][j].dataType == "number"){
                       numberEquals(results.rows[i][j].value, val);
                   } else {
                       equals(results.rows[i][j].value, val);
                   }

               });
            });

        });



        if ( typeof fireunit === "object" ) {
                QUnit.log = fireunit.ok;
                QUnit.done = fireunit.testDone;
        }
    };

})(jQuery);