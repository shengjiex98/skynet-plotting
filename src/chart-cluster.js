'use strict';

import { tableCommonOptions, colors } from "./config.js"
import { updateLabels, updateTableHeight } from "./util.js"
import { round, sqr, rad } from "./my-math.js"

/**
 *  This function is for the moon of a planet.
 *  @returns {any[]}:
 */
export function cluster() {
    document.getElementById('input-div').insertAdjacentHTML('beforeend',
        '<form title="Cluster Diagram" id="cluster-form">\n' +
        '<div class="row">\n' +
        '<div class="col-sm-4 des">Dist. (kpc)</div>\n' +
        '<div class="col-sm-5 range"><input type="range" title="d" name="d"></div>\n' +
        '<div class="col-sm-3 text"><input type="number" title="d" name="d-num" class="field"></div>\n' +
        '</div>\n' +
        '<div class="row">\n' +
        '<div class="col-sm-4 des">+/- Range (%)</div>\n' +
        '<div class="col-sm-5 range"><input type="range" title="R" name="r"></div>\n' +
        '<div class="col-sm-3 text"><input type="number" title="R" name="r-num" class="field"></div>\n' +
        '</div>\n' +
        '<div class="row">\n' +
        '<div class="col-sm-4 des">log(Age (yr))</div>\n' +
        '<div class="col-sm-5 range"><input type="range" title="Age" name="age"></div>\n' +
        '<div class="col-sm-3 text"><input type="number" title="Age" name="age-num" class="field"></div>\n' +
        '</div>\n' +
        '<div class="row">\n' +
        '<div class="col-sm-4 des">Reddening (mag)</div>\n' +
        '<div class="col-sm-5 range"><input type="range" title="Reddening" name="red"></div>\n' +
        '<div class="col-sm-3 text"><input type="number" title="Reddening" name="red-num" class="field"></div>\n' +
        '</div>\n' +
        '<div class="row">\n' +
        '<div class="col-sm-4 des">Metallicity (solar)</div>\n' +
        '<div class="col-sm-5 range"><input type="range" title="Metallicity" name="metal"></div>\n' +
        '<div class="col-sm-3 text"><input type="number" title="Metallicity" name="metal-num" class="field"></div>\n' +
        '</div>\n' +
        '</form>\n' +
        '<form title="Filters" id="filter-form">\n' +
        '<div class="row">\n' +
        '<div class="col-sm-6"><b>Select Filters:</b></div>\n'+
        '</div>\n'+
        '<div class="row">\n' +
        '<div class="col-sm-4 des">Blue Color</div>\n'+
        '<div class="col-sm-4 des">Red Color</div>\n'+
        '<div class="col-sm-4 des">Luminosity</div>\n'+
        '</div>\n' +
        '<div class="row">\n' +
        '<div class="col-sm-4"><select name="blue-color-filter" style="width: 100%;" title="Select Blue Color Filter">\n'+
        '<option value="B" title="B filter" selected>B</option></div>\n'+
        '<option value="V" title="V filter">V</option></select></div>\n'+
        '<div class="col-sm-4"><select name="red-color-filter" style="width: 100%;" title="Red Color Filter" disabled>\n'+
        '<option value="V" title="V filter" selected>V</option></div>\n'+
        '<option value="B" title="B filter">B</option></select></div>\n'+
        '<div class="col-sm-4"><select name="luminosity-filter" style="width: 100%;" title="Select Luminosity Filter">\n'+
        '<option value="V" title="V filter" selected>V</option></div>\n'+
        '<option value="B" title="B filter">B</option></select></div>\n'+
        '</div>\n' +
        '</form>\n');

    // Link each slider with corresponding text box
    let clusterForm = document.getElementById("cluster-form");
    let filterForm  = document.getElementById("filter-form");
    linkInputs(clusterForm.elements['d'], clusterForm.elements['d-num'], 0.1, 100, 0.01, 3, true);
    linkInputs(clusterForm.elements['r'], clusterForm.elements['r-num'], 0, 100, 0.01, 100);
    linkInputs(clusterForm.elements['age'], clusterForm.elements['age-num'], 6, 10, 0.01, 6);
    linkInputs(clusterForm.elements['red'], clusterForm.elements['red-num'], 0, 1, 0.01, 0);
    linkInputs(clusterForm.elements['metal'], clusterForm.elements['metal-num'], -3, 1, 0.01, -3);

    let tableData = generateclusterData();

    let chartData = [];

    // create table
    let container = document.getElementById('table-div');
    let hot = new Handsontable(container, Object.assign({}, tableCommonOptions, {
        data: tableData,
        colHeaders: [ filterForm.elements["blue-color-filter"].value + ' mag', filterForm.elements["red-color-filter"].value + ' mag'],
        maxCols: 2,
        columns: [
            { data: 'x', type: 'numeric', numericFormat: { pattern: { mantissa: 2 } } },
            { data: 'y', type: 'numeric', numericFormat: { pattern: { mantissa: 2 } } },
        ],
    }));

    // create chart
    let ctx = document.getElementById("myChart").getContext('2d');
    let myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Data',
                    data: chartData,
                    backgroundColor: colors['red'],
                    fill: false,
                    showLine: false,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    immutableLabel: false,
                }, {
                    label: 'Model',
                    data: null, // will be generated later
                    borderColor: colors['purple'],
                    backgroundColor: colors['white-0'],
                    borderWidth: 2,
                    lineTension: 0.1,
                    pointRadius: 0,
                    fill: false,
                    immutableLabel: true,
                }
            ]
        },
        options: {
            hover: {
                mode: 'nearest'
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        return '(' + round(tooltipItem.xLabel, 2) + ', ' +
                               round(tooltipItem.yLabel, 2) + ')';
                    },
                },
            },
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                }],
                yAxes: [{
                    ticks: {
                        reverse: true,
                        suggestedMin: 0,
                    },
                }],
            }
        }
    });
    myChart.options.scales.yAxes[0].ticks.reverse = true;

    let update = function () {
        updateTableHeight(hot);
        updateScatter(tableData, myChart);
        updateFormula(tableData, clusterForm, myChart);
    };

    // link chart to table
    hot.updateSettings({
        afterChange: update,
        afterRemoveRow: update,
        afterCreateRow: update,
    });

    /**
     *  This part of code (throttle) limits the maximum fps of the chart to change, so that it
     *  is possible to increase the sampling precision without hindering performance.
     */
    let changed = false;        // Indicates whether a change occurred while waiting for lock
    let lock = false;           // Lock for throttle

    let fps = 100;
    let frameTime = Math.floor(1000 / fps);

    let callback = () => {
        if (changed) {
            changed = false;
            updateFormula(tableData, clusterForm, myChart);
            setTimeout(callback, frameTime);
        } else {
            lock = false;
        }
    }

    // link chart to model form (slider + text)
    clusterForm.oninput = function () {
        if (!lock) {
            lock = true;
            updateFormula(tableData, clusterForm, myChart);
            setTimeout(callback, frameTime);
        } else {
            changed = true;
        }
    };

    filterForm.oninput = function (){
        let red  = filterForm.elements["red-color-filter"];
        let blue = filterForm.elements["blue-color-filter"];
        let lum  = filterForm.elements["luminosity-filter"];
        if (red.value === blue.value){
            red.value = red.options[(red.selectedIndex+1)%2].value;
        }
    }

    updateScatter(tableData, myChart);
    updateFormula(tableData, clusterForm, myChart);
    
    myChart.options.title.text = "Title"
    myChart.options.scales.xAxes[0].scaleLabel.labelString = "x";
    myChart.options.scales.yAxes[0].scaleLabel.labelString = "y";
    updateLabels(myChart, document.getElementById('chart-info-form'));

    return [hot, myChart];
}

/**
 *  This function takes a form to obtain the 4 parameters (a, p, phase, tilt) that determines the
 *  relationship between a moon's angular distance and Julian date, and generates a dataset that
 *  spans over the range determined by the max and min value present in the table.
 *  @param table:   A table used to determine the max and min value for the range
 *  @param form:    A form containing the 4 parameters (amplitude, period, phase, tilt)
 *  @param chart:   The Chartjs object to be updated.
 */
/**
 *  This function takes a form to obtain the 4 parameters (a, p, phase, tilt) that determines the
 *  relationship between a moon's angular distance and Julian date, and generates a dataset that
 *  spans over the range determined by the max and min value present in the table.
 *  @param table:   A table used to determine the max and min value for the range
 *  @param form:    A form containing the 4 parameters (amplitude, period, phase, tilt)
 *  @param chart:   The Chartjs object to be updated.
 */
 function updateFormula(table, form, chart) {
    // Can't just set min and max to the first values in the table because it might be invalid
    let min = null;
    let max = null;
    for (let i = 0; i < table.length; i++) {
        let x = table[i]['x'];
        let y = table[i]['y'];
        if (x === '' || y === '' || x === null || y === null) {
            continue;
        }
        if (max === null || x > max) {
            max = x;
        }
        if (min === null || x < min) {
            min = x;
        }
    }
    chart.data.datasets[1].data = HRGenerator(
        form.elements['d-num'].value,
        form.elements['r-num'].value,
        form.elements['age-num'].value,
        form.elements['red-num'].value,
        form.elements['metal-num'].value,
        -8,
        8,
        2000
    );
    chart.update(0);
}

/**
*  This function links a <input type="range"> and a <input type="number"> together so changing the value
*  of one updates the other. This function also sets the min, max and step properties for both the inputs.
*  @param slider:  A <input type="range"> to be linked.
*  @param number:  A <input type"number"> to be linked.
*  @param min:     The min value for both inputs.
*  @param max:     The max value for both inputs.
*  @param step:    The step of changes for both inputs.
*  @param value:   The initial value of both inputs.
*  @param log:     A true or false value that determines whether the slider uses logarithmic scale.
*/
function linkInputs(slider, number, min, max, step, value, log = false) {
    number.min = min;
    number.max = max;
    number.step = step;
    number.value = value;
    if (!log) {
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = value;

        slider.oninput = function () {
            number.value = slider.value;
        };
        number.oninput = function () {
            slider.value = number.value;
        };
    } else {
        slider.min = Math.log(min * 0.999);
        slider.max = Math.log(max * 1.001);
        slider.step = (Math.log(max) - Math.log(min)) / ((max - min) / step);
        slider.value = Math.log(value);
        slider.oninput = function () {
            let x = Math.exp(slider.value);
            if (x > max) {
                number.value = max;
            } else if (x < min) {
                number.value = min;
            } else {
                number.value = round(x, 2);
            }
        };
        number.oninput = function () {
            slider.value = Math.log(number.value);
        }
    }
}

/**
*  This function generates the data used for functions "updateFormula" and "clusterGenerator."
*
*  @param d:            Distance to the Cluster
*  @param r:            % of the range
*  @param age:          Age of the Cluster
*  @param reddening:    The reddening of the observation
*  @param metallicity:  Metallicity of the cluster
*  @param start:        The starting point of the data points
*  @param end:          The end point of the data points
*  @param steps:        Steps generated to be returned in the array. Default is 500
*  @returns {Array}
*/
function HRGenerator(dist, range, age, reddening, metallicity, start, end, steps = 500) {
    //To Change
    let data = [];

    let y = start;
    let step = (end - start) / steps;
    for (let i = 0; i < steps; i++) {
        let x3 = 0.2*Math.pow(( (y-8)/(-22.706+2.7236*age-8) ),3);
        let x2 = -0.0959+0.1088*y+0.0073*Math.pow(y,2)
        let x1 = x3+x2;
        if (x1<=2){
            data.push({
                // actual magnitude is less the further away the object is (and less is more for mag)
                y: y-5*Math.log10(dist/0.01),
                // x =-0.0959+0.1088*y+0.0073*y^2
                x: x1,

            });
        }
        y += step;
    }
    return data;
}

/**
*  This function returns an array of data points that represent a cluster of stars with randomly
*  generated parameters. This function also introduces noise to all data points.
*  @returns    {Array}
*/
function generateclusterData() {
    /**
     *  ln(750) = 6.62
     *  ln(1) = 0
     */
    let returnData = [];
    let clusterData = HRGenerator(Math.random()*99.9+0.1,
                              100,
                              Math.random()*4+6,
                              Math.random()*100,
                              Math.random()*100,
                              -8,8,100);
    for (let i=0; i<clusterData.length; i++){
        let y= clusterData[i].y*(1 + (Math.random()-0.5) * 0.40);
        let x= clusterData[i].x*(1 + (Math.random()-0.5) * 0.40)+y;
        returnData.push({
            y: y,
            x: x
        })
    }

    return returnData;
}

function updateScatter(tableData, myChart, dataSet = 0, xKey = 'x', yKey = 'y') {
    let start = 0;
    let chart = myChart.data.datasets[dataSet].data;
    for (let i = 0; i < tableData.length; i++) {
        if (tableData[i][xKey] === '' || tableData[i][yKey] === '' ||
            tableData[i][xKey] === null || tableData[i][yKey] === null) {
            continue;
        }
        //B-V,V
        chart[start++] = { x: tableData[i][xKey]-tableData[i][yKey], y: tableData[i][yKey] };
    }
    while (chart.length !== start) {
        chart.pop();
    }
    myChart.update(0);
}