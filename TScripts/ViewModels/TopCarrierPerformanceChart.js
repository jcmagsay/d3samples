/// <reference path="../../../../../commoncontent/content/typedefs/d3.d.ts" />
/// <reference path="../Models/PerformanceEnums.ts" />
var TenFour;
(function (TenFour) {
    var Dashboard;
    (function (Dashboard) {
        var Performance;
        (function (Performance) {
            var ViewModels;
            (function (ViewModels) {
                var Metric = PerformanceEnums.CarrierSortMetrics;
                var volumeBarWidth = 40;
                var deliveryCircleRadius = 8;
                var pickupDiamondSize = 12;
                var TopCarrierPerformanceChart = (function () {
                    function TopCarrierPerformanceChart(filter, viewReportPage, parentContext) {
                        var _this = this;
                        this.filter = filter;
                        this.viewReportPage = viewReportPage;
                        this.parentContext = parentContext;
                        this.chart = new Performance.Models.Chart("top-carriers", 318, 626, { top: 20, right: 66, bottom: 50, left: 66 });
                        this.carriers = new Array();
                        this.tooltips = ko.observableArray([]);
                        //REFACTOR
                        var sort = new ViewModels.CarrierSort(Metric[0], 1);
                        this.carrierSort = ko.observable(sort);
                        this.carrierSortMenu = new ViewModels.CarrierSortMenu(this.carrierSort);
                        this.allChartData = ko.observableArray([]);
                        this.sortedChartData = ko.computed(this.computeVisibleCarrierData, this);
                        this.table = new ViewModels.CarrierPerformanceLevelOneTable(this.sortedChartData);
                        this.sortedChartData.subscribeChanged(function (newValues) {
                            if (newValues && _this.chartData) {
                                _this.chartData.carriers = newValues;
                                _this.carriers = newValues;
                                _this.onNewData();
                                _this.initializeTooltips(newValues);
                            }
                        });
                    }
                    TopCarrierPerformanceChart.prototype.init = function () {
                        var _this = this;
                        this.chart.layout.xAxisWraps = true;
                        this.chart.layout.xHasRangeRoundBands = true;
                        this.chart.layout.yIsPct = true;
                        this.chart.layout.xIsOrdinal = true;
                        this.chart.layout.y2IsLinear = true;
                        this.chart.init();
                        this.chart.xMap = function (x) { return x.name; };
                        this.chart.yMap = function () { return 100; };
                        this.chart.y2Map = function () { return _this.chartData.highestVolume; };
                        this.chartData = [];
                        this.chart.chart.data(this.chartData);
                    };
                    TopCarrierPerformanceChart.prototype.updateData = function (data) {
                        this.chartData = data.ChartData;
                        this.carriers = data.ChartData.carriers;
                        this.allChartData(data.ChartData.carriers);
                        this.computeVisibleCarrierData();
                        this.onNewData();
                        this.resetLegend();
                    };
                    //summary - Will populate chart with new data
                    TopCarrierPerformanceChart.prototype.onNewData = function () {
                        this.chart.appearance.height = 318;
                        this.chart.appearance.width = 626;
                        this.chart.setXdomain(this.chartData.carriers, this.chart.xScale, this.chart.xMap);
                        this.chart.setYdomain(this.chartData.carriers, this.chart.yScale, this.chart.yMap);
                        this.chart.setY2domain(this.chartData.carriers, this.chart.y2Scale, this.chart.y2Map);
                        this.setupAxis();
                        this.chart.renderAxis();
                        this.setupAxisProperties();
                        this.drawChart();
                    };
                    TopCarrierPerformanceChart.prototype.setupAxis = function () {
                        this.chart.bufferSize();
                        this.chart.layout.hasTicks = true;
                        this.chart.setAxisProperties(this.chart.axis.xAxis, { scale: null, orientation: "bottom", ticks: null, tickFormat: null, tickValues: null, axisClass: "x axis" });
                        this.chart.setAxisProperties(this.chart.axis.yAxis, { scale: null, orientation: "left", ticks: 5, tickFormat: function (value) { return value + "%"; }, tickValues: null, axisClass: "y axis" });
                        this.chart.setAxisProperties(this.chart.axis.y2Axis, { scale: null, orientation: "right", ticks: null, tickFormat: null, tickValues: null, axisClass: "y2 axis" });
                    };
                    TopCarrierPerformanceChart.prototype.setupAxisProperties = function () {
                        var xoffset = (this.chart.appearance.height / 2) * -1;
                        this.chart.createAxisLabel(this.chart.$yAxis, { text: "On-Time Performance", textAnchor: "middle", axisTextClass: "y label", axisXOffset: xoffset, axisYOffset: -50, axisTransform: "rotate(-90)" });
                        this.chart.createAxisLabel(this.chart.$y2Axis, { text: "Volume (# of Shipments)", textAnchor: "middle", axisTextClass: "y2 label", axisXOffset: xoffset, axisYOffset: 60, axisTransform: "rotate(-90)" });
                    };
                    TopCarrierPerformanceChart.prototype.drawChart = function () {
                        this.chart.createTickLines(this.chart.chart, this.chart.yScale);
                        this.chart.createLine(this.chart.chart, this.chart.yScale, this.chartData.avgpickup, "avg-pickup");
                        this.chart.createLine(this.chart.chart, this.chart.yScale, this.chartData.avgdelivery, "avg-delivery");
                        var groupContainer = this.createGroupContainer();
                        var bcdGroup = this.createBcdGroup(groupContainer);
                        this.createBars(bcdGroup, this.chart.xScale, this.chart.y2Scale);
                        this.createBarText(bcdGroup);
                        this.createCircles(bcdGroup, this.chart.xScale, this.chart.yScale);
                        this.createDiamonds(bcdGroup, this.chart.xScale, this.chart.yScale);
                        this.createHoverArea(bcdGroup, this.chart.xScale, this.chart.yScale);
                    };
                    TopCarrierPerformanceChart.prototype.createGroupContainer = function () {
                        var groupContainer = this.chart.chart.selectAll(".group-container");
                        groupContainer.remove();
                        return this.chart.chart.append("g").attr("class", "group-container");
                    };
                    TopCarrierPerformanceChart.prototype.createBcdGroup = function (parentNode) {
                        var _this = this;
                        return parentNode.selectAll(".bcd-group")
                            .remove()
                            .data(this.carriers)
                            .enter()
                            .append("g")
                            .attr({ "class": "bcd-group", id: function (d) { return "top-carrier-" + d.carrierId; } })
                            .on("mouseover", function (d) {
                            var event = d3.event;
                            var target = $(event.currentTarget);
                            var id = target.attr("id");
                            if (d.Volume !== 0 || d.Pickup !== 0 || d.Delivery !== 0 || _this.chartData.avgdelivery !== 0 || _this.chartData.avgpickup != null) {
                                var top = target.find(".volume-bar").offset().top - 150;
                                var left = target.find(".volume-bar").offset().left - 50;
                                var position = ["left: ", left, "px; top: ", top, "px;"].join("");
                                $(".chart-tooltip[for='" + id + "']").attr("style", position);
                                $(".chart-tooltip[for='" + id + "']").addClass("is-active");
                            }
                        }).on("mouseout", function () {
                            var event = d3.event;
                            var target = $(event.currentTarget);
                            var id = target.attr("id");
                            $(".chart-tooltip[for='" + id + "']").removeClass("is-active");
                        })
                            .on("click", function (d) {
                            $(".tooltip-section .mdl-tooltip").removeClass("is-active");
                            _this.showLevelTwo(d);
                        });
                    };
                    TopCarrierPerformanceChart.prototype.createBars = function (parentNode, x, y2) {
                        var _this = this;
                        return parentNode.selectAll(".volume-bar")
                            .remove()
                            .data(function (d, index) { return [{ 'index': index, 'data': d }]; })
                            .enter()
                            .append("rect")
                            .attr({
                            "class": "volume-bar metric-item full-volume-bar", width: volumeBarWidth,
                            height: function (d) {
                                var appear = _this.chart.appearance, h = appear.height + appear.margin.top + appear.margin.bottom;
                                return h - _this.chart.y2Scale(d.data.Volume);
                            },
                            y: function (d) { return y2(d.data.Volume); },
                            x: function (d) { return ((_this.chart.xScale(d.data.name) || 0) + (_this.chart.xScale.rangeBand() / 2) - (volumeBarWidth / 2)); }
                        });
                    };
                    TopCarrierPerformanceChart.prototype.createBarText = function (parentNode) {
                        var _this = this;
                        parentNode.selectAll("text")
                            .remove()
                            .data(function (d, index) { return [{ 'index': index, 'data': d }]; })
                            .enter()
                            .append("text")
                            .style("text-anchor", "middle")
                            .attr({
                            "class": "volume-bar text metric-item full", x: function (d) { return (_this.chart.xScale(d.data.name) + (_this.chart.xScale.rangeBand() / 2)); },
                            y: function (d) {
                                var yOffset, volume = d.data.Volume, yRange = _this.chart.y2Scale(volume), difference = yRange - _this.chart.appearance.height;
                                if (d.data.Volume === 0) {
                                    yOffset = _this.chart.appearance.height - 10;
                                }
                                else if (difference < 10) {
                                    yOffset = _this.chart.y2Scale(volume) + 15;
                                }
                                else {
                                    yOffset = _this.chart.y2Scale(volume) - 15;
                                }
                                return yOffset;
                            }
                        })
                            .text(function (d) {
                            var volume = d.data.Volume;
                            if (volume >= 1000)
                                return numeral(volume).format("0.0a");
                            else if (volume === 0)
                                return "";
                            else
                                return volume.toLocaleString();
                        });
                    };
                    TopCarrierPerformanceChart.prototype.createCircles = function (parentNode, x, y) {
                        var _this = this;
                        parentNode.selectAll(".delivery-circle")
                            .remove()
                            .data(function (d, index) { return [{ 'index': index, 'data': d }]; })
                            .enter()
                            .append("circle")
                            .attr({
                            "class": "delivery-circle metric-item", cy: function (d) { return _this.chart.yScale(d.data.Delivery); }, r: deliveryCircleRadius,
                            cx: function (d) {
                                var xTranslate = _this.chart.xScale(d.data.name) + (_this.chart.xScale.rangeBand() / 2);
                                xTranslate = xTranslate + (deliveryCircleRadius + 4);
                                return xTranslate;
                            }
                        });
                    };
                    TopCarrierPerformanceChart.prototype.createDiamonds = function (parentNode, x, y) {
                        var _this = this;
                        parentNode.selectAll(".pickup-diamond")
                            .remove()
                            .data(function (d, index) { return [{ 'index': index, 'data': d }]; })
                            .enter()
                            .append("rect")
                            .attr({
                            "class": "pickup-diamond metric-item", height: pickupDiamondSize, width: pickupDiamondSize, "transform": function (d) {
                                var xTranslate = _this.chart.xScale(d.data.name) + (_this.chart.xScale.rangeBand() / 2);
                                xTranslate = xTranslate - (pickupDiamondSize / 2);
                                return "translate(" + (xTranslate - 2) + "," + (_this.chart.yScale(d.data.Pickup) - 10) + ") rotate(" + 45 + ")";
                            }
                        });
                    };
                    TopCarrierPerformanceChart.prototype.createHoverArea = function (parentNode, x, y) {
                        var _this = this;
                        parentNode.selectAll(".hover-area")
                            .remove()
                            .data(function (d, index) { return [{ 'index': index, 'data': d }]; })
                            .enter()
                            .append("rect")
                            .attr({ "class": "hover-area", "fill": function () { return "transparent"; }, height: "100%", x: function (d) { return (_this.chart.xScale(d.data.name) + (_this.chart.xScale.rangeBand() / 2) - (volumeBarWidth / 2)); }, y: 0, style: "stroke-width: 1px;", width: 40 });
                    };
                    TopCarrierPerformanceChart.prototype.initializeTooltips = function (carrierData) {
                        var _this = this;
                        if (carrierData) {
                            var tooltips = [];
                            $.each(carrierData, function (i, d) { tooltips.push(new Performance.Models.ChartTooltip("top-carrier-" + d.carrierId, d.Volume, d.Pickup, d.Delivery, _this.chartData.avgpickup, _this.chartData.avgdelivery, _this.chartData.tooltipHeader)); });
                            this.parentContext.observableTooltipCollection(tooltips);
                            this.tooltips(tooltips);
                            this.chart.createSvgTooltipElements();
                        }
                    };
                    TopCarrierPerformanceChart.prototype.computeVisibleCarrierData = function () {
                        var allCarriers = this.allChartData();
                        var sorter = this.carrierSort();
                        var sortedCarriers = allCarriers.sort(sorter.compareFunction.bind(sorter)).slice(0, 6);
                        return sortedCarriers;
                    };
                    TopCarrierPerformanceChart.prototype.resetLegend = function () {
                        // Set all Legend Items back to Visible when we redraw the chart
                        $(".levelOneContainer .CarrierPerformanceChartlegend .legend-button").each(function (idx, val) {
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
                    TopCarrierPerformanceChart.prototype.toggleChartMetric = function ($data, event) {
                        var target = $(event.currentTarget);
                        var metricClass = target.data('metric');
                        var metricItems = $("#top-carriers .metric-item." + metricClass);
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
                    TopCarrierPerformanceChart.prototype.sortByMetric = function ($data, event) {
                        var target = $(event.currentTarget);
                        var metric = Metric[target.data("metric")];
                        var sort = target.data("sort");
                        this.carrierSortMenu.setSort(metric, sort);
                    };
                    TopCarrierPerformanceChart.prototype.showLevelTwo = function (d) {
                        var _this = this;
                        var settings = ko.toJSON(this.filter);
                        var $mask = $("#mask");
                        $mask.show();
                        Dashboard.WebService.getCarrierPerformanceLevelTwo(settings, parseInt(d.carrierId))
                            .done(function (data) {
                            $('.LevelOne').addClass("hidden");
                            $('.LevelTwo').removeClass("hidden");
                            _this.parentContext.carrierOverTime.carrierId = parseInt(d.carrierId);
                            _this.parentContext.carrierOverTime.carrierName(d.name);
                            _this.parentContext.carrierOverTime.updateData(data);
                        })
                            .fail(function () {
                            alert("An Error has Occured");
                        })
                            .always(function () { return $mask.hide(); });
                    };
                    TopCarrierPerformanceChart.prototype.viewReport = function () {
                        this.viewReportPage([this.carrierSortMenu.getSort()]);
                    };
                    return TopCarrierPerformanceChart;
                })();
                ViewModels.TopCarrierPerformanceChart = TopCarrierPerformanceChart;
            })(ViewModels = Performance.ViewModels || (Performance.ViewModels = {}));
        })(Performance = Dashboard.Performance || (Dashboard.Performance = {}));
    })(Dashboard = TenFour.Dashboard || (TenFour.Dashboard = {}));
})(TenFour || (TenFour = {}));
//# sourceMappingURL=TopCarrierPerformanceChart.js.map