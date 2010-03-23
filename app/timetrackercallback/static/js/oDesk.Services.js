(function($){

    oDesk.Services.getAuthUser = function(report, success, failure){
        $.ajax({
             url: report.getAuthUserQuery(),
             dataType: 'jsonp',
             error: function(request, status, error){
                 if($.isFunction(failure)){
                     failure(status, error);
                 }
             },
             success: function(data, status, request){
                 report.state.authUser.name = data.auth_user.first_name + " "+ data.auth_user.last_name;
                 report.state.authUser.id = data.auth_user.uid;
                 if($.isFunction(success)){
                     success(report.state.authUser);
                 }
             }
         });
    };

    oDesk.Services.findCompany = function(companyReference, success, failure){
        var report = new oDesk.Report();
        report.state.company.reference = companyReference;
        oDesk.Services.getCompany(report, companyReference, function(data){
            oDeskUtil.ajax(report.getTeamsQuery(), function(teamData, status){
                var teams = [];
                $.each(teamData.teams, function(i, team){
                    var teamObj = new oDesk.oDeskObject();
                    teamObj.id = team.id;
                    teamObj.name = team.name;
                    teamObj.reference = team.reference;
                    if(team.reference == companyReference){
                       report.state.company.id = team.id;
                       report.state.company.team = teamObj;
                       report.state.company.team.teams = teams;
                    } else {
                        teams.push(teamObj);
                    }
                });
                if($.isFunction(success)){ success(report.state.company); }
            }, failure);
        }, failure);
    };

    oDesk.Services.getCompany = function(report, companyReference, success, failure){
        report.state.company.reference = companyReference;

        $.ajax({
             url: report.getCompanyQuery(),
             dataType: 'jsonp',
             error: function(request, status, error){
                 if($.isFunction(failure)){
                     failure(status, error);
                 }
             },
             success: function(data, status, request){
                 report.state.company.name = data.company.name;
                 if($.isFunction(success)){
                     success(data);
                 }
             }
         });
    };


    oDesk.Services.getTeams = function(report, success, failure){
        var teams = [];
        $.each(report.state.company.team.teams, function(i, team){
             if(!team.hidden) teams.push(team);
        });
        if(!report.state.company.team.hidden){
            teams.unshift(report.state.company.team);
        }
        if($.isFunction(success)){
            success(teams);
        }
    };

    oDesk.Services.findProvider = function(report, success, failure){
        oDesk.Services.getProviders(report, function(providers){
            var result = null;
            $.each(providers, function(i, provider){
               if(provider.id == report.state.provider.id){
                   report.state.provider.name = provider.name;
                   result = report.state.provider;
                   return false;
               }
            });
            if($.isFunction(success)){
                success(result);
            }
        }, failure);
    };

    oDesk.Services.getProviders = function(report, success, failure){
         oDeskUtil.ajax(report.getProvidersQuery(),
                         function(data, status, request){
                              providers = [];
                              $.each(data.users, function(i, provider){
                                 var providerObject = new oDesk.Provider();
                                 providerObject.id = provider.id;
                                 providerObject.reference = provider.reference;
                                 providerObject.name = provider.first_name + " " + provider.last_name;
                                 providers.push(providerObject);
                              });
                              providers.sort();
                              if($.isFunction(success)){
                                  success(providers);
                              }
                          },
                          failure
         );
    };


    oDesk.Services.getHours = function(report, success, failure){
        oDeskUtil.ajax(report.getHoursQuery(), success, failure);
    };

    oDesk.Services.getProviderHours = function(report, success, failure){
        oDeskUtil.ajax(report.getProviderHoursQuery(), success, failure);
    };

    function filterAgencyHours(report, success, failure){
        var data = report.state.agency_hours_cache;
        var status = report.state.agency_hours_status_cache;
        if(!data || !data.table || !data.table.cols || !data.table.rows){
            success(data,status);
            return;
        }
        var filtered = {};
        filtered["table"] = {"cols": data.table.cols, "rows": []};
        var filterBuyer = (report.state.buyer != null);
        $.each(data.table.rows, function(i, row){
           if(filterBuyer && row.c[4].v == report.state.buyer.id){
               filtered.table.rows.push(row);
           } else if(row.c[6].v == report.state.provider.id){
               filtered.table.rows.push(row);
           }
        });

        if($.isFunction(success)){
            success(filtered, status);
        }
    };

    oDesk.Services.getAgencyHours = function(report, success, failure){
       var cached_data = report.state.agency_hours_cache;
       var cached_status = report.state.agency_hours_status_cache;
       if(cached_data == 'undefined' || !cached_data){
           oDeskUtil.ajax(report.getAgencyQuery(),
                function(data, status){
                    report.state.agency_hours_cache = data;
                    report.state.agency_hours_status_cache = status;
                    if(report.state.filter_agency_hours){
                        filterAgencyHours(report, success, failure);
                    } else if($.isFunction(success)){
                        success(data, status);
                    }
                },
                failure);
       }
       else if(report.state.filter_agency_hours){
          filterAgencyHours(report, success, failure);
       } else if($.isFunction(success)){
          success(cached_data, cached_status);
       }
    };

    function addTaskDescriptions(report, data, success, failure){

        var results = new oDesk.DataSource.ResultSet(data);

        if(!results.records.length || report.providerSummary){
            if($.isFunction(success)){
                success(results, "Succcess");
            }
            return;
        }
        $.each(results.records, function(i, record){
            record.taskDescription = record.task;
            record.taskUrl = null;
        });

        var taskCodes = results.getUniqueRecordValues("task");
        if(!taskCodes.length){
            success(results, "Success");
            return;
        }
        oDeskUtil.ajax(report.getTasksQuery(taskCodes), function(tasksData, status, request){
             if(!tasksData || !tasksData.tasks || !tasksData.tasks.task){
                 if($.isFunction(success)){
                     success(results, "Succcess");
                 }
                 return;
             }
             var taskRecords = {};
             if(!tasksData.tasks.task.length){
                 taskRecords[tasksData.tasks.task.code] = tasksData.tasks.task;
             } else {
                 $.each(tasksData.tasks.task, function(i, task){
                     taskRecords[task.code] = task;
                 });
             }

             $.each(results.records, function(i, record){
                var task = taskRecords[record.task.value];
                if(task){
                    var taskDescription = new oDesk.DataSource.Field("taskDescription");
                    taskDescription.set(task.description);
                    var taskUrl = new oDesk.DataSource.Field("taskUrl");
                    taskUrl.set(task.url);

                    record.taskDescription = taskDescription;
                    record.taskUrl = taskUrl;
                }
             });

             results.records.sort(function(record1, record2){

                var providerCheck =
                    (record1.provider_name.value == record2.provider_name.value) ? 0 :
                        ((record1.provider_name.value > record2.provider_name.value) ? 1 : -1);

                var taskCheck = (record1.taskDescription.value == record2.taskDescription.value) ? 0 :
                                    ((record1.taskDescription.value > record2.taskDescription.value) ? 1 : -1);

                if(report.providerSummary){
                    return providerCheck || taskCheck;
                } else {
                    return taskCheck || providerCheck;
                }
             });

             if($.isFunction(success)){
               success(results, "Succcess");
             }

             }, failure);

    };

    oDesk.Services.addTaskDescriptions = addTaskDescriptions;

    oDesk.Services.getTaskSummary = function(report, success, failure){
        oDeskUtil.ajax(report.getTaskHoursQuery(), function(data, status, request){
            addTaskDescriptions(report, data, success, failure);
        }, failure);
    };

    oDesk.Services.getBuyersForProvider = function(report, success, failure){
        oDeskUtil.ajax(report.getEngagementsQuery(), function(data, status, request){
            var buyers = [];
            if(data && data.engagements && data.engagements.engagement && data.engagements.engagement.length){
                $.each(data.engagements.engagement, function(i, engagement){
                     if(engagement == "") return false;
                     var buyer = new oDesk.oDeskObject();
                     buyer.name = engagement.buyer_team__name;
                     buyer.reference = engagement.buyer_team__reference;
                     buyer.id = engagement.buyer_team__id;
                     buyers.push(buyer);
                });
            }
            if($.isFunction(success)){
                success(buyers);
            }
        }, failure);
    };

    oDesk.Services.getTimesheetDetails = function(report, success, failure){
        oDeskUtil.ajax(report.getTimesheetDetailsQuery(), function(data, status){
            if ($.isFunction(success)){
               success(new oDesk.DataSource.ResultSet(data), status);
            };
        }, failure);
    };

    oDesk.Services.getMyTimesheetDetails = function(report, success, failure){
        oDeskUtil.ajax(report.getMyTimesheetDetailsQuery(), function(data, status){
            if ($.isFunction(success)){
               success(new oDesk.DataSource.ResultSet(data), status);
            };
        }, failure);
    };

    oDesk.Services.getAgencyTimesheetDetails = function(report, success, failure){
           oDeskUtil.ajax(report.getAgencyTimesheetDetailsQuery(), function(data, status){
               if ($.isFunction(success)){
                  success(new oDesk.DataSource.ResultSet(data), status);
               };
           }, failure);
       };

})(jQuery);