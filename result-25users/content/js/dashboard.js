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

    var data = {"OkPercent": 55.868018598397846, "KoPercent": 44.131981401602154};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5345218755251807, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.11177263536283981, 500, 1500, "Get Ticket Active"], "isController": false}, {"data": [0.04137776783717289, 500, 1500, "POST Create User"], "isController": false}, {"data": [0.9721289456010745, 500, 1500, "POST Login"], "isController": false}, {"data": [0.044740973312401885, 500, 1500, "POST Create Ticket"], "isController": false}, {"data": [0.9994403402731139, 500, 1500, "POST Login-0"], "isController": false}, {"data": [0.9994403402731139, 500, 1500, "POST Login-1"], "isController": false}, {"data": [0.9897022610252966, 500, 1500, "POST Login-2"], "isController": false}, {"data": [0.11430496294632832, 500, 1500, "GET My Ticket"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 35702, 15756, 44.131981401602154, 137.1588986611397, 43, 8769, 68.0, 245.0, 472.8500000000022, 1275.8700000000208, 197.09834490830198, 2477.3933151105784, 206.97389774991996], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Ticket Active", 4451, 3888, 87.35115704336104, 116.56975960458311, 52, 3686, 67.0, 195.0, 307.39999999999964, 1042.5599999999904, 25.072807467201432, 513.1330528737826, 28.402789708939125], "isController": false}, {"data": ["POST Create User", 4471, 3981, 89.04048311339746, 197.5204652203084, 52, 8769, 66.0, 880.0, 898.3999999999996, 1537.5599999999995, 24.731034101280528, 35.76223354053157, 24.561974297853805], "isController": false}, {"data": ["POST Login", 4467, 0, 0.0, 251.33266174166152, 102, 2801, 206.0, 348.0, 512.0, 932.8799999999974, 24.939981017251966, 935.9068853026771, 55.79928513727597], "isController": false}, {"data": ["POST Create Ticket", 4459, 3944, 88.45032518501907, 205.6541825521415, 53, 8422, 66.0, 875.0, 896.0, 1529.7999999999993, 24.828500155908948, 37.2955065335594, 21.94315687607187], "isController": false}, {"data": ["POST Login-0", 4467, 0, 0.0, 72.3989254533244, 52, 2536, 64.0, 84.0, 104.0, 272.3199999999997, 24.960048277326422, 17.428158709266004, 19.89098793555759], "isController": false}, {"data": ["POST Login-1", 4467, 0, 0.0, 68.83792254309404, 51, 2431, 63.0, 79.0, 93.0, 196.63999999999942, 24.993845258611042, 17.622613551481614, 17.64702160349198], "isController": false}, {"data": ["POST Login-2", 4467, 0, 0.0, 110.0306693530334, 43, 2677, 72.0, 169.0, 362.0, 717.0, 24.993565569642918, 902.8437406455972, 18.354649715206516], "isController": false}, {"data": ["GET My Ticket", 4453, 3943, 88.5470469346508, 74.72580282955317, 53, 3285, 66.0, 86.0, 105.30000000000018, 291.0, 25.07206882572857, 51.987167886933584, 22.966406795442772], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 15756, 100.0, 44.131981401602154], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 35702, 15756, "500/Internal Server Error", 15756, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get Ticket Active", 4451, 3888, "500/Internal Server Error", 3888, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST Create User", 4471, 3981, "500/Internal Server Error", 3981, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Create Ticket", 4459, 3944, "500/Internal Server Error", 3944, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET My Ticket", 4453, 3943, "500/Internal Server Error", 3943, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
