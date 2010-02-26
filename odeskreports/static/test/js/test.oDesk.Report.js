(function($){

    oDesk.Report.test = function(){

        module("Report State");

        test("Can get parameters from Report State", function(){

            var report = new oDesk.Report("week");
            report.state.company.reference = "49041";
            report.state.company.id = "teammichael:teammichael";
            report.state.company.name = "Michael";

            report.state.team.reference = "49046";
            report.state.team.id = "teammichael:development";
            report.state.team.name = "ML Development";

            var expected = {
                 companyId: report.state.company.id,
                 companyReference: report.state.company.reference,
                 companyName: report.state.company.name,
                 teamId: report.state.team.id,
                 teamReference: report.state.team.reference,
                 teamName: report.state.team.name
            };

            var params = report.state.makeParams();

            $.each(expected, function(name, value){
               equals(params[name], value);
            });

        });

    };


})(jQuery);