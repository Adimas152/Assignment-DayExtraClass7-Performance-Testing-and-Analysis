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

    var data = {"OkPercent": 54.19315773539207, "KoPercent": 45.80684226460793};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.47503646822447915, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.021165780141843973, 500, 1500, "Get Ticket Active"], "isController": false}, {"data": [0.03663887670030715, 500, 1500, "POST Create User"], "isController": false}, {"data": [0.785024154589372, 500, 1500, "POST Login"], "isController": false}, {"data": [0.034886288363877235, 500, 1500, "POST Create Ticket"], "isController": false}, {"data": [0.9991216512955643, 500, 1500, "POST Login-0"], "isController": false}, {"data": [0.9989020641194554, 500, 1500, "POST Login-1"], "isController": false}, {"data": [0.8535353535353535, 500, 1500, "POST Login-2"], "isController": false}, {"data": [0.061531651173085435, 500, 1500, "GET My Ticket"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 36333, 16643, 45.80684226460793, 235.6285745740777, 43, 13433, 73.0, 875.0, 1139.9500000000007, 2318.970000000005, 200.1299938858808, 2284.6878311384244, 210.17105655663548], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Ticket Active", 4512, 4231, 93.77216312056737, 205.6708776595742, 52, 7656, 68.0, 287.0, 761.5499999999929, 3637.279999999995, 26.7189359799608, 301.24824706947396, 30.267544664799342], "isController": false}, {"data": ["POST Create User", 4558, 4087, 89.66652040368582, 257.9743308468616, 52, 11274, 67.0, 876.0, 903.0500000000002, 6070.619999999944, 25.106446264603655, 36.3222058199805, 24.93482016709172], "isController": false}, {"data": ["POST Login", 4554, 0, 0.0, 550.8210364514716, 152, 6005, 344.0, 1119.0, 1534.5, 2566.199999999997, 25.792055095545006, 967.8821300356524, 57.702484481723545], "isController": false}, {"data": ["POST Create Ticket", 4529, 4091, 90.32899094722897, 228.69419297858263, 52, 13433, 67.0, 318.0, 894.0, 1734.499999999999, 25.655259923073874, 38.37958722660919, 22.673838115607282], "isController": false}, {"data": ["POST Login-0", 4554, 0, 0.0, 76.0234958278438, 52, 2375, 65.0, 90.0, 114.0, 285.4499999999998, 25.84607002389371, 18.04681647176172, 20.593881156461233], "isController": false}, {"data": ["POST Login-1", 4554, 0, 0.0, 73.38032498902072, 50, 878, 64.0, 84.0, 108.0, 285.0, 25.83434027127759, 18.215228199084397, 18.240457047005567], "isController": false}, {"data": ["POST Login-2", 4554, 0, 0.0, 401.2902942468167, 43, 5868, 200.0, 964.5, 1374.25, 2395.4999999999945, 25.81383880238299, 932.4745090821746, 18.95703787050001], "isController": false}, {"data": ["GET My Ticket", 4518, 4234, 93.71403275785745, 89.68636564851717, 52, 4229, 68.0, 111.0, 281.0500000000002, 329.0, 26.13494377342774, 50.59887043412177, 23.940016854956266], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 16326, 98.09529531935348, 44.93435719593758], "isController": false}, {"data": ["Test failed: code expected to equal /\\n\\n****** received  : 20[[[7]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 317, 1.904704680646518, 0.8724850686703548], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 36333, 16643, "500/Internal Server Error", 16326, "Test failed: code expected to equal /\\n\\n****** received  : 20[[[7]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 317, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get Ticket Active", 4512, 4231, "500/Internal Server Error", 4075, "Test failed: code expected to equal /\\n\\n****** received  : 20[[[7]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 156, "", "", "", "", "", ""], "isController": false}, {"data": ["POST Create User", 4558, 4087, "500/Internal Server Error", 4087, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Create Ticket", 4529, 4091, "500/Internal Server Error", 4091, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET My Ticket", 4518, 4234, "500/Internal Server Error", 4073, "Test failed: code expected to equal /\\n\\n****** received  : 20[[[7]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 161, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
