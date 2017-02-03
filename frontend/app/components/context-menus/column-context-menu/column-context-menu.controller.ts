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

import {WorkPackageTableColumnsService} from '../../wp-fast-table/state/wp-table-columns.service';
import {WorkPackageTableMetadataService} from '../../wp-fast-table/state/wp-table-metadata.service';

angular
  .module('openproject.workPackages')
  .controller('ColumnContextMenuController', ColumnContextMenuController);

function ColumnContextMenuController($scope,
                                     columnContextMenu,
                                     QueryService,
                                     wpTableColumns:WorkPackageTableColumnsService,
                                     wpTableMetadata:WorkPackageTableMetadataService,
                                     I18n,
                                     columnsModal) {

  $scope.I18n = I18n;

  $scope.$watch('column', function () {
    // fall back to 'id' column as the default
    $scope.column = $scope.column || {name: 'id', sortable: true};
    $scope.isGroupable = wpTableMetadata.isGroupable($scope.column.name);
  });

  // context menu actions

  $scope.groupBy = function (columnName) {
    QueryService.getQuery().groupBy = columnName;
    QueryService.getQuery().dirty = true;
  };

  $scope.sortAscending = function (columnName) {
    QueryService.getQuery().sortation.addSortElement({
        field: columnName || 'id',
        direction: 'asc'
      });
    QueryService.getQuery().dirty = true;
  };

  $scope.sortDescending = function (columnName) {
    QueryService.getQuery().sortation.addSortElement({
        field: columnName || 'id',
        direction: 'desc'
      });
    QueryService.getQuery().dirty = true;
  };

  $scope.moveLeft = function (columnName) {
    wpTableColumns.shift(columnName, -1);
    QueryService.getQuery().dirty = true;
  };

  $scope.moveRight = function (columnName) {
    wpTableColumns.shift(columnName, 1);
    QueryService.getQuery().dirty = true;
  };

  $scope.hideColumn = function (columnName) {
    columnContextMenu.close();
    let previousColumn = wpTableColumns.previous(columnName);
    wpTableColumns.removeColumn(columnName);
    QueryService.getQuery().dirty = true;

    window.setTimeout(function () {
      if (previousColumn) {
        jQuery('#' + previousColumn).focus();
      } else {
        jQuery('th.checkbox a').focus();
      }
    }, 100);
  };

  $scope.insertColumns = function () {
    columnsModal.activate();
  };

  $scope.canSort = function () {
    return $scope.column && !!$scope.column.sortable;
  };

  function isValidColumn(column) {
    return column;
  }

  $scope.canMoveLeft = function () {
    return isValidColumn($scope.column) && !wpTableColumns.isFirst($scope.column);
  };

  $scope.canMoveRight = function () {
    return isValidColumn($scope.column) && !wpTableColumns.isLast($scope.column);
  };

  $scope.canBeHidden = function () {
    return isValidColumn($scope.column);
  };

  $scope.focusFeature = function (feature) {
    var focus;
    var mergeOrReturn = function (currentState, state) {
      return ((currentState === undefined) ? state : currentState && !state);
    };

    switch (feature) {
      case 'insert':
        focus = mergeOrReturn(focus, true);
      case 'hide':
        focus = mergeOrReturn(focus, $scope.canBeHidden());
      case 'moveRight':
        focus = mergeOrReturn(focus, $scope.canMoveRight());
      case 'moveLeft':
        focus = mergeOrReturn(focus, $scope.canMoveLeft());
      case 'group':
        focus = mergeOrReturn(focus, !!$scope.isGroupable);
      default:
        focus = mergeOrReturn(focus, $scope.canSort());
    }

    return focus;
  };
}
