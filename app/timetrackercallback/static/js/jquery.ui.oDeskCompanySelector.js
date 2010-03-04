(function($) {
$.widget("ui.oDeskCompanySelector",{
    _init: function(){
      this.populateList();
    },
    selectWithId: function(id){
        var widget = this;
        var reference = null;
        if (id && widget.options.showTeams && widget.options.allowTeamSelection){
            reference = widget._getTeamReference(unescape(id));
        } else {
            reference = widget._getCompanyReference(unescape(id));
        }
        if(!reference) return;
        $(widget.options.selector)
            .find("li." + widget.options.selectedListItemClass)
            .removeClass(widget.options.selectedListItemClass);
        $(widget.options.selector)
            .find("li#" + unescape(reference))
            .addClass(widget.options.selectedListItemClass);
        widget._applySelection();
    },
    _getCompanyReference: function(id){
        var widget = this;
        var reference = null;
        $.each(widget.options.companies, function(c, company){
            if (company.id == id || company.team.id == id){
                reference = company.reference;
                return false;
            }
        });
        return reference;
    },
    _getTeamReference: function(id){
        var widget = this;
        var reference = null;
        $.each(widget.options.companies, function(c, company){
            company.team.walk({
                visitNode: function(team){
                  if(team.id == id){
                      reference = team.reference;
                      return false;
                  }
                }
            });
        });
        return reference;
    },
    populateList: function(){
        var widget = this;
        $(widget.element[0]).children("." + widget.options.containerClass).remove();
        var html = '<div class="';
        html += widget.options.containerClass;
        html += '"><div class="';
        html += widget.options.selectionDisplayClass;
        html += '"></div>';
        var totalCompanies = 0;
        var list = '<ul class="company_list">';
        var teamList = "";
        var level = 0;
        var treeSpec = {
            treeBegin: function(){teamList += '<ul class="team_list">';},
            treeComplete: function(){teamList += "</ul>";},
            nodeBegin: function(team, childCount){
                if(childCount > 1 && widget.options.showAllTeams){
                    teamList += ('<li class="team all_teams" id="all_' + team.reference + '">');
                    teamList += (widget.options.allTeamsText + "</li>");
                }
                teamList += "<ul>";level++;
            },
            nodeComplete: function(team){teamList += "</ul>";level--;},
            visitNode: function(team){
                teamList += ('<li id="' + team.reference + '"');
                teamList += ('class="team level_' + level);
                if (widget.options.selection.reference == team.reference) {
                    teamList += (" " + widget.options.selectedListItemClass);
                }
                teamList += '">';
                teamList +=  team.getDisplayName();
                teamList += "</li>";
            },
            nodeFilter: function(team){return !team.hidden;}

        };
        $.each(widget.options.companies, function(i, company){
            if (!company.hidden){
                totalCompanies++;
                if(widget.options.showCompanies){
                    list += '<li id="';
                    list += company.reference;
                    list += '" class="company';
                    if (!widget.options.allowCompanySelection){
                        list += " noselect";
                    } else if (widget.options.selection.reference == company.reference) {
                        list += (" " + widget.options.selectedListItemClass);
                    }
                    list += '">';
                    list += company.name;
                    list += '</li>';
                }
                if(widget.options.showTeams) {
                    teamList = "";
                    company.team.walkTree(treeSpec);
                    list += teamList;
                }
            }
        });
        list += "</ul>";
        if(totalCompanies){
            html += list;
        }
        html += '</div>';
        widget.options.selector = $(html).appendTo(widget.element[0]);

        if(widget._selectionListItems().length <= 1){
            widget._selectionDisplay().addClass("disabled");
        }

        $(document).click(function(event){
            if(!$(event.target).is("." + widget.options.containerClass)){
                $(widget.options.selector).children("ul.company_list").hide();
            }
        });

        $(widget.options.selector).unbind('click').bind('click', function(event){
            if(widget._selectionListItems().length <= 1) return false;
           $(widget.options.selector).children("ul.company_list").toggle();
           event.stopPropagation();
        });

        var selectionSelectors = [];
        if (widget.options.showTeams && widget.options.allowTeamSelection){
            selectionSelectors.push("li.team");
        }
        if (widget.options.showCompanies && widget.options.allowCompanySelection){
            selectionSelectors.push("li.company");
        }
        var selectionSelectorString = selectionSelectors.join(",");
        $(widget.options.selector).find(selectionSelectorString).unbind("click").bind("click", function(){
            widget._selectionListItems().removeClass(widget.options.selectedListItemClass);
            $(this).addClass(widget.options.selectedListItemClass);
            widget._applySelection();
        });
        widget._applySelection();
    },
    _applySelection: function(){
        var widget = this;
        var element = $(widget.options.selector).find("li." + widget.options.selectedListItemClass);
        if(!element.length) {
            element = $(widget.options.selector).find("li:first");
            if(!element.length) {
                widget._selectionDisplay().text(widget.options.noItemsFoundText);
                return;
            }
            element.addClass(widget.options.selectedListItemClass);
        }
        widget.options.selection = {};
        var reference = $(element).attr("id");
        var isSelectionTeam = $(element).hasClass("team");
        var selection = null;
        var allOptionSelected = false;
        if(reference.indexOf("all_") == 0){
            allOptionSelected = true;
            reference = reference.replace("all_", "");
        }
        if(isSelectionTeam){
            var selectedTeam = null;
            $.each(widget.options.companies, function(i, company){
               selectedTeam = company.team.findTeamByReference(reference);
               if(selectedTeam) return false;
            });
            if(selectedTeam && allOptionSelected){
                selection = selectedTeam.company;
            } else selection = selectedTeam;
        } else {
            var selectedCompany = null;
            $.each(widget.options.companies, function(i, company){
               if(company.reference == reference) {
                  selectedCompany = company;
                  return false;
               }
            });
            selection = selectedCompany;
        }
        widget.options.selection = {
            item: selection,
            allOptionSelected: allOptionSelected,
            isSelectionTeam: isSelectionTeam,
            reference: reference
        };

        if(selection && isSelectionTeam){
            var text = "";
            if (allOptionSelected){
                text = selection.name;
                text += " > ";
                text += widget.options.allTeamsText;
            }  else if (selection.company.name == selection.name){
                text = selection.name;
            } else {
                text = (selection.company.name + " > " + selection.name);
            }
            widget._selectionDisplay().text(text);
        } else {
            widget._selectionDisplay().text($(element).text());
        }
        $(widget.element[0]).trigger("change", widget.options.selection);
    },
    _selectionDisplay: function(){
        return $(this.options.selector).children("div." + this.options.selectionDisplayClass);
    },
    _selectionListItems: function(){
        return $(this.options.selector).find("li");
    }
});


$.extend($.ui.oDeskCompanySelector, {
   defaults: {
       containerClass: "customSelector",
       selectionDisplayClass: "display",
       selectedListItemClass: "selected",
       showTeams: true,
       showCompanies: true,
       showAllTeams: true,
       allTeamsText: "All Teams",
       companies: [],
       allowCompanySelection: true,
       allowTeamSelection: true,
       noItemsFoundText: "Nothing to select",
       selection: {
           item: null,
           allOptionSelected: false,
           isSelectionTeam: false,
           reference: null
       }
   }
 });
})(jQuery);