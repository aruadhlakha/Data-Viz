var salesData;
var truncLengh = 30;

window.onload = PlotBarChart;

function BuildBar(id, chartData, options, level) {
    // d3.selectAll("#" + id + " .innerCont").remove();
    // $("#" + id).append(chartInnerDiv);
    chart = d3.select("#" + id + " .innerCont");

    var margin = { top: 50, right: 10, bottom: 30, left: 50 },
        width = $(chart[0]).outerWidth() - margin.left - margin.right,
        height = $(chart[0]).outerHeight() - margin.top - margin.bottom
    var xVarName;
    var yVarName = options[0].yaxis;

    if (level == 1) {
        xVarName = options[0].xaxisl1;
    }
    else {
        xVarName = options[0].xaxis;
    }

    var xAry = runningData.map(function (el) {
        return el[xVarName];
    });

    var yAry = runningData.map(function (el) {
        return el[yVarName];
    });

    var capAry = runningData.map(function (el) { return el.caption; });


    var x = d3.scale.ordinal().domain(xAry).rangeRoundBands([0, width], .5);
    var y = d3.scale.linear().domain([0, d3.max(runningData, function (d) { return d[yVarName]; })]).range([height, 0]);
    var rcolor = d3.scale.ordinal().range(runningColors);

    chart = chart
        .append("svg")  //append svg element inside #chart
        .attr("width", width + margin.left + margin.right)    //set width
        .attr("height", height + margin.top + margin.bottom);  //set height

    var defs = chart.append("defs");

    var filter = defs.append("filter")
        .attr("id", "dropshadow")

    //Create blur effect
    filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha") // Create blur effect acrossborder, SourceGraphic
        .attr("stdDeviation", 5) // Amount of blur
        .attr("result", "blur");

    //Drop Shadow - Intensity and direction of shadow
    filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 5)
        .attr("dy", 5)
        .attr("result", "offsetBlur");

    //How to merge shadow and svg
    /*
    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in", "offsetBlur")
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");
    */
    var feMerge = filter.append("feBlend")
        .attr("in", "SourceGraphic")
        .attr("in2", "blurOut")
        .attr("mode", "normal")


    var bar = chart.selectAll("g")
        .data(runningData)
        .enter()
        .append("g")
        .attr("filter", "url(#dropshadow)")
        .attr("transform", function (d) {
            return "translate(" + x(d[xVarName]) + ", 0)";
        });

    var ctrtxt = 0;
    var xAxis = d3.svg.axis()
        .scale(x)
        //.orient("bottom").ticks(xAry.length).tickValues(capAry);  //orient bottom because x-axis tick labels will appear on the
        .orient("bottom").ticks(xAry.length)
        .tickFormat(function (d) {
            if (level == 0) {
                var mapper = options[0].captions[0]
                return mapper[d]
            }
            else {
                var r = runningData[ctrtxt].caption;
                ctrtxt += 1;
                return r;
            }
        });

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left").ticks(5); //orient left because y-axis tick labels will appear on the left side of the axis.

    bar.append("rect")
        .attr("y", function (d) {
            return y(d.Total) + margin.top - 15;
        })
        .attr("x", function (d) {
            return (margin.left);
        })
        .on("mouseenter", function (d) {
            d3.select(this)
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .attr("height", function (d) {
                    return height - y(d[yVarName]) + 5;
                })
                .attr("y", function (d) {
                    return y(d.Total) + margin.top - 20;
                })
                .attr("width", x.rangeBand() + 10)
                .attr("x", function (d) {
                    return (margin.left - 5);
                })
                .transition()
                .duration(200);


        })
        .on("mouseleave", function (d) {
            d3.select(this)
                .attr("stroke", "none")
                .attr("height", function (d) {
                    return height - y(d[yVarName]);;
                })
                .attr("y", function (d) {
                    return y(d[yVarName]) + margin.top - 15;
                })
                .attr("width", x.rangeBand())
                .attr("x", function (d) {
                    return (margin.left);
                })
                .transition()
                .duration(200);

        })
        .on("click", function (d) {
            if (this._listenToEvents) {
                // Reset inmediatelly
                d3.select(this).attr("transform", "translate(0,0)")
                // Change level on click if no transition has started                
                path.each(function () {
                    this._listenToEvents = false;
                });
            }
            d3.selectAll("#" + id + " svg").remove();
            if (level == 1) {
                TransformChartData(chartData, options, 0, d[xVarName]);
                BuildBar(id, chartData, options, 0);
            }
            else {
                var nonSortedChart = chartData.sort(function (a, b) {
                    return parseFloat(b[options[0].yaxis]) - parseFloat(a[options[0].yaxis]);
                });
                TransformChartData(nonSortedChart, options, 1, d[xVarName]);
                BuildBar(id, nonSortedChart, options, 1);
            }

        });


    bar.selectAll("rect").attr("height", function (d) {
        return height - y(d[yVarName]);
    })
        .transition().delay(function (d, i) { return i * 300; })
        .duration(1000)
        .attr("width", x.rangeBand()) //set width base on range on ordinal data
        .transition().delay(function (d, i) { return i * 300; })
        .duration(1000);


    var grads = defs.selectAll("linearGradient")
        .data(runningData)
        .enter()
        .append("linearGradient")
        .attr('y1', "0%")
        .attr('x1', "0%")
        .attr('x2', "50%")
        .attr('y2', "50%")
        .attr("spreadMethod", "pad")
        //.attr("gradientUnits", "userSpaceOnUse")
        .attr("id", function (d, i) { return "grad" + id + i; });

    grads.append("stop")
        .attr("offset", "0%")
        .attr("stop-opacity", 1)
        .attr("stop-color", "white");

    grads.append("stop")
        .attr("offset", "100%")
        .attr("stop-opacity", 1)
        .attr("stop-color", function (d, i) {
            return d3.rgb(rcolor(d[xVarName]));
        });


    i = 0;
    bar.selectAll("rect").style("fill", function (d) {
        var ret = "url(#grad" + id + i + ")";
        i++;
        return ret;
    })
        .style("opacity", function (d) {
            return d["op"];
        });

    //bar.selectAll("rect").style("fill", function (d) {
    //    return rcolor(d[xVarName]);
    //})

    bar.append("text")
        .attr("x", x.rangeBand() / 2 + margin.left - 10)
        .attr("y", function (d) { return y(d[yVarName]) + margin.top - 25; })
        .attr("dy", ".35em")
        .text(function (d) {
            return d[yVarName];
        });

    bar.append("svg:title")
        .text(function (d) {
            //return xVarName + ":  " + d["title"] + " \x0A" + yVarName + ":  " + d[yVarName];
            return d["title"] + " (" + d[yVarName] + ")";
        });

    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top - 15) + ")")
        .call(xAxis)
        .append("text")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
    //.text("Year");

    chart.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin.left + "," + (margin.top - 15) + ")")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
    //.text("Sales Data");

    if (level == 1) {
        chart.select(".x.axis")
            .selectAll("text");
        // .attr("transform", " translate(-20,10) rotate(-35)");
    }

}

function TransformChartData(chartData, opts, level, filter) {
    var result = [];
    var resultColors = [];
    var counter = 0;
    var hasMatch;
    var xVarName;
    var yVarName = opts[0].yaxis;

    if (level == 1) {
        xVarName = opts[0].xaxisl1;

        for (var i in chartData) {
            hasMatch = false;
            for (var index = 0; index < result.length; ++index) {
                var data = result[index];

                if ((data[xVarName] == chartData[i][xVarName]) && (chartData[i][opts[0].xaxis]) == filter) {
                    result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName];
                    hasMatch = true;
                    break;
                }

            }
            if ((hasMatch == false) && ((chartData[i][opts[0].xaxis]) == filter)) {
                if (result.length < 9) {
                    ditem = {}
                    ditem[xVarName] = chartData[i][xVarName];
                    ditem[yVarName] = chartData[i][yVarName];
                    ditem["caption"] = chartData[i][xVarName];
                    ditem["title"] = chartData[i][xVarName];
                    ditem["op"] = 1.0 - parseFloat("0." + (result.length));
                    result.push(ditem);

                    resultColors[counter] = opts[0].color[0][chartData[i][opts[0].xaxis]];

                    counter += 1;
                }
            }
        }
    }
    else {
        xVarName = opts[0].xaxis;

        for (var i in chartData) {
            hasMatch = false;
            for (var index = 0; index < result.length; ++index) {
                var data = result[index];

                if (data[xVarName] == chartData[i][xVarName]) {
                    result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName];
                    hasMatch = true;
                    break;
                }
            }
            if (hasMatch == false) {
                ditem = {};
                ditem[xVarName] = chartData[i][xVarName];
                ditem[yVarName] = chartData[i][yVarName];
                ditem["caption"] = opts[0].captions != undefined ? opts[0].captions[0][chartData[i][xVarName]] : "";
                ditem["title"] = opts[0].captions != undefined ? opts[0].captions[0][chartData[i][xVarName]] : "";
                ditem["op"] = 1;
                result.push(ditem);

                resultColors[counter] = opts[0].color != undefined ? opts[0].color[0][chartData[i][xVarName]] : "";

                counter += 1;
            }
        }
    }


    runningData = result;
    runningColors = resultColors;
    return;
}


var chartData = [
    {
        "State": "Florida",
        "City": "Jacksonville",
        "Total": 28
    },
    {
        "State": "Florida",
        "City": "Miami",
        "Total": 25
    },
    {
        "State": "Florida",
        "City": "Orlando",
        "Total": 20
    },
    {
        "State": "Florida",
        "City": "Tampa",
        "Total": 11
    },

    {
        "State": "Texas",
        "City": "Houston",
        "Total": 50
    },
    {
        "State": "Texas",
        "City": "San Antonio",
        "Total": 40
    },
    {
        "State": "Texas",
        "City": "Austin",
        "Total": 27
    },
    {
        "State": "Texas",
        "City": "Fort Worth",
        "Total": 13
    },
    {
        "State": "California",
        "City": "Los Angeles",
        "Total": 78
    },
    {
        "State": "California",
        "City": "Bakersfield",
        "Total": 22
    },
    {
        "State": "California",
        "City": "Fresno",
        "Total": 18
    },
    {
        "State": "California",
        "City": "Long Beach",
        "Total": 17
    }
];

chartOptions = [{
    "captions": [{ "California": "California", "Texas": "Texas", "Florida": "Florida" }],
    "color": [{ "California": "#FFA500", "Texas": "#0070C0", "Florida": "#ff0000" }],
    "xaxis": "State",
    "xaxisl1": "City",
    "yaxis": "Total"
}]

function PlotBarChart() {
    TransformChartData(chartData, chartOptions);
    BuildBar("chart", chartData, chartOptions);
}
