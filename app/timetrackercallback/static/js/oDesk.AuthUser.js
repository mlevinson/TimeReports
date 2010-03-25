(function($){
    oDesk.getUserRolesQuery = function(){
        return "http://www.odesk.com/api/hr/v2/userroles.json";
    };

    oDesk.AuthUser = function(id, first_name, last_name){
        this.firstName = first_name || "";
        this.lastName = last_name || "";
        oDesk.oDeskObject.prototype.constructor.call(this, id, this.firstName + " " + this.lastName);
        this.companies = [];
        this.roles = [];
    };
    oDesk.AuthUser.prototype  = new oDesk.oDeskObject();
    oDesk.AuthUser.prototype.constructor = oDesk.AuthUser;

    oDesk.AuthUser.prototype.addRole = function(role){
        var currentRole = null, currentRoleIndex = -1;
        $.each(this.roles, function(i, inRole){
           if(role.team == inRole.team && role.authUser.id == inRole.authUser.id){
               currentRole = inRole;
               currentRoleIndex = i;
               return false;
           }
        });
        if(currentRole){
            this.roles.splice(currentRoleIndex, 1, role);
        } else {
            this.roles.push(role);
        }

        var company = this.getCompanyByReference(role.team.company.reference);
        if(!company) {
            this.companies.push(role.team.company);
        }
    };

    oDesk.AuthUser.Flavors = {
        manager: {roles: ["admin", "manager"]},
        recruiter: {permissions: ["manage_recruiting"]},
        affiliate: {permissions: ["manage_affiliation"]},
        hiring: {permissions: ["manage_employment"]},
        engaged: {engagementReference: "__exists__"},
        team_admin: {roles: ["admin"]},
        company_admin: {roles: ["admin"], appliesTo:{company:"self", team:"self"}},
        member: {}
    };

    oDesk.AuthUser.prototype.processRule = function(company, appliesTo, ruleFunction){
         var numberOfMatchingTeams = 0;
         var numberOfTeams = 0;
         company.team.walk(function(team){
              numberOfTeams ++;
              var teamMatches = ruleFunction(team);
              if (teamMatches) numberOfMatchingTeams++;
              if (company.team.id == team.id || appliesTo.team == "self"){
                  if(team.hidden && teamMatches) { team.hidden = false;  }
              } else {
                  team.hidden = company.team.hidden;
              }
          });

          if((appliesTo.company == "all" && numberOfMatchingTeams == numberOfTeams) ||
             (appliesTo.company == "any" && numberOfMatchingTeams > 0)){
                company.hidden = false;
          } else if (appliesTo.company == "self"){
              company.hidden = company.team.hidden;
          }
    };

    oDesk.AuthUser.prototype.filterRoles = function(company, filters){
        if(!filters || !filters.roles || !filters.roles.length)  return;
        var authUser = this;
        authUser.processRule(company, filters.appliesTo, function(team){
            var teamMatches = false;
            $.each(filters.roles, function(roleIndex, role){
                if ($.inArray(role, team.roles) > -1){
                    teamMatches = true;
                    return false;
                }
            });
            return teamMatches;
        });
    };

    oDesk.AuthUser.prototype.filterPermissions = function(company, filters){
        if(!filters || !filters.permissions || !filters.permissions.length)  return;
        var authUser = this;
        authUser.processRule(company, filters.appliesTo, function(team){
             var teamMatches = false;
              $.each(filters.permissions, function(permissionIndex, permission){
                  if ($.inArray(permission, team.permissions) > -1){
                        teamMatches = true;
                        return false;
                   }
              });
              return teamMatches;
        });
    };

    oDesk.AuthUser.prototype.filterEngagement = function(company, filters){
        if(!filters || !filters.engagementReference)  return;
        var authUser = this;
        authUser.processRule(company, filters.appliesTo, function(team){
             var teamMatches = false;
             if(filters.engagementReference == "__exists__" ){
                 teamMatches = (!!team.engagementReference);
             } else {
                 teamMatches = (team.engagementReference == filters.engagementReference);
             }
             return teamMatches;
        });
    };

    oDesk.AuthUser.prototype.teamHasFlavor = function(teamReference, f){
        var companies = this.getCompanies(f);
        var result = false;
        $.each(companies, function(i, company){
            var team = company.team.findTeamByReference(teamReference);
            if(team){
                result = !team.hidden;
                return false;
            }
        });
        return result;
    };

    oDesk.AuthUser.prototype.getCompanies = function(f){
        var authUser = this;
        var defaults = {
            roles: [],
            permissions: [],
            companyReference: null,
            engagementReference: null,
            appliesTo: {
                //  company: "any"            - Include the company if any of the teams match the criteria
                //  company: "all"            - Include the company if all of the teams match the criteria
                //  company: "self"           - Include the company if the {company team} matches the criteria
                company: "any",
                //  team:    "self"     - Include the team if it matches the criteria
                //  team:    "company"  - Include the team if the {company team} matches the criteria
                team: "self"
            }
        };
        var filters = $.extend({}, defaults, f);
        filters.appliesTo = $.extend({}, defaults.appliesTo, filters.appliesTo);
        var companies = [];
        var defaultHidden = filters.roles.length != 0 || filters.permissions.length != 0 || !!filters.engagementReference;
        $.each(this.companies, function(companyIndex, company){
           if(filters.companyReference && filters.companyReference != company.reference) return;
           var filteredCompany = company.createCopy();
           companies.push(filteredCompany);
           filteredCompany.hidden = defaultHidden;
           filteredCompany.team.walk(function(team){
                team.hidden = defaultHidden;
           });

           authUser.filterRoles(filteredCompany, filters);
           authUser.filterPermissions(filteredCompany, filters);
           authUser.filterEngagement(filteredCompany, filters);
        });
        return companies;
    };

    oDesk.AuthUser.prototype.getCompany = function(companyId){
        var result = null;
        $.each(this.companies, function(i, company){
            if(company.id == companyId){
                result = company;
                return false;
            }
        });
        return result;
    };


    oDesk.AuthUser.prototype.getCompanyByReference = function(companyRef){
          var result = null;
          $.each(this.companies, function(i, company){
              if(company.reference == companyRef){
                  result = company;
                  return false;
              }
          });
          return result;
      };


    oDesk.AuthUser.prototype.getTeam = function(teamId){
        var result = null;
        $.each(this.companies, function(i, company){
            var team = company.team.findTeam(teamId);
            if(team){
                result = team;
                return false;
            }
        });
        return result;
    };


    oDesk.AuthUser.prototype.getTeamByReference = function(teamReference){
        var result = null;
        $.each(this.companies, function(i, company){
            var team = company.team.findTeamByReference(teamReference);
            if(team){
                result = team;
                return false;
            }
        });
        return result;
    };

    oDesk.UserRole = function(authUser, team, roleName,  permissions){
        this.authUser = authUser;
        this.team = team;
        this.roleName = roleName;
        this.permissions = permissions || [];
        this.authUser.addRole(this);
        if($.inArray(roleName, team.roles) == -1){
            team.roles.push(roleName);
        }
        if($.inArray(roleName, team.company.roles) == -1){
            team.company.roles.push(roleName);
        }
        $.each(this.permissions, function(i, permission){
            if($.inArray(permission, team.permissions) == -1){
                team.permissions.push(permission);
            }
            if($.inArray(permission, team.company.permissions) == -1){
                team.company.permissions.push(permission);
            }
        });
    };



    oDesk.Team = function(id, name, reference, company, parentTeam){
        oDesk.oDeskObject.prototype.constructor.call(this, id, name, reference);
        this.company = company;
        this.parentTeam = parentTeam || company.team ? company.team : null;
        this.teams = [];
        this.roles = [];
        this.permissions = [];
        this.engagementReference = null;
        if (this.parentTeam) this.parentTeam.addTeam(this);

    };

    oDesk.Team.prototype  = new oDesk.oDeskObject();
    oDesk.Team.prototype.constructor = oDesk.Team;

    oDesk.Team.prototype.addTeam = function(team){
        if(this == team) return;
        if($.inArray(team, this.teams) == -1){
            this.teams.push(team);
        }
    };

    oDesk.Team.prototype._walkTree = function(spec){
        var childNodeCount = this.teams.length + 1;
        $.each(this.teams, function(i, team){
           if(!spec.nodeFilter(team)) childNodeCount--;
        });
        if(childNodeCount){
           spec.nodeBegin(this, childNodeCount);
           if(!spec.visitNode(this)){
               return false;
           }
            $.each(this.teams, function(t, team){
                if(spec.nodeFilter){
                    team._walkTree(spec);
                }
            });
            spec.nodeComplete(this);
        }
        return true;
    };

    oDesk.Team.prototype.walkTree = function(s){
        var defaults = {
            nodeFilter: function(node){return true;},
            treeBegin: function(){},
            visitNode: function(node){},
            nodeBegin: function(node, numberOfChildren){},
            nodeComplete: function(node){},
            treeComplete: function(){}
        };

        var spec = $.extend({}, defaults, s);
        if(spec.nodeFilter(this)){
            spec.treeBegin();
            if(!this._walkTree(spec)){
                return false;
            }
            spec.treeComplete();
        }
        return true;
    };

    oDesk.Team.prototype.walk = function(visitor){
        visitor(this);
        $.each(this.teams, function(t, team){
            team.walk(visitor);
        });
    };

    oDesk.Team.prototype.sortTeams = function(){
        this.teams.sort();
        $.each(this.teams, function(i, team){
            team.sortTeams();
        });
    };

    oDesk.Team.prototype.createCopy = function(company, parentTeam){
        var thisTeam = this;
        var team = new oDesk.Team(thisTeam.id, thisTeam.name, thisTeam.reference, company, parentTeam);
        team.roles = thisTeam.roles;
        team.permissions = thisTeam.permissions;
        team.engagementReference = thisTeam.engagementReference;
        $.each(this.teams, function(teamIndex, childTeam){
           team.addTeam(childTeam.createCopy(company, thisTeam));
        });
        return team;
    };

    oDesk.Team.prototype.findTeam = function(teamId){
        if (this.id == teamId) return this;
        var result = null;
        $.each(this.teams, function(i, team){
            var found = team.findTeam(teamId);
            if(found)  {
                result = found;
                return false;
            }
        });
        return result;
    };

    oDesk.Team.prototype.findTeamByReference = function(teamReference){
        if (this.reference == teamReference) return this;
        var result = null;
        $.each(this.teams, function(i, team){
            var found = team.findTeamByReference(teamReference);
            if(found)  {
                result = found;
                return false;
            }
        });
        return result;
    };

    oDesk.Company = function(id, name, reference, teamName){
        oDesk.oDeskObject.prototype.constructor.call(this, id, name, reference);
        this.team = new oDesk.Team(id, teamName, reference, this);
        this.roles = [];
        this.permissions = [];
    };
    oDesk.Company.prototype  = new oDesk.oDeskObject();
    oDesk.Company.prototype.constructor = oDesk.Company;

    oDesk.Company.prototype.sort = function(){
        this.team.sortTeams();
    };

    oDesk.Company.prototype.createCopy = function(){
        var company = new oDesk.Company(this.id, this.name, this.reference, this.team.name);
        company.roles = this.roles;
        company.permissions = this.permissions;
        company.team.roles = this.team.roles;
        company.team.permissions = this.team.permissions;
        company.team.engagementReference = this.team.engagementReference;
        $.each(this.team.teams, function(teamIndex, team){
            company.team.addTeam(team.createCopy(company, company.team));
        });
        return company;
    };

    oDesk.Services.createCompany = function(userrole){
        var companyId = null;
        var teamName = null;
        if(userrole.parent_team__reference == userrole.company__reference){
            companyId = userrole.parent_team__id;
            teamName = userrole.parent_team__name;
        }
        var company = new oDesk.Company(companyId, userrole.company__name, userrole.company__reference, teamName);
        if(userrole.team__reference == company.team.reference){
            company.team.engagementReference = userrole.engagement__reference;
        }
        return company;
    };

    oDesk.Services.createTeam = function(authUser, userrole){

        var company = null;
        var parentTeam = authUser.getTeam(userrole.parent_team__id);
        if(parentTeam){
            company = parentTeam.company;
        } else {
            company = authUser.getCompanyByReference(userrole.company__reference);
            if(!company){
               company = oDesk.Services.createCompany(userrole);
            }
            if(company.id != userrole.parent_team__id){
                parentTeam = new oDesk.Team(
                    userrole.parent_team__id,
                    userrole.parent_team__name,
                    userrole.parent_team__reference, company);
                company.team.addTeam(parentTeam);
            }
        }
        var team = null;
        if(userrole.parent_team__id == userrole.team__id){
            team = company.team;
        } else {
            team = new oDesk.Team(userrole.team__id, userrole.team__name, userrole.team__reference, company, parentTeam);
        }
        team.engagementReference = userrole.engagement__reference;
        return team;
    };

    oDesk.Services.createRole = function(authUser, userrole){
       var team = authUser.getTeam(userrole.team__id);
       if(!team){
           team = oDesk.Services.createTeam(authUser, userrole);
       }
       var permissions = [];

       if (userrole.permissions.permission && userrole.permissions.permission.length){
           permissions = userrole.permissions.permission;
       } else if (userrole.permissions.permission && userrole.permissions.permission != ""){
           permissions.push(userrole.permissions.permission);
       }
       return new oDesk.UserRole(authUser, team, userrole.role, permissions);
    };

    oDesk.Services.updateRoles = function(authUser, data){
        if (authUser.id != data.auth_user.uid) return;
        if(data.userroles == null || data.userroles.userrole == "" || data.userroles.userrole == null) return;
        if(!data.userroles.userrole.length){
            oDesk.Services.createRole(authUser, data.userroles.userrole);
        } else {
            $.each(data.userroles.userrole, function(i, userrole){
                oDesk.Services.createRole(authUser, userrole);
            });
        }
        authUser.companies.sort();
        $.each(authUser.companies, function(i, company){
           company.sort();
        });
    };

    oDesk.Services.getAuthUserAndRoles = function(success, failure){
        oDeskUtil.ajax(oDesk.getUserRolesQuery(), function(data, status){
            var user = new oDesk.AuthUser(
                            data.auth_user.uid,
                            data.auth_user.first_name,
                            data.auth_user.last_name);
           oDesk.Services.updateRoles(user, data);
           if($.isFunction(success)){
               success(user, status);
           }
        }, failure);
    };


})(jQuery);