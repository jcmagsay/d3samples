/// <reference path="../../../../../CommonContent/Content/TScripts/Utilities.ts" />
/// <reference path="../../../../../Marketplace/TenFour.MarketplacePortal/TScripts/Dashboard/Company.ts" />
var TenFour;
(function (TenFour) {
    var Dashboard;
    (function (Dashboard) {
        var Performance;
        (function (Performance) {
            var Models;
            (function (Models) {
                var Chart = (function () {
                    function Chart(chartId, h, w, m) {
                        this.h = h;
                        this.axis = { xAxis: d3.svg.axis(), yAxis: d3.svg.axis(), y2Axis: d3.svg.axis() };
                        this.appearance = new Properties.Appearance(h, m, w);
                        this.layout = new Properties.Layout(this.axis);
                        this.chartId = "#" + chartId;
                        this.appearance.height = h;
                        this.appearance.width = w;
                    }
                    Chart.prototype.init = function () {
                        this.createChartWrapper();
                        this.setupScale();
                        this.setupRanges();
                        this.setupAxis();
                        this.renderChart();
                    };
                    Chart.prototype.onNewData = function (data) {
                        this.chart.data(data).enter();
                        this.rescaleDomains(data);
                    };
                    Chart.prototype.setupScale = function () {
                        if (this.layout.xIsOrdinal)
                            this.xScale = d3.scale.ordinal();
                        if (this.layout.xIsTime)
                            this.xScale = d3.time.scale();
                        this.yScale = d3.scale.linear();
                        if (this.layout.y2IsLinear)
                            this.y2Scale = d3.scale.linear();
                    };
                    Chart.prototype.setupRanges = function () {
                        this.xScale.range([0, this.appearance.width]);
                        this.yScale.range([this.appearance.height, 0]);
                        if (this.layout.y2IsLinear)
                            this.y2Scale.range([this.appearance.height, 0]);
                    };
                    Chart.prototype.setupAxis = function () {
                        this.axis.xAxis.scale(this.xScale);
                        this.axis.yAxis.scale(this.yScale);
                        if (this.layout.y2IsLinear)
                            this.axis.y2Axis.scale(this.y2Scale);
                    };
                    Chart.prototype.renderChart = function () {
                        this.setupAxis();
                    };
                    Chart.prototype.rescaleDomains = function (data) {
                        this.xScale.domain(d3.extent(data.map(this.xMap)));
                        this.yScale.domain([0, d3.max(data.map(this.yMap))]);
                        if (this.layout.y2IsLinear)
                            this.y2Scale.domain([0, d3.max(data.map(this.y2Map))]);
                    };
                    Chart.prototype.renderAxis = function () {
                        this.createXaxis(this.chart);
                        this.createYaxis(this.chart);
                        if (this.layout.y2IsLinear)
                            this.createY2Axis(this.chart);
                    };
                    Chart.prototype.setupSelections = function () {
                    };
                    Chart.prototype.bufferSize = function () {
                        var a = this.appearance;
                        this.appearance.height = (a.height - a.margin.top - a.margin.bottom);
                        this.appearance.width = (a.width - a.margin.left - a.margin.right);
                    };
                    Chart.prototype.setXdomain = function (data, x, xmap) {
                        var appear = this.appearance;
                        if (this.layout.xIsTime) {
                            var xs = d3.extent(data.map(xmap));
                            x.domain(xs);
                        }
                        else {
                            x.domain(data.map(xmap));
                        }
                        if (this.layout.xHasRangeRoundBands)
                            x.rangeRoundBands([0, appear.width - (appear.margin.left - appear.margin.right)], this.layout.xRangeBoundPadding);
                    };
                    Chart.prototype.setYdomain = function (data, y, ymap) {
                        var yMax = d3.max(data.map(ymap));
                        y.domain([0, yMax]);
                    };
                    Chart.prototype.setY2domain = function (data, y2, y2map) {
                        var y2Max = d3.max(data.map(y2map));
                        y2.domain([0, y2Max]);
                    };
                    Chart.prototype.createChartWrapper = function () {
                        this.createChartContainer();
                        this.createSpacingGroup(this.base, this.appearance);
                    };
                    Chart.prototype.createChartContainer = function () {
                        var appear = this.appearance;
                        this.base = d3.select(this.chartId).append("svg").attr({ "width": appear.width + appear.margin.left + appear.margin.right, "height": appear.height + appear.margin.top + appear.margin.bottom });
                    };
                    Chart.prototype.createSpacingGroup = function (parentNode, appear) {
                        this.chart = parentNode.append("g").attr("transform", "translate(" + appear.margin.left + "," + appear.margin.top + ")");
                    };
                    Chart.prototype.createTickLines = function (parentNode, scale) {
                        if (parentNode.selectAll(".horizontal-line-group"))
                            parentNode.selectAll(".horizontal-line-group").remove();
                        parentNode.append("g").attr("class", "horizontal-line-group")
                            .selectAll(".horizontal-line").append("g")
                            .remove()
                            .data(scale.ticks(5))
                            .enter()
                            .append("line")
                            .attr("class", "horizontal-line")
                            .attr("x1", 0)
                            .attr("x2", this.appearance.width + this.appearance.margin.left + this.appearance.margin.right)
                            .attr("y1", function (d) { return scale(d).toString(); })
                            .attr("y2", function (d) { return scale(d).toString(); })
                            .attr("fill", "none")
                            .attr("shape-rendering", "crispEdges");
                    };
                    Chart.prototype.createLine = function (parentNode, scale, datapoint, classname) {
                        if (parentNode.selectAll("." + classname))
                            parentNode.selectAll("." + classname).remove();
                        parentNode.append("line")
                            .attr("class", classname + " line metric-item")
                            .attr("x1", 0)
                            .attr("y1", scale(datapoint))
                            .attr("x2", this.appearance.width + this.appearance.margin.left + this.appearance.margin.right)
                            .attr("y2", scale(datapoint));
                    };
                    Chart.prototype.createXaxis = function (parentNode) {
                        if (this.$xAxis)
                            parentNode.selectAll(".x.axis").remove();
                        this.$xAxis = parentNode.append("g").attr({ "class": "x axis", transform: "translate(0, " + this.h + ")" }).call(this.layout.axis.xAxis);
                        if (!this.layout.hasTicks)
                            this.$xAxis.selectAll("text").remove();
                        if (this.layout.xAxisWraps) {
                            this.$xAxis.selectAll("text").call(this.wrap, this.xScale.rangeBand(), 1, this.layout.xCharToSplitOn, true);
                        }
                    };
                    Chart.prototype.createYaxis = function (parentNode) {
                        if (this.$yAxis)
                            parentNode.selectAll(".y.axis").remove();
                        this.$yAxis = parentNode.append("g").attr({ "class": "y axis" }).call(this.layout.axis.yAxis);
                    };
                    Chart.prototype.createY2Axis = function (parentNode) {
                        if (this.$y2Axis)
                            parentNode.selectAll(".y2.axis").remove();
                        var appear = this.appearance;
                        this.$y2Axis = parentNode.append("g")
                            .attr("class", "y2 axis")
                            .call(this.layout.axis.y2Axis)
                            .attr("transform", function () { return "translate(" + (appear.width + appear.margin.left + appear.margin.right) + ", 0)"; });
                    };
                    Chart.prototype.setAxisProperties = function (axis, properties) {
                        if (properties.scale != null)
                            axis.scale(properties.scale);
                        if (properties.ticks != null)
                            axis.ticks(properties.ticks);
                        if (properties.tickFormat != null)
                            axis.tickFormat(properties.tickFormat);
                        if (properties.tickValues != null)
                            axis.tickValues(properties.tickValues);
                        if (properties.orientation != null)
                            axis.orient(properties.orientation);
                    };
                    Chart.prototype.createAxisLabel = function (axis, properties) {
                        axis.append("text")
                            .text(properties.text)
                            .attr("class", properties.axisTextClass)
                            .attr("text-anchor", properties.textAnchor)
                            .attr("transform", properties.axisTransform)
                            .attr("y", properties.axisYOffset)
                            .attr("x", properties.axisXOffset);
                        if (axis === this.$xAxis)
                            axis.selectAll("text").call(this.wrap, this.xScale.rangeBand());
                    };
                    Chart.prototype.wrap = function (text, width, padding, charToSplit) {
                        var hasChartToSplit = -1;
                        var band = 10;
                        width = width - 10; // Padding between RangeBands so the labels don't run together
                        if (!charToSplit)
                            charToSplit = /\s+/;
                        text.each(function () {
                            if (this.innerHTML) {
                                hasChartToSplit = this.innerHTML.indexOf(charToSplit);
                            }
                            var text = d3.select(this), origTxt = text.text(), charToSplit = (origTxt.length > band) ? /\s+/ : null, words = text.text().split(charToSplit).reverse(), word, line = [], lineNumber = 0, lineHeight = 1.1, // ems
                            y = text.attr("y"), dy = parseFloat(text.attr("dy")), tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                            if ($.isArray(words)) {
                                while (word = words.pop()) {
                                    line.push(word);
                                    tspan.text(line.join(""));
                                    var node = tspan.node();
                                    if (node.getComputedTextLength() > width && line.length > 1) {
                                        line.pop();
                                        tspan.text(line.join(charToSplit.toString()));
                                        line = [word];
                                        if (word.length > band) {
                                            var result = [];
                                            while (word.length) {
                                                result.push(word.substr(0, band));
                                                word = word.substr(band);
                                            }
                                            result.forEach(function (word) {
                                                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", (++lineNumber) * lineHeight + dy + "em").text(word);
                                            });
                                        }
                                        else {
                                            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", (++lineNumber) * lineHeight + dy + "em").text(word);
                                        }
                                    }
                                }
                            }
                        });
                        if (hasChartToSplit > -1) {
                            var tspans = d3.selectAll(".x.axis text tspan:first-child");
                            tspans.each(function (val, i) {
                                var tspan = $(tspans[0][i]);
                                var txt = tspan.text();
                                if (txt !== "")
                                    tspan.text(txt + charToSplit);
                            });
                        }
                    };
                    Chart.prototype.createSvgTooltipElements = function () {
                        var container = d3.select("#tooltipcontainer");
                        container.selectAll("svg").remove();
                        d3.selectAll(".tooltip-volume")
                            .append("svg").attr("width", 15).attr("height", 15)
                            .append("svg:rect").attr("width", 14).attr("height", 14);
                        d3.selectAll(".tooltip-pickup")
                            .append("svg").attr("width", 16).attr("height", 16)
                            .append("svg:rect").attr("width", 10).attr("height", 10)
                            .attr("transform", function (d) {
                            return "translate(" + 8 + "," + 0 + ") rotate(" + 45 + ")";
                        });
                        d3.selectAll(".tooltip-delivery")
                            .append("svg").attr("width", 16).attr("height", 16)
                            .append("svg:circle").attr("r", 7).attr("cx", 8).attr("cy", 8);
                        d3.selectAll(".tooltip-avgpickup")
                            .append("svg").attr("width", 16).attr("height", 16)
                            .append("svg:circle").attr("r", 7).attr("cx", 8).attr("cy", 8);
                        d3.selectAll(".tooltip-avgdelivery")
                            .append("svg").attr("width", 16).attr("height", 16)
                            .append("svg:circle").attr("r", 7).attr("cx", 8).attr("cy", 8);
                    };
                    return Chart;
                })();
                Models.Chart = Chart;
                var GroupData = (function () {
                    function GroupData(k, u, v) {
                        this.key = k;
                        this.uid = u;
                        this.value = v;
                    }
                    return GroupData;
                })();
                Models.GroupData = GroupData;
                var Properties;
                (function (Properties) {
                    var Appearance = (function () {
                        function Appearance(height, margin, width) {
                            this.height = height;
                            this.margin = margin;
                            this.width = width;
                        }
                        return Appearance;
                    })();
                    Properties.Appearance = Appearance;
                    var Layout = (function () {
                        function Layout(axis) {
                            this.axis = axis;
                            this.hasTicks = false;
                            this.xAxisWraps = false;
                            this.xCharToSplitOn = " ";
                            this.xHasRangeRoundBands = false;
                            this.xRangeBoundPadding = 1;
                            this.xIsOrdinal = false;
                            this.xIsTime = false;
                            this.yIsPct = false;
                            this.y2IsLinear = false;
                        }
                        return Layout;
                    })();
                    Properties.Layout = Layout;
                })(Properties = Models.Properties || (Models.Properties = {}));
            })(Models = Performance.Models || (Performance.Models = {}));
        })(Performance = Dashboard.Performance || (Dashboard.Performance = {}));
    })(Dashboard = TenFour.Dashboard || (TenFour.Dashboard = {}));
})(TenFour || (TenFour = {}));
//# sourceMappingURL=ChartContainer.js.map