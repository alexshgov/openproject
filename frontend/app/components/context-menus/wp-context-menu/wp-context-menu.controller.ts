// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
// ++

import {WorkPackageTableSelection} from '../../wp-fast-table/state/wp-table-selection.service';
import {ContextMenuService} from '../context-menu.service';
function wpContextMenuController($scope,
                                 $rootScope,
                                 $state,
                                 WorkPackageContextMenuHelper,
                                 WorkPackageService,
                                 contextMenu:ContextMenuService,
                                 I18n,
                                 $window,
                                 wpTableSelection:WorkPackageTableSelection,
                                 PERMITTED_CONTEXT_MENU_ACTIONS) {

  $scope.I18n = I18n;

  if (!wpTableSelection.isSelected($scope.row.object.id)) {
    wpTableSelection.setSelection($scope.row);
  }

  $scope.permittedActions = WorkPackageContextMenuHelper.getPermittedActions(getSelectedWorkPackages(), PERMITTED_CONTEXT_MENU_ACTIONS);

  $scope.isDetailsViewLinkPresent = function () {
    return !!angular.element('#work-package-context-menu li.open').length;
  };

  $scope.triggerContextMenuAction = function (action, link) {
    switch (action) {

      case 'delete':
        deleteSelectedWorkPackages();
        break;

      case 'edit':
        editSelectedWorkPackages(link);
        break;

      default:
        $window.location.href = link;
        break;
    }
  };

  $scope.cancelInlineCreate = function (index, row) {
    $rootScope.$emit('inlineWorkPackageCreateCancelled', index, row);
    emitClosingEvents();
  };

  function emitClosingEvents() {
    contextMenu.close();
  }

  function deleteSelectedWorkPackages() {
    let ids = wpTableSelection.getSelectedWorkPackageIds();

    WorkPackageService.performBulkDelete(ids, true);
  }

  function editSelectedWorkPackages(link) {
    var selected = getSelectedWorkPackages();

    if (selected.length > 1) {
      $window.location.href = link;
      return;
    }

    var params = {
      workPackageId: selected[0].id
    };

    $state.transitionTo('work-packages.show.edit', params);
  }

  function getSelectedWorkPackages() {
    let workPackagefromContext = $scope.row.object;
    let selectedWorkPackages = wpTableSelection.getSelectedWorkPackages();

    if (selectedWorkPackages.length === 0) {
      return [workPackagefromContext];
    }

    if (selectedWorkPackages.indexOf(workPackagefromContext) === -1) {
      selectedWorkPackages.push(workPackagefromContext);
    }

    return selectedWorkPackages;
  }
}

angular
  .module('openproject.workPackages')
  .controller('WorkPackageContextMenuController', wpContextMenuController);
