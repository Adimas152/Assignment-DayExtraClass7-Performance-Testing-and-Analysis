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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.44875, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.1, 500, 1500, "Get Ticket Active"], "isController": false}, {"data": [0.0, 500, 1500, "POST Create User"], "isController": false}, {"data": [0.69, 500, 1500, "POST Login"], "isController": false}, {"data": [0.0, 500, 1500, "POST Create Ticket"], "isController": false}, {"data": [0.8, 500, 1500, "POST Login-0"], "isController": false}, {"data": [0.9, 500, 1500, "POST Login-1"], "isController": false}, {"data": [1.0, 500, 1500, "POST Login-2"], "isController": false}, {"data": [0.1, 500, 1500, "GET My Ticket"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 400, 172, 43.0, 710.3125, 46, 10959, 102.0, 2661.8, 3307.9499999999994, 9286.890000000003, 22.89377289377289, 301.7371320899153, 24.04203869047619], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Ticket Active", 50, 45, 90.0, 393.9, 61, 3501, 99.5, 759.6999999999998, 3231.0499999999997, 3501.0, 3.006433768264085, 76.30587269256208, 3.4057257531116587], "isController": false}, {"data": ["POST Create User", 50, 44, 88.0, 1299.0, 113, 10850, 148.5, 4115.299999999999, 9520.799999999996, 10850.0, 4.365668383829564, 6.303274796996421, 4.33582494761198], "isController": false}, {"data": ["POST Login", 50, 0, 0.0, 961.1800000000001, 184, 2791, 242.5, 2731.8, 2768.9, 2791.0, 4.4107268877911086, 165.51855675502821, 9.87003517554693], "isController": false}, {"data": ["POST Create Ticket", 50, 39, 78.0, 1649.92, 63, 10959, 104.0, 6483.599999999999, 8929.749999999996, 10959.0, 2.988643156007173, 4.587683988344292, 2.64133013299462], "isController": false}, {"data": ["POST Login-0", 50, 0, 0.0, 563.7600000000001, 60, 2629, 86.0, 2529.5, 2571.3999999999996, 2629.0, 4.456725198324271, 3.111873551564311, 3.5533678915233087], "isController": false}, {"data": ["POST Login-1", 50, 0, 0.0, 338.73999999999995, 57, 2648, 81.0, 2331.499999999997, 2586.5, 2648.0, 4.461895413171516, 3.1459848518650726, 3.150342171604498], "isController": false}, {"data": ["POST Login-2", 50, 0, 0.0, 58.37999999999999, 46, 96, 56.0, 70.5, 80.39999999999995, 96.0, 4.463887152932774, 161.24920487010087, 3.2781671279350055], "isController": false}, {"data": ["GET My Ticket", 50, 44, 88.0, 417.6199999999999, 62, 3623, 92.0, 2792.399999999996, 3275.35, 3623.0, 2.979205148066496, 6.037545432878508, 2.7289984657093487], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 149, 86.62790697674419, 37.25], "isController": false}, {"data": ["Test failed: code expected to equal /\\n\\n****** received  : 20[[[7]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 23, 13.372093023255815, 5.75], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 400, 172, "500/Internal Server Error", 149, "Test failed: code expected to equal /\\n\\n****** received  : 20[[[7]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 23, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get Ticket Active", 50, 45, "500/Internal Server Error", 33, "Test failed: code expected to equal /\\n\\n****** received  : 20[[[7]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 12, "", "", "", "", "", ""], "isController": false}, {"data": ["POST Create User", 50, 44, "500/Internal Server Error", 44, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Create Ticket", 50, 39, "500/Internal Server Error", 39, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET My Ticket", 50, 44, "500/Internal Server Error", 33, "Test failed: code expected to equal /\\n\\n****** received  : 20[[[7]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 11, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
