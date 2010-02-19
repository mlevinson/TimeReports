(function($){
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
                 if($.isFunction(success)){
                     success(report.state.company);
                 }
             }
         });
    };


    oDesk.Services.getTeams = function(report, success, failure){
         $.ajax({
             url: report.getTeamsQuery(),
             dataType: 'jsonp',
             error: function(request, status, error){
                 if($.isFunction(failure)){
                     failure(status, error);
                 }
             },
             success: function(data, status, request){
                 teams = [];
                 var companyTeamObject = null;
                 $.each(data.teams, function(i, team){
                    var teamObject = new oDesk.Team();
                    teamObject.id = team.id;
                    teamObject.reference = team.reference;
                    teamObject.name = team.name;
                    if (team.reference == report.state.company.reference){
                        report.state.company.id = team.id;
                        companyTeamObject = teamObject;
                    } else {
                        teams.push(teamObject);
                    }
                 });
                 teams.sort();
                 if(companyTeamObject){
                     teams.unshift(companyTeamObject);
                 }
                 if($.isFunction(success)){
                     success(teams);
                 }
             }
         });
    };

    function _ajax(query, success, failure){
        if(!query && $.isFunction(failure)){
            failure("Not Connected.", "Query is null");
            return null;
        }
        $.ajax({
             url: query,
             dataType: 'jsonp',
             error: function(request, status, error){
                 if($.isFunction(failure)){
                     failure(status, error);
                 }

             },
             success: function(data, status, request){
                 if($.isFunction(success)){
                     success(data, status);
                 }
             }
         });
    };

    oDesk.Services.getHours = function(report, success, failure){
        _ajax(report.getHoursQuery(), success, failure);
    };

    oDesk.Services.getProviderHours = function(report, success, failure){
        _ajax(report.getProviderHoursQuery(), success, failure);
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
           _ajax(report.getAgencyQuery(),
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

        if(!results.records.length){
            if($.isFunction(success)){
                success(results, "Succcess");
            }
            return;
        }
        $.each(results.records, function(i, record){
            record.taskDescription = record.task;
            record.taskUrl = null;
        });
        
        results.records.sort(function(record1, record2){
            if(record1.taskDescription.value == record2.taskDescription.value){
                return record1.provider_name.value > record2.provider_name.value ? 1 : -1;
            } else {
                return record1.taskDescription.value > record2.taskDescription.value ? 1 : -1;                
            }
        });
        if($.isFunction(success)){success(results, "Succcess");}
         // TODO: Not getting the task codes because the API does not work
         // Must fix once the API issues get resolved.


        // _ajax(report.getTasksQuery(taskCodes), function(tasksData, status, request){
        //          if(!tasksData || !tasksData.tasks || !tasksData.tasks.task || !tasksData.tasks.task.length){
        //              if($.isFunction(success)){
        //                  success(records, "Succcess");
        //              }
        //              return;
        //          }
        //          var taskRecords = {};
        //          $.each(tasksData.tasks.task, function(i, task){
        //              taskRecords[task.code] = task;
        //          });
        //
        //          $.each(records, function(i, record){
        //             var task = taskRecords[record.taskCode];
        //             record.taskDescription = task.description;
        //             record.taskUrl = task.url;
        //          });
        //
        //          records.sort();
        //
        //          if($.isFunction(success)){
        //              success(records, "Succcess");
        //          }
        //
        //      }, failure);

    };

    oDesk.Services.addTaskDescriptions = addTaskDescriptions;

    oDesk.Services.getTaskSummary = function(report, success, failure){
        _ajax(report.getTaskHoursQuery(), function(data, status, request){
            addTaskDescriptions(report, data, success, failure);
        }, failure);
    };

    oDesk.Services.getProviders = function(report, success, failure){

         $.ajax({
             url: report.getProvidersQuery(),
             dataType: 'jsonp',
             error: function(request, status, error){
                 if($.isFunction(failure)){
                     failure(status, error);
                 }
             },
             success: function(data, status, request){
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
             }
         });
    };
})(jQuery);