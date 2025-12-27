/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 57.0, "KoPercent": 43.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.535, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.16, 500, 1500, "Get Ticket Active"], "isController": false}, {"data": [0.0, 500, 1500, "POST Create User"], "isController": false}, {"data": [1.0, 500, 1500, "POST Login"], "isController": false}, {"data": [0.0, 500, 1500, "POST Create Ticket"], "isController": false}, {"data": [1.0, 500, 1500, "POST Login-0"], "isController": false}, {"data": [1.0, 500, 1500, "POST Login-1"], "isController": false}, {"data": [1.0, 500, 1500, "POST Login-2"], "isController": false}, {"data": [0.12, 500, 1500, "GET My Ticket"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 200, 86, 43.0, 229.58499999999998, 44, 6624, 74.0, 214.0, 312.94999999999976, 4467.090000000007, 15.780337699226761, 208.0612098341092, 16.579371400110464], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Ticket Active", 25, 21, 84.0, 108.16000000000001, 61, 405, 73.0, 236.60000000000028, 377.69999999999993, 405.0, 2.099781622711238, 53.35602519213002, 2.378658869477574], "isController": false}, {"data": ["POST Create User", 25, 21, 84.0, 782.36, 115, 6624, 135.0, 3496.4000000000033, 5979.299999999998, 6624.0, 2.952290977798772, 4.245763462446859, 2.9321093011927255], "isController": false}, {"data": ["POST Login", 25, 0, 0.0, 213.84, 186, 363, 206.0, 251.00000000000014, 341.99999999999994, 363.0, 3.0200531529354917, 113.33162354282435, 6.763857325138922], "isController": false}, {"data": ["POST Create Ticket", 25, 22, 88.0, 437.2800000000001, 60, 3684, 71.0, 2754.8000000000015, 3540.5999999999995, 3684.0, 2.1287465940054497, 3.1991069908038146, 1.8813629566161445], "isController": false}, {"data": ["POST Login-0", 25, 0, 0.0, 74.11999999999999, 62, 134, 71.0, 85.00000000000001, 120.19999999999996, 134.0, 3.0704986489805948, 2.143951693380005, 2.45400009211496], "isController": false}, {"data": ["POST Login-1", 25, 0, 0.0, 71.91999999999999, 57, 93, 71.0, 85.60000000000001, 91.5, 93.0, 3.0693677102516883, 2.164144030079804, 2.1671414594843466], "isController": false}, {"data": ["POST Login-2", 25, 0, 0.0, 67.4, 44, 223, 60.0, 74.4, 178.5999999999999, 223.0, 3.080714725816389, 111.28480244916821, 2.262399876771411], "isController": false}, {"data": ["GET My Ticket", 25, 22, 88.0, 81.59999999999998, 61, 215, 72.0, 124.80000000000001, 189.19999999999993, 215.0, 2.1191828430957025, 4.396807715944732, 1.9412045965075866], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 85, 98.83720930232558, 42.5], "isController": false}, {"data": ["Test failed: code expected to equal /\\n\\n****** received  : 20[[[7]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 1, 1.1627906976744187, 0.5], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 200, 86, "500/Internal Server Error", 85, "Test failed: code expected to equal /\\n\\n****** received  : 20[[[7]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get Ticket Active", 25, 21, "500/Internal Server Error", 21, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST Create User", 25, 21, "500/Internal Server Error", 21, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Create Ticket", 25, 22, "500/Internal Server Error", 22, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET My Ticket", 25, 22, "500/Internal Server Error", 21, "Test failed: code expected to equal /\\n\\n****** received  : 20[[[7]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
