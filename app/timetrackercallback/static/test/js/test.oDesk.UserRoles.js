(function($){
    oDesk.UserRoles = function(){};
    oDesk.UserRoles.test = function(){

        module("Company & Team");

        test("Can create a company", function(){
            var company = new oDesk.Company("teammichael:teammichael", "Michael", "49041", "oDesk");
            equals(company.id, "teammichael:teammichael");
            equals(company.team.id, company.id);
            equals(company.name, "Michael");
            equals(company.reference, "49041");
            equals(company.team.reference, company.reference);
            equals(company.team.name, "oDesk");
            equals(company.team.teams.length, 0);
            equals(company.team.parentTeam, null);
            equals(company.team.company, company);

        });

        test("Can create a team", function(){
            var company = new oDesk.Company("teammichael:teammichael", "Michael", "49041", "oDesk");
            var team = new oDesk.Team("teammichael:development", "ML Development", "49046", company);
            equals(team.id, "teammichael:development");
            equals(team.reference, "49046");
            equals(team.name, "ML Development");
            equals(company.team.teams.length, 1);
            equals(company.team.teams[0], team);
            equals(team.parentTeam, company.team);
            equals(team.company, company);
        });


        test("Can find a team", function(){
            var company = new oDesk.Company("teammichael:teammichael", "Michael", "49041", "oDesk");
            var team = new oDesk.Team("teammichael:development", "ML Development", "49046", company);

            equals(company.team.findTeam("teammichael:teammichael"), company.team);
            equals(company.team.findTeam("teammichael:development"), team);
            equals(team.findTeam("teammichael:development"), team);
            equals(team.findTeam("teammichael:teammichael"), null);

        });


        module("User Roles");

        test("Can create an auth user", function(){
            var user = new oDesk.AuthUser("lakshmivyas", "Lakshmi", "Vyasarajan");
            equals(user.name, "Lakshmi Vyasarajan");
            equals(user.id, "lakshmivyas");
            equals(user.getDisplayName(), "Lakshmi Vyasarajan (lakshmivyas)");
        });

        test("Can add roles to a user", function(){
            var permissions = ["manage_employment", "manage_recruiting"];
            var user = new oDesk.AuthUser("lakshmivyas", "Lakshmi", "Vyasarajan");
            var company = new oDesk.Company("teammichael:teammichael", "Michael", "49041", "oDesk");
            equals(user.roles.length, 0);
            var role = new oDesk.UserRole(user, company.team, "manager", permissions);
            equals(role.roleName, "manager");
            equals(role.authUser, user);
            equals(role.team, company.team);
            ok($.inArray(role.roleName, role.team.company.roles) != -1, "Role added to company");
            $.each(role.permissions, function(permissionIndex, permission){
                ok($.inArray(permission, role.team.company.permissions) != -1, "Permission added to company");
            });
            ok($.inArray(role.roleName, role.team.roles) != -1, "Role added to company");
            $.each(role.permissions, function(i, permission){
                equals(permission, permissions[i]);
            });
            $.each(role.permissions, function(permissionIndex, permission){
                ok($.inArray(permission, role.team.permissions) != -1, "Permission added to team");
            });
            equals(user.roles.length, 1);
        });


        test("Can add multiple roles", function(){
             var permissions = ["manage_employment", "manage_recruiting"];
             var user = new oDesk.AuthUser("lakshmivyas", "Lakshmi", "Vyasarajan");
             var company = new oDesk.Company("teammichael:teammichael", "Michael", "49041", "oDesk");
             var team1 = new oDesk.Team("teammichael:development", "ML Development", "49046", company);
             var company2 = new oDesk.Company("odesk", "118", "oDesk", "oDesk");
             var team2 = new oDesk.Team("odeskprod", "oDesk Product", "2837", company2);
             var role1 = new oDesk.UserRole(user, company.team, "manager", permissions);
             var role2 = new oDesk.UserRole(user, team1, "manager", ["manage_employment", "manage_recruiting"]);
             equals(user.roles.length, 2);
             var role3 = new oDesk.UserRole(user, team2, "member", null);
             equals(user.roles.length, 3);

             var roles = [role1, role2, role3];

             $.each(user.roles, function(i, role){
                 var thisRole = roles[i];
                 equals(role.roleName, thisRole.roleName);
                 ok($.inArray(role.roleName, role.team.company.roles) != -1, "Role added to company");
                 $.each(role.permissions, function(permissionIndex, permission){
                     ok($.inArray(permission, role.team.company.permissions) != -1, "Permission added to company");
                 })
                 equals(role.team, thisRole.team);
                 ok($.inArray(role.roleName, role.team.roles) != -1, "Role added to team");
                 $.each(role.permissions, function(permissionIndex, permission){
                     ok($.inArray(permission, role.team.permissions) != -1, "Permission added to team");
                 });
                 equals(role.authUser, thisRole.authUser);
                 $.each(role.permissions, function(j, permission){
                     equals(permission, thisRole.permissions[j]);
                 });
             });

         });


         test("Can get a company from user", function(){
             var user = new oDesk.AuthUser("lakshmivyas", "Lakshmi", "Vyasarajan");
             var company = new oDesk.Company("teammichael:teammichael", "Michael", "49041", "oDesk");
             var role = new oDesk.UserRole(user, company.team, "manager");

             var retrievedCompany = user.getCompany(company.id);
             ok(retrievedCompany, "Company is not null");
             equals(retrievedCompany, company);
         });


         test("Can get a company by reference from user", function(){
             var user = new oDesk.AuthUser("lakshmivyas", "Lakshmi", "Vyasarajan");
             var company = new oDesk.Company("teammichael:teammichael", "Michael", "49041", "oDesk");
             var role = new oDesk.UserRole(user, company.team, "manager");

             var retrievedCompany = user.getCompanyByReference(company.reference);
             ok(retrievedCompany, "Company is not null");
             equals(retrievedCompany, company);
         });


         test("Can get a team from user", function(){
             var user = new oDesk.AuthUser("lakshmivyas", "Lakshmi", "Vyasarajan");
             var company = new oDesk.Company("teammichael:teammichael", "Michael", "49041", "oDesk");
             var role = new oDesk.UserRole(user, company.team, "manager");

             var retrievedTeam = user.getTeam(company.team.id);
             ok(retrievedTeam, "Team is not null");
             equals(retrievedTeam, company.team);
         });


         function equalTeams(team1, team2){
            equals(team1.id, team2.id);
            equals(team1.name, team2.name);
            equals(team1.reference, team2.reference);
            $.each(team1.teams, function(i, team){
               equalTeams(team, team2.teams[i]);
            });
         }

          function equalCompanies(company1, company2){
             equals(company1.id, company2.id);
             equals(company1.name, company2.name);
             equals(company1.reference, company2.reference);
             equalTeams(company1.team, company2.team);
          }


         test("Can Populate User Roles returned from Service", function(){
             var data = getoDeskUserRoles();
             var authuser = new oDesk.AuthUser("lakshmivyas", "Lakshmi", "Vyasarajan");
             oDesk.Services.updateRoles(authuser, data);

             var permissions = ["manage_employment", "manage_recruiting"];
             var user = new oDesk.AuthUser("lakshmivyas", "Lakshmi", "Vyasarajan");
             var company = new oDesk.Company("teammichael:teammichael", "Michael", "49041", "oDesk");
             var team1 = new oDesk.Team("teammichael:development", "ML Development", "49046", company);
             var company2 = new oDesk.Company("odesk", "118", "oDesk", "oDesk");
             var team2 = new oDesk.Team("odeskprod", "oDesk Product", "2837", company2);
             var role1 = new oDesk.UserRole(user, company.team, "manager", permissions);
             var role2 = new oDesk.UserRole(user, team1, "manager", ["manage_employment", "manage_recruiting"]);
             var role3 = new oDesk.UserRole(user, team2, "member", null);


             var roles = [role1, role2, role3];

             $.each(roles, function(i, thisRole){
                  var role = authuser.roles[i];
                  ok(role, "Role is not null");
                  equals(role.roleName, thisRole.roleName);
                  equals(role.team.company.id, thisRole.team.company.id);
                  equalTeams(role.team, thisRole.team);
                  equals(role.authUser.id, thisRole.authUser.id);
                  equals(role.authUser.name, thisRole.authUser.name);
                  $.each(role.permissions, function(j, permission){
                      equals(permission, thisRole.permissions[j]);
                  });

                  ok($.inArray(role.roleName, role.team.company.roles) != -1, "Role added to company");
                  $.each(role.permissions, function(permissionIndex, permission){
                      ok($.inArray(permission, role.team.company.permissions) != -1, "Permission added to company");
                  })
                  ok($.inArray(role.roleName, role.team.roles) != -1, "Role added to team");
                  $.each(role.permissions, function(permissionIndex, permission){
                      ok($.inArray(permission, role.team.permissions) != -1, "Permission added to team");
                  });
                  $.each(role.permissions, function(j, permission){
                      equals(permission, thisRole.permissions[j]);
                  });
             });

         });


          module("Filtering");

          test("Can filter Companies by Role", function(){
             var data = getoDeskUserRoles();
             var authuser = new oDesk.AuthUser("lakshmivyas", "Lakshmi", "Vyasarajan");
             oDesk.Services.updateRoles(authuser, data);
             var companies = authuser.getCompanies();
             equals(companies.length, 2);
             ok(!companies[0].hidden, "Company 1 is unfiltered.");
             ok(!companies[1].hidden, "Company 2 is unfiltered.");
             var companies = authuser.getCompanies({
                 roles: ["manager"]
             });
             equals(companies.length, 2);
             equals(companies[0].id, "teammichael:teammichael");
             equals(companies[1].id, "odesk");
             ok(!companies[0].hidden, "Company 1 is unfiltered.");
             ok(companies[1].hidden, "Company 2 is filtered.");
          });


          test("Can filter Companies by Permissions", function(){
             var data = getoDeskUserRoles();
             var authuser = new oDesk.AuthUser("lakshmivyas", "Lakshmi", "Vyasarajan");
             oDesk.Services.updateRoles(authuser, data);
             var companies = authuser.getCompanies();
             equals(companies.length, 2);
             ok(!companies[0].hidden, "Company 1 is unfiltered.");
             ok(!companies[1].hidden, "Company 2 is unfiltered.");
             var companies = authuser.getCompanies({
                 permissions: ["manage_employment"]
             });
             equals(companies.length, 2);
             equals(companies[0].id, "teammichael:teammichael");
             equals(companies[1].id, "odesk");
             ok(!companies[0].hidden, "Company 1 is unfiltered.");
             ok(companies[1].hidden, "Company 2 is filtered.");
          });


          test("Can filter Teams by Role", function(){
               var data = getoDeskUserRoles();
               var authuser = new oDesk.AuthUser("lakshmivyas", "Lakshmi", "Vyasarajan");
               oDesk.Services.updateRoles(authuser, data);
               var companies = authuser.getCompanies();
               ok(!companies[0].team.hidden, "Team 1 is unfiltered.");
               ok(!companies[0].team.teams[0].hidden, "Team 2 is unfiltered.");
               ok(!companies[1].team.hidden, "Team 3 is unfiltered.");
               ok(!companies[1].team.teams[0].hidden, "Team 4 is unfiltered.");
               var companies = authuser.getCompanies({
                   roles: ["manager"]
               });
               equals(companies[0].team.id, "teammichael:teammichael");
               equals(companies[0].team.teams[0].id, "teammichael:development");
               equals(companies[1].team.id, "odesk");
               equals(companies[1].team.teams[0].id, "odeskprod");

               ok(!companies[0].team.hidden, "Team 1 is unfiltered.");
               ok(!companies[0].team.teams[0].hidden, "Team 2 is unfiltered.");
               ok(companies[1].team.hidden, "Team 3 is filtered.");
               ok(companies[1].team.teams[0].hidden, "Team 4 is filtered.");

            });


            test("Can filter Teams by Permission", function(){
                 var data = getoDeskUserRoles();
                 var authuser = new oDesk.AuthUser("lakshmivyas", "Lakshmi", "Vyasarajan");
                 oDesk.Services.updateRoles(authuser, data);
                 var companies = authuser.getCompanies();
                 ok(!companies[0].team.hidden, "Team 1 is unfiltered.");
                 ok(!companies[0].team.teams[0].hidden, "Team 2 is unfiltered.");
                 ok(!companies[1].team.hidden, "Team 3 is unfiltered.");
                 ok(!companies[1].team.teams[0].hidden, "Team 4 is unfiltered.");
                 var companies = authuser.getCompanies({
                     permissions: ["manage_employment"]
                 });
                 equals(companies[0].team.id, "teammichael:teammichael");
                 equals(companies[0].team.teams[0].id, "teammichael:development");
                 equals(companies[1].team.id, "odesk");
                 equals(companies[1].team.teams[0].id, "odeskprod");

                 ok(!companies[0].team.hidden, "Team 1 is unfiltered.");
                 ok(!companies[0].team.teams[0].hidden, "Team 2 is unfiltered.");
                 ok(companies[1].team.hidden, "Team 3 is filtered.");
                 ok(companies[1].team.teams[0].hidden, "Team 4 is filtered.");

              });


    };


})(jQuery);