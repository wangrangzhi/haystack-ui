/*
 * Copyright 2017 Expedia, Inc.
 *
 *       Licensed under the Apache License, Version 2.0 (the "License");
 *       you may not use this file except in compliance with the License.
 *       You may obtain a copy of the License at
 *
 *           http://www.apache.org/licenses/LICENSE-2.0
 *
 *       Unless required by applicable law or agreed to in writing, software
 *       distributed under the License is distributed on an "AS IS" BASIS,
 *       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *       See the License for the specific language governing permissions and
 *       limitations under the License.
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {Sparklines, SparklinesCurve} from 'react-sparklines';

import AlertDetails from './details/alertDetails';
import alertDetailsStore from './stores/alertDetailsStore';
import formatters from '../../utils/formatters';

export default class AlertsTable extends React.Component {
    static propTypes = {
        serviceName: PropTypes.string.isRequired,
        results: PropTypes.object.isRequired
    };

    static nameColumnFormatter(cell) {
        return `<div class="table__primary">${cell}</div>`;
    }

    static typeColumnFormatter(cell) {
        return `<div class="table__primary">${AlertsTable.toAlertTypeString(cell)}</div>`;
    }

    static statusColumnFormatter(cell) {
        if (cell) {
            return '<span class="label label-success table__large-label">healthy</span>';
        }
        return '<span class="label label-failure table__large-label">unhealthy</span>';
    }

    static timestampColumnFormatter(timestamp) {
        return `<div class=""><b>${formatters.toTimeago(timestamp)}</b> at ${formatters.toTimestring(timestamp)}</div>`;
    }

    static trendColumnFormatter(cell) {
        const trends = cell.map(d => d.value);

        return (
            <div className="sparkline-container">
                <div className="sparkline-graph">
                    <Sparklines className="sparkline" data={trends} min={0} height={40}>
                        <SparklinesCurve style={{ strokeWidth: 1 }} color={'#36a2eb'} />
                    </Sparklines>
                </div>
            </div>
        );
    }

    static Header({name}) {
        return <span className="results-header">{name}</span>;
    }

    static getCaret(direction) {
        if (direction === 'asc') {
            return (
                <span className="order dropup">
                  <span className="caret" style={{margin: '10px 5px'}}/>
              </span>);
        }
        if (direction === 'desc') {
            return (
                <span className="order dropdown">
                  <span className="caret" style={{margin: '10px 5px'}}/>
              </span>);
        }
        return <div/>;
    }

    static rowClassNameFormat(row) {
        return row.isUnhealthy ? 'tr-no-border' : 'tr-no-border alert-details__alert-glow';
    }

    static toAlertTypeString = (num) => {
        if (num === 'count') {
            return 'Count';
        } else if (num === 'durationTp99') {
            return 'Duration TP99';
        } else if (num === 'successPercentage') {
            return 'Success %';
        }

        return null;
    };

    constructor(props) {
        super(props);
        this.state = {
            expanding: [],
            selected: []
        };

        this.handleExpand = this.handleExpand.bind(this);
        this.expandComponent = this.expandComponent.bind(this);
        this.getUnhealthyAlerts = this.getUnhealthyAlerts.bind(this);
    }

    getUnhealthyAlerts() {
        let unhealthyAlerts = 0;
        this.props.results.forEach((alert) => {
            if (!alert.isUnhealthy) {
                unhealthyAlerts += 1;
            }
        });
        return unhealthyAlerts;
    }

    handleExpand(rowKey, isExpand) {
        if (isExpand) {
            this.setState(
                {
                    expanding: [rowKey],
                    selected: [rowKey]
                }
            );
        } else {
            this.setState(
                {
                    expanding: [],
                    selected: []
                }
            );
        }
    }

    expandComponent(row) {
        if (this.state.selected.filter(alertId => alertId === row.alertId).length > 0) {
            return (<AlertDetails serviceName={this.props.serviceName} operationName={row.operationName} type={row.type} alertDetailsStore={alertDetailsStore} />);
        }
        return null;
    }

    render() {
        const results = this.props.results.map((result, index) => ({...result, alertId: index}));

        const selectRowProp = {
            clickToSelect: true,
            clickToExpand: true,
            className: 'selected-row',
            mode: 'checkbox',
            hideSelectColumn: true,
            selected: this.state.selected
        };

        const options = {
            page: 1,  // which page you want to show as default
            sizePerPage: 15,  // which size per page you want to locate as default
            pageStartIndex: 1, // where to start counting the pages
            paginationSize: 3,  // the pagination bar size.
            prePage: 'Prev', // Previous page button text
            nextPage: 'Next', // Next page button text
            firstPage: 'First', // First page button text
            lastPage: 'Last', // Last page button text
            paginationShowsTotal: (start, to, total) =>
                (<p>Showing alerts { start } to { to } out of { total }</p>),
            hideSizePerPage: true, // Hide page size bar
            defaultSortName: 'isUnhealthy',
            defaultSortOrder: 'asc',  // default sort order
            expanding: this.state.expanding,
            onExpand: this.handleExpand,
            expandBodyClass: 'expand-row-body'
        };

        const tableHeaderStyle = { border: 'none' };

        return (
            <div>
                <header>
                    <div>
                        <div className="alerts-title__header">{this.getUnhealthyAlerts()} Unhealty</div>
                        <div>out of {this.props.results.length} alerts for {this.props.serviceName}</div>
                    </div>
                </header>
                <BootstrapTable
                    className="alerts-panel"
                    data={results}
                    tableStyle={{ border: 'none' }}
                    trClassName={AlertsTable.rowClassNameFormat}
                    options={options}
                    pagination
                    expandableRow={() => true}
                    expandComponent={this.expandComponent}
                    selectRow={selectRowProp}
                    multiColumnSort={2}
                >
                    <TableHeaderColumn
                        dataField="alertId"
                        hidden
                        isKey
                    >AlertId</TableHeaderColumn>
                    <TableHeaderColumn
                        caretRender={AlertsTable.getCaret}
                        dataFormat={AlertsTable.nameColumnFormatter}
                        dataField="operationName"
                        width="30"
                        dataSort
                        thStyle={tableHeaderStyle}
                        headerText={'Operation Name'}
                    ><AlertsTable.Header name="Operation"/></TableHeaderColumn>
                    <TableHeaderColumn
                        caretRender={AlertsTable.getCaret}
                        dataField="type"
                        width="20"
                        dataFormat={AlertsTable.typeColumnFormatter}
                        dataSort
                        thStyle={tableHeaderStyle}
                        headerText={'Alert Type'}
                    ><AlertsTable.Header name="Alert Type"/></TableHeaderColumn>
                    <TableHeaderColumn
                        caretRender={AlertsTable.getCaret}
                        dataField="isUnhealthy"
                        width="8"
                        dataFormat={AlertsTable.statusColumnFormatter}
                        dataSort
                        thStyle={tableHeaderStyle}
                        headerText={'Status'}
                    ><AlertsTable.Header name="Status"/></TableHeaderColumn>
                    <TableHeaderColumn
                        caretRender={AlertsTable.getCaret}
                        dataFormat={AlertsTable.timestampColumnFormatter}
                        dataField="timestamp"
                        width="20"
                        dataSort
                        thStyle={tableHeaderStyle}
                        headerText={'Alert Timestamp'}
                    ><AlertsTable.Header name="Status Changed"/></TableHeaderColumn>
                    <TableHeaderColumn
                        caretRender={AlertsTable.getCaret}
                        dataField="trend"
                        width="20"
                        dataFormat={AlertsTable.trendColumnFormatter}
                        dataSort
                        thStyle={tableHeaderStyle}
                        headerText={'trend'}
                    ><AlertsTable.Header name="Last 1 Hour Trend"/></TableHeaderColumn>
                </BootstrapTable>
            </div>
        );
    }
}