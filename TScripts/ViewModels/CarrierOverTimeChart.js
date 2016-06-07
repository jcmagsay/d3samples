/// <reference path="../../../../../commoncontent/content/typedefs/d3.d.ts" />
var TenFour;
(function (TenFour) {
    var Dashboard;
    (function (Dashboard) {
        var Performance;
        (function (Performance) {
            var ViewModels;
            (function (ViewModels) {
                var area_ = d3.svg.area();
                var maxVolumeBarWidth = 40;
                var CarrierOverTimeChart = (function () {
                    function CarrierOverTimeChart(filter, showShipmentLog, parentContext) {
                        this.filter = filter;
                        this.showShipmentLog = showShipmentLog;
                        this.parentContext = parentContext;
                        this.carrierName = ko.observable("");
                        this.chart = new Performance.Models.Chart("carrier-over-time", 318, 626, { top: 20, right: 66, bottom: 40, left: 66 });
                        this.table = new ViewModels.CarrierPerformanceLevelTwoTable();
                        this.tooltips = ko.observableArray([]);
                    }
                    CarrierOverTimeChart.prototype.init = function () {
                        var _this = this;
                        this.chart.layout.xAxisWraps = true;
                        this.chart.layout.xCharToSplitOn = " - ";
                        this.chart.layout.xHasRangeRoundBands = true;
                        this.chart.layout.xRangeBoundPadding = 0.2;
                        this.chart.layout.yIsPct = true;
                        this.chart.layout.xIsOrdinal = true;
                        this.chart.layout.y2IsLinear = true;
                        this.chart.init();
                        this.chart.xMap = function (x) { return x.StartDate; };
                        this.chart.yMap = function () { return 100; };
                        this.chart.y2Map = function () { return _this.chartData.HighestVolume; };
                        this.chartData = [];
                        this.chart.chart.data(this.chartData);
                    };
                    CarrierOverTimeChart.prototype.updateData = function (data) {
                        this.chartData = data;
                        this.carrierData = data.CarrierData;
                        this.onNewData();
                        this.resetLegend();
                        this.table.onNewData(data.CarrierData);
                    };
                    CarrierOverTimeChart.prototype.onNewData = function () {
                        this.chart.appearance.height = 318;
                        this.chart.appearance.width = 626;
                        this.chart.setXdomain(this.carrierData, this.chart.xScale, this.chart.xMap);
                        this.chart.setYdomain(this.carrierData, this.chart.yScale, this.chart.yMap);
                        this.chart.setY2domain(this.carrierData, this.chart.y2Scale, this.chart.y2Map);
                        this.setupAxis();
                        this.chart.renderAxis();
                        this.setupAxisProperties();
                        this.drawChart();
                        this.initializeTooltips(this.carrierData);
                    };
                    CarrierOverTimeChart.prototype.setupAxis = function () {
                        var self = this;
                        this.chart.bufferSize();
                        this.chart.layout.hasTicks = true;
                        var maxTickMarks = 10;
                        var tickFormat = function (d, i) {
                            var carrierData = self.carrierData;
                            if (carrierData.length <= maxTickMarks)
                                return carrierData[i].TimePeriodLabel;
                            self.tickspan = Math.ceil(carrierData.length / maxTickMarks);
                            if (i % self.tickspan === 0)
                                return carrierData[i].TimePeriodLabel;
                            return "";
                        };
                        this.chart.setAxisProperties(this.chart.axis.xAxis, { scale: null, orientation: "bottom", ticks: null, tickFormat: tickFormat, tickValues: null, axisClass: "x axis" });
                        this.chart.setAxisProperties(this.chart.axis.yAxis, { scale: null, orientation: "left", ticks: 5, tickFormat: function (value) { return value + "%"; }, tickValues: null, axisClass: "y axis" });
                        this.chart.setAxisProperties(this.chart.axis.y2Axis, { scale: null, orientation: "right", ticks: null, tickFormat: null, tickValues: null, axisClass: "y2 axis" });
                        this.volumeBarWidth = Math.min(this.chart.xScale.rangeBand(), maxVolumeBarWidth);
                    };
                    CarrierOverTimeChart.prototype.setupAxisProperties = function () {
                        var xoffset = (this.chart.appearance.height / 2) * -1;
                        this.chart.createAxisLabel(this.chart.$yAxis, { text: "On-Time Performance", textAnchor: "middle", axisTextClass: "y label", axisXOffset: xoffset, axisYOffset: -50, axisTransform: "rotate(-90)" });
                        this.chart.createAxisLabel(this.chart.$y2Axis, { text: "Volume (# of Shipments)", textAnchor: "middle", axisTextClass: "y2 label", axisXOffset: xoffset, axisYOffset: 60, axisTransform: "rotate(-90)" });
                    };
                    CarrierOverTimeChart.prototype.drawChart = function () {
                        this.chart.createTickLines(this.chart.chart, this.chart.yScale);
                        var groupContainer = this.createGroupContainer();
                        this.createAvgLine(this.chart.chart, "AverageCarrierPickupPercent", "avg-pickup");
                        this.createAvgLine(this.chart.chart, "AverageCarrierDeliveryPercent", "avg-delivery");
                        var bcdGroup = this.createBcdGroup(groupContainer);
                        this.createBars(bcdGroup, this.chart.xScale, this.chart.y2Scale);
                        var barWidth = Math.min(this.chart.xScale.rangeBand(), maxVolumeBarWidth);
                        if (barWidth > 20)
                            this.createBarText(bcdGroup);
                        this.createCircles(bcdGroup, this.chart.xScale, this.chart.yScale);
                        this.createDiamonds(bcdGroup, this.chart.xScale, this.chart.yScale);
                        this.createHoverArea(bcdGroup, this.chart.xScale, this.chart.yScale);
                    };
                    CarrierOverTimeChart.prototype.createGroupContainer = function () {
                        var groupContainer = this.chart.chart.selectAll(".group-container");
                        groupContainer.remove();
                        return this.chart.chart.append("g").attr("class", "group-container");
                    };
                    CarrierOverTimeChart.prototype.createAvgLine = function (parentNode, datafield, className) {
                        var _this = this;
                        var lineCurve = d3.svg.line()
                            .x(function (d) { return _this.chart.xScale(d.StartDate); })
                            .y(function (d) { return _this.chart.yScale(d[datafield]); })
                            .interpolate("basis");
                        if (parentNode.selectAll("." + className))
                            parentNode.selectAll("." + className).remove();
                        parentNode.append("path").attr("class", className + " metric-item").attr("d", lineCurve(this.carrierData));
                    };
                    CarrierOverTimeChart.prototype.createBcdGroup = function (parentNode) {
                        var _this = this;
                        return parentNode.selectAll(".bcd-group")
                            .remove()
                            .data(this.carrierData)
                            .enter()
                            .append("g")
                            .attr("class", "bcd-group")
                            .attr("width", this.volumeBarWidth)
                            .attr("id", function (d) { return "segment-tt-" + _this.carrierData.indexOf(d); })
                            .on("mouseover", function (d) {
                            var event = d3.event;
                            var target = $(event.currentTarget);
                            var id = target.attr("id");
                            if (d.Volume !== 0 || d.Pickup !== 0 || d.Delivery !== 0 || d.AverageCarrierPickupPercent !== 0 || d.AverageCarrierDeliveryPercent !== 0) {
                                var top = target.find(".volume-bar").offset().top - 150;
                                var left = target.find(".volume-bar").offset().left - 50;
                                var position = ["left: ", left, "px; top: ", top, "px;"].join("");
                                $(".chart-tooltip[for='" + id + "']").attr("style", position).addClass("is-active");
                            }
                            else {
                                target.css("cursor", "default");
                            }
                        }).on("mouseout", function () {
                            var event = d3.event;
                            var target = $(event.currentTarget);
                            var id = target.attr("id");
                            $(".chart-tooltip[for='" + id + "']").removeClass("is-active");
                        });
                    };
                    CarrierOverTimeChart.prototype.createBars = function (parentNode, x, y2) {
                        var _this = this;
                        return parentNode.selectAll(".volume-bar")
                            .remove()
                            .data(function (d, index) { return [{ 'index': index, 'data': d }]; })
                            .enter()
                            .append("rect")
                            .attr("class", "volume-bar metric-item full-volume-bar")
                            .attr("width", this.volumeBarWidth)
                            .attr("height", function (d) {
                            var appear = _this.chart.appearance;
                            var h = appear.height + appear.margin.top + appear.margin.bottom;
                            return h - _this.chart.y2Scale(d.data.Volume);
                        })
                            .attr("x", function (d) {
                            return (_this.chart.xScale(d.data.StartDate) + (_this.chart.xScale.rangeBand() / 2) - (_this.volumeBarWidth / 2));
                        })
                            .attr("y", function (d) { return y2(d.data.Volume); });
                    };
                    CarrierOverTimeChart.prototype.createBarText = function (parentNode) {
                        var _this = this;
                        parentNode.selectAll("text")
                            .remove()
                            .data(function (d, index) { return [{ 'index': index, 'data': d }]; })
                            .enter()
                            .append("text")
                            .style("text-anchor", "middle")
                            .attr("class", "volume-bar text metric-item full")
                            .attr("width", this.volumeBarWidth)
                            .attr("x", function (d) { return (_this.chart.xScale(d.data.StartDate) + (_this.chart.xScale.rangeBand() / 2)); })
                            .attr("y", function (d) {
                            var yOffset = 0;
                            var volume = d.data.Volume;
                            var yRange = _this.chart.y2Scale(volume);
                            var difference = yRange - _this.chart.appearance.height;
                            if (volume === 0) {
                                yOffset = _this.chart.appearance.height - 10;
                            }
                            else if (difference < 15) {
                                yOffset = _this.chart.y2Scale(volume) + 15;
                            }
                            else {
                                yOffset = _this.chart.y2Scale(volume) - 15;
                            }
                            return yOffset;
                        })
                            .text(function (d) {
                            var volume = d.data.Volume;
                            var appear = _this.chart.appearance;
                            var h = appear.height + appear.margin.top + appear.margin.bottom;
                            var yRange = _this.chart.y2Scale(d.data.Volume);
                            var offset = h - yRange;
                            if (volume >= 1000)
                                return numeral(volume).format("0.0a");
                            else if (_this.volumeBarWidth < 16 || volume === 0)
                                return "";
                            else
                                return volume.toLocaleString();
                        });
                    };
                    CarrierOverTimeChart.prototype.createCircles = function (parentNode, x, y) {
                        var _this = this;
                        var barWidth = Math.min(this.chart.xScale.rangeBand(), maxVolumeBarWidth);
                        parentNode.selectAll(".delivery-circle")
                            .remove()
                            .data(function (d, index) { return [{ 'index': index, 'data': d }]; })
                            .enter()
                            .append("circle") // Delivery
                            .attr("class", "delivery-circle metric-item")
                            .attr("cx", function (d) {
                            var xtranslate = (_this.chart.xScale(d.data.StartDate) + (_this.chart.xScale.rangeBand() / 2)) - (barWidth / 2);
                            return xtranslate + barWidth - (barWidth / 4);
                        })
                            .attr("cy", function (d) { return _this.chart.yScale(d.data.Delivery); })
                            .attr("r", function (d) { return ((d.data.Volume > 0) ? (barWidth / 4) : 0); });
                    };
                    CarrierOverTimeChart.prototype.createDiamonds = function (parentNode, x, y) {
                        var _this = this;
                        var barWidth = Math.min(this.chart.xScale.rangeBand(), this.volumeBarWidth);
                        var rectSize = Math.sqrt(Math.pow(barWidth, 2) + Math.pow(barWidth, 2));
                        parentNode.selectAll(".pickup-diamond")
                            .remove()
                            .data(function (d, index) { return [{ 'index': index, 'data': d }]; })
                            .enter()
                            .append("rect") // Delivery
                            .attr("class", "pickup-diamond metric-item")
                            .attr("height", function (d) { return (d.data.Volume > 0 ? (rectSize / 4) : 0); })
                            .attr("width", function (d) { return (d.data.Volume > 0 ? (rectSize / 4) : 0); })
                            .style("color", "#fff")
                            .attr("transform", function (d) {
                            var xTranslate = _this.chart.xScale(d.data.StartDate) + (_this.chart.xScale.rangeBand() / 2) - (barWidth / 4);
                            return "translate(" + xTranslate + "," + (_this.chart.yScale(d.data.Pickup) - (barWidth / 4)) + ") rotate(" + 45 + ")";
                        });
                    };
                    CarrierOverTimeChart.prototype.createHoverArea = function (parentNode, x, y) {
                        var _this = this;
                        parentNode.selectAll(".hover-area")
                            .remove()
                            .data(function (d, index) { return [{ 'index': index, 'data': d }]; })
                            .enter()
                            .append("rect")
                            .attr("class", "hover-area")
                            .attr("fill", function () { return "transparent"; })
                            .attr("x", function (d) { return (_this.chart.xScale(d.data.StartDate) + (_this.chart.xScale.rangeBand() / 2) - (_this.volumeBarWidth / 2)); })
                            .attr("y", 0)
                            .attr("width", this.volumeBarWidth)
                            .attr("style", "height: 100%; stroke-width: 1px;");
                    };
                    CarrierOverTimeChart.prototype.initializeTooltips = function (carrierData) {
                        if (carrierData) {
                            var tooltips = [];
                            $.each(carrierData, function (i, d) { tooltips.push(new Performance.Models.ChartTooltip("segment-tt-" + i, d.Volume, d.Pickup, d.Delivery, d.AverageCarrierPickupPercent, d.AverageCarrierDeliveryPercent, d.TooltipHeader)); });
                            this.parentContext.observableTooltipCollection(tooltips);
                            this.chart.createSvgTooltipElements();
                        }
                    };
                    CarrierOverTimeChart.prototype.resetLegend = function () {
                        $(".levelTwoContainer .CarrierPerformanceChartlegend .legend-button").each(function (idx, val) {
                            var target = $(val);
                            var metricClass = target.data('metric');
                            var metricItems = $("#carrierPerformanceChartLevelOne .metricItem." + metricClass);
                            var status = target.attr('data-toggle');
                            target.attr("data-toggle", "true");
                            try {
                                // IE is throwing an exception here because of calling remove() on 'undefined'.
                                metricItems.filter(function (i) { metricItems[i].classList.remove("hide"); });
                            }
                            catch (e) {
                            }
                        });
                    };
                    CarrierOverTimeChart.prototype.toggleChartMetric = function ($data, event) {
                        var target = $(event.currentTarget);
                        var metricClass = target.data('metric');
                        var metricItems = $("#carrier-over-time .metric-item." + metricClass);
                        var status = target.attr('data-toggle');
                        if (status === "true") {
                            target.attr("data-toggle", "false");
                            metricItems.filter(function (i) { metricItems[i].classList.add("hide"); });
                        }
                        else {
                            target.attr("data-toggle", "true");
                            metricItems.filter(function (i) { metricItems[i].classList.remove("hide"); });
                        }
                    };
                    CarrierOverTimeChart.prototype.showLevelOne = function (filter, carrierId) {
                        this.parentContext.observableTooltipCollection(this.parentContext.topCarriersChart.tooltips());
                        $('.LevelTwo').addClass("hidden");
                        $('.LevelOne').removeClass("hidden");
                    };
                    CarrierOverTimeChart.prototype.viewReport = function () {
                        var carrierRestriction = new App.Filter.Restriction(App.Filter.FilterOperator.EqualTo, [this.carrierId]);
                        var filterClauses = [
                            new App.Filter.FilterClause("RollupCarrierID", carrierRestriction)
                        ];
                        this.showShipmentLog(filterClauses);
                    };
                    return CarrierOverTimeChart;
                })();
                ViewModels.CarrierOverTimeChart = CarrierOverTimeChart;
            })(ViewModels = Performance.ViewModels || (Performance.ViewModels = {}));
        })(Performance = Dashboard.Performance || (Dashboard.Performance = {}));
    })(Dashboard = TenFour.Dashboard || (TenFour.Dashboard = {}));
})(TenFour || (TenFour = {}));
//# sourceMappingURL=CarrierOverTimeChart.js.map