/// <reference path="../../../../../CommonContent/Content/TScripts/Utilities.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TenFour;
(function (TenFour) {
    var Dashboard;
    (function (Dashboard) {
        var Performance;
        (function (Performance) {
            var ViewModels;
            (function (ViewModels) {
                var GroupData = Performance.Models.GroupData;
                var area_ = d3.svg.area();
                var stack_ = d3.layout.stack();
                var CarrierTracking = (function () {
                    function CarrierTracking(viewReportPage) {
                        this.viewReportPage = viewReportPage;
                        this.chart = new Performance.Models.Chart("carrier-tracking-chart", 170, 410, { top: 20, right: 20, bottom: 20, left: 45 });
                        this.pctGoal = userCaps.OrganizationCapabilities.CarrierTrackingGoal;
                        var pctTxt = (this.pctGoal != null) ? this.pctGoal + " %" : "TBD";
                        this.percentageGoal = ko.observable("Tracking Goal " + pctTxt);
                        this.summaryData = new CarrierTrackingSummary();
                    }
                    CarrierTracking.prototype.init = function () {
                        this.chart.layout.xIsTime = true;
                        this.chart.layout.yIsPct = true;
                        this.chart.init();
                        this.chart.xMap = function (x) { return x.timeSegmentStart.valueOf(); };
                        this.chart.yMap = function (y) { return y.value; };
                        this.chartData = [];
                        this.chart.chart.data(this.chartData);
                    };
                    CarrierTracking.prototype.refreshData = function (data) {
                        this.convertToPcts(data);
                        this.defaultSummaryData = data.Summary;
                        this.setDefaultSummary(data.Summary);
                        this.generateGroupData(data.TrackingDetails);
                        this.onNewData();
                    };
                    CarrierTracking.prototype.onNewData = function () {
                        this.chart.appearance.height = 170;
                        this.chart.appearance.width = 410;
                        this.chart.setXdomain(this.chartData, this.chart.xScale, this.chart.xMap);
                        this.chart.setYdomain(this.chartData, this.chart.yScale, this.chart.yMap);
                        this.setupAxis();
                        this.drawChart();
                        this.chart.renderAxis();
                    };
                    CarrierTracking.prototype.setupAxis = function () {
                        this.chart.bufferSize();
                        this.chart.setAxisProperties(this.chart.axis.xAxis, { scale: null, orientation: "bottom", ticks: null, tickFormat: null, tickValues: null, axisClass: "x axis" });
                        this.chart.setAxisProperties(this.chart.axis.yAxis, { scale: null, orientation: "left", ticks: 5, tickFormat: function (value) { return value + "%"; }, tickValues: null, axisClass: "y axis" });
                    };
                    CarrierTracking.prototype.convertToPcts = function (data) {
                        $.map(data.TrackingDetails, function (d) {
                            d.CarrierTrackedPercentage = numeral(d.CarrierTrackedPercentage).multiply(100);
                            d.ShipmentVolumeTrackedPercentage = numeral(d.ShipmentVolumeTrackedPercentage).multiply(100);
                        });
                        numeral(data.Summary.CarrierTrackedPercentage).multiply(100);
                        numeral(data.Summary.ShipmentVolumeTrackedPercentage).multiply(100);
                    };
                    CarrierTracking.prototype.generateGroupData = function (data) {
                        var tmpArray = new Array();
                        data.forEach(function (d, dataIndex) {
                            var gdtc = new GroupData("tracked-carriers", dataIndex, d.CarrierTrackedPercentage);
                            var gdts = new GroupData("tracked-shipments", dataIndex, d.ShipmentVolumeTrackedPercentage);
                            tmpArray.push(new CarrierTrackingData(gdtc, d));
                            tmpArray.push(new CarrierTrackingData(gdts, d));
                        });
                        // Have "Enter" handle the re-rendering
                        //this.chart.chart.data( /*something*/tmpArray);
                        this.chart.onNewData(tmpArray);
                        this.chartData = tmpArray || [];
                    };
                    CarrierTracking.prototype.drawChart = function () {
                        var layeredData = this.generateLayeredData();
                        var area = this.createAreaObj(this.chart.xScale, this.chart.yScale);
                        this.createPaths(this.chart.chart, area, layeredData);
                        var groupContainer = this.createGroupContainer();
                        this.createGoalLine(this.chart.chart, this.chart.xScale, this.chart.yScale, this.chart.appearance.width);
                        var cdGroup = this.createCdGroups(groupContainer, layeredData);
                        this.tooltip = this.createTooltip();
                        var tmpArray = {};
                        this.createCircles(cdGroup, this.chart.xScale, this.chart.yScale, tmpArray);
                        this.createDiamonds(cdGroup, this.chart.xScale, this.chart.yScale, tmpArray);
                        this.createHoverArea(cdGroup, this.chart.xScale, this.chart.yScale, tmpArray);
                        this.createTooltipEvents(cdGroup, this.tooltip, this);
                        this.tooltipBindings();
                    };
                    CarrierTracking.prototype.tooltipBindings = function () {
                        var element = $("body > .chart-tooltip")[0];
                        ko.cleanNode(element);
                        ko.applyBindings(this.summaryData, element);
                    };
                    CarrierTracking.prototype.setDefaultSummary = function (data) {
                        this.summaryData.dateEnd(data.TimeSegmentEnd);
                        this.summaryData.dateStart(data.TimeSegmentStart);
                        this.summaryData.operatingCarriers(data.CarriersTotal);
                        this.summaryData.carriersTracked(data.CarrierTrackedTotal);
                        this.summaryData.shipmentVolume(data.ShipmentVolumeTotal);
                        this.summaryData.volumeTracked(data.ShipmentVolumeTracked);
                        this.determineifDateRange(data.TimeSegmentStart, data.TimeSegmentEnd);
                    };
                    CarrierTracking.prototype.setSummaryData = function (d) {
                        this.summaryData.dateEnd(d.timeSegmentEnd);
                        this.summaryData.dateStart(d.timeSegmentStart);
                        this.summaryData.shipmentVolume(d.shipmentVolumeTotal);
                        this.summaryData.volumeTracked(d.shipmentVolumeTracked);
                        this.summaryData.operatingCarriers(d.carriersTotal);
                        this.summaryData.carriersTracked(d.carrierTrackedTotal);
                        this.summaryData.carriersTrackedPct(d.carrierTrackedPercentage.valueOf());
                        this.summaryData.volumeTrackedPct(d.shipmentVolumeTrackedPercentage.valueOf());
                        this.determineifDateRange(d.timeSegmentStart, d.timeSegmentEnd);
                    };
                    CarrierTracking.prototype.determineifDateRange = function (startDate, endDate) {
                        if (startDate.valueOf() === endDate.valueOf())
                            this.summaryData.formatDate();
                        else
                            this.summaryData.formatDateRange();
                    };
                    //Create Layered/Stacked/Nested data
                    CarrierTracking.prototype.generateLayeredData = function () {
                        var stack = stack_.offset("zero")
                            .values(function (d) { return d.values; })
                            .x(function (d) { return d.timeSegmentStart; })
                            .y(function (d) { return d.value; });
                        var nest = d3.nest().key(function (d) { return d.key; });
                        return (this.chartData.length) ? stack(nest.entries(this.chartData)) : [];
                    };
                    //Create goal line
                    CarrierTracking.prototype.createGoalLine = function (parentNode, x, y, width) {
                        if (parentNode.selectAll(".goal-group"))
                            parentNode.selectAll(".goal-group").remove();
                        var goalGroup = parentNode.append("g").attr("class", "goal-group");
                        if (goalGroup.selectAll(".tracking-goal"))
                            parentNode.selectAll(".tracking-goal").remove();
                        goalGroup.append("text").attr("class", "tracking-goal").attr("x", "50%").attr("y", y(this.pctGoal)).text(this.percentageGoal());
                        if (goalGroup.selectAll(".goal-line"))
                            parentNode.selectAll(".goal-line").remove();
                        goalGroup.append("svg:line")
                            .attr("class", "goal-line")
                            .attr("x1", 0)
                            .attr("y1", y(this.pctGoal))
                            .attr("x2", this.chart.appearance.width + this.chart.appearance.margin.left + this.chart.appearance.margin.right)
                            .attr("y2", y(this.pctGoal));
                    };
                    //Create tooltip
                    CarrierTracking.prototype.createTooltip = function () {
                        if (d3.selectAll("body > .ct.chart-tooltip"))
                            d3.selectAll("body > .ct.chart-tooltip").remove();
                        var tt = d3.select("body")
                            .append("section")
                            .attr("class", "ct chart-tooltip mdl-tooltip")
                            .attr("for", "ct-tt")
                            .html(function () {
                            var tt = $("<section>"), dateStart = $("<span class='tt-date' data-bind='text: dateStartTt'></span>"), dateEnd = $("<span class='tt-date' data-bind='visible: isDateRange, text: dateEndTt'></span>"), circle = $("<circle class='dot' r='6' cx='6' cy='6'></circle>"), carrierTxt = $("<text class='text-field' x='20' y='10'>").text("Carriers Tracked"), carrierValue = $("<text class='tt-ct-value' x='80%' y='10' data-bind='text: carriersTrackedPctTxt'>"), carrierLabel = $("<svg class='tt-ct-label' height='20' width='100%'>"), rect = $("<rect class='diamond' height='9' width='9'>"), volumeTxt = $("<text class='text-field' x='20' y='10'>").text("Volume Tracked"), volumeValue = $("<text class='tt-vt-value' x='80%' y='10' data-bind='text: volumeTrackedPctTxt'>"), volumeLabel = $("<svg class='tt-vt-label' height='20' width='100%'>");
                            carrierLabel.append(circle, carrierTxt, carrierValue);
                            volumeLabel.append(rect, volumeTxt, volumeValue);
                            tt.append([dateStart, dateEnd, carrierLabel, volumeLabel]);
                            return tt.html();
                        });
                        return tt;
                    };
                    //Create Area SVG
                    CarrierTracking.prototype.createAreaObj = function (x, y) {
                        return area_
                            .interpolate("monotone")
                            .x(function (d) { return x(d.timeSegmentStart); })
                            .y0(function () { return y(0); })
                            .y1(function (d) { return y(d.value); });
                    };
                    //Create path for each layer
                    CarrierTracking.prototype.createPaths = function (parentNode, area, layers) {
                        if (parentNode.selectAll("path"))
                            parentNode.selectAll("path").remove();
                        parentNode.selectAll("path")
                            .data(layers)
                            .enter()
                            .append("path")
                            .attr("class", function (d) { return d.key; })
                            .attr("d", function (d) { return area(d.values); });
                    };
                    CarrierTracking.prototype.createGroupContainer = function () {
                        if (this.chart.chart.selectAll(".group-container"))
                            this.chart.chart.selectAll(".group-container").remove();
                        return this.chart.chart.append("g").attr("class", "group-container");
                    };
                    //Create cd-group (circle diamond)
                    CarrierTracking.prototype.createCdGroups = function (parentNode, layers) {
                        if (parentNode.selectAll(".cd-group"))
                            parentNode.selectAll(".cd-group").remove();
                        return parentNode.selectAll(".cd-group")
                            .data(function () {
                            return $.map(layers, function (data, index) { return data.values; });
                        }, function (a) { return a.timeSegmentStart.toString(); })
                            .enter()
                            .append("g")
                            .attr("id", "ct-tt")
                            .attr("class", "cd-group");
                    };
                    //Create circles
                    CarrierTracking.prototype.createCircles = function (parentNode, x, y, dataPoints) {
                        if (parentNode.selectAll(".dot"))
                            parentNode.selectAll(".dot").remove();
                        parentNode.selectAll(".dot")
                            .data(function (d, index) { return [{ 'index': index, 'data': d }]; })
                            .enter()
                            .append("circle")
                            .attr("class", "dot")
                            .attr("id", function (d) { return ["chart-tooltip-", d.data.uid].join("-"); })
                            .attr("fill", function () { return "#abc"; })
                            .attr("r", 4)
                            .attr("cx", function (d) { return x(d.data.timeSegmentStart); })
                            .attr("cy", function (d) {
                            dataPoints[d.data.uid] = dataPoints[d.data.uid] || [];
                            dataPoints[d.data.uid].push(d);
                            return y(d.data.carrierTrackedPercentage);
                        });
                    };
                    //Create diamonds
                    CarrierTracking.prototype.createDiamonds = function (parentNode, x, y, dataPoints) {
                        if (parentNode.selectAll(".diamond"))
                            parentNode.selectAll(".diamond").remove();
                        parentNode.selectAll(".diamond")
                            .data(function (d, index) { return [{ 'index': index, 'data': d }]; })
                            .enter()
                            .append("rect")
                            .attr("class", "diamond")
                            .attr("id", function (d) {
                            return ["chart-tooltip-", d.data.uid].join("-");
                        })
                            .attr("fill", function () { return "#abc"; })
                            .attr("transform", function (d) {
                            var xTranslate = x(d.data.timeSegmentStart);
                            var yTranslate = y(d.data.shipmentVolumeTrackedPercentage);
                            return ["translate(", xTranslate, ", ", yTranslate - 8, ") rotate(45)"].join("");
                        })
                            .attr("height", 8)
                            .attr("width", 8);
                    };
                    //Creates an aread that is the full size of the chart and cd-groud
                    CarrierTracking.prototype.createHoverArea = function (parentNode, x, y, dataPoints) {
                        if (parentNode.selectAll(".hover-area"))
                            parentNode.selectAll(".hover-area").remove();
                        parentNode.selectAll(".hover-area")
                            .data(function (d, index) { return [{ 'index': index, 'data': d }]; })
                            .enter()
                            .append("rect")
                            .attr("class", "hover-area")
                            .attr("fill", function () { return "transparent"; })
                            .attr("x", function (d) { return x(d.data.timeSegmentStart) - 6; })
                            .attr("y", 0)
                            .attr("height", "100%")
                            .attr("width", 15)
                            .attr("style", "width: 15px; stroke-width: 1px;");
                    };
                    //Tooltip event handlers
                    CarrierTracking.prototype.createTooltipEvents = function (eventTarget, tooltipContainer, context) {
                        var _this = this;
                        eventTarget.on("mouseenter", function (d) {
                            var event = d3.event;
                            var dot = $(event.currentTarget).find(".dot");
                            var diamond = $(event.currentTarget).find(".diamond");
                            dot.attr("r", 6);
                            diamond.attr("height", 12);
                            diamond.attr("width", 12);
                            tooltipContainer.transition().duration(500);
                            tooltipContainer.style("left", event.pageX - 80 + "px");
                            tooltipContainer.style("top", (event.pageY - 100) + "px");
                            tooltipContainer.style("opacity", 1);
                            $("body > .ct.chart-tooltip").addClass("is-active");
                            context.setSummaryData(d);
                        })
                            .on("mouseleave", function () {
                            var event = d3.event;
                            var dot = $(event.currentTarget).find(".dot");
                            var diamond = $(event.currentTarget).find(".diamond");
                            dot.attr("r", 4);
                            diamond.attr("height", 8);
                            diamond.attr("width", 8);
                            _this.setDefaultSummary(_this.defaultSummaryData);
                            tooltipContainer.transition().duration(500);
                            tooltipContainer.style("opacity", 0);
                            $("body > .ct.chart-tooltip").removeClass("is-active");
                        });
                    };
                    CarrierTracking.prototype.viewReport = function () {
                        var filterProvider = new Dashboard.Utilities.FilterProvider([]);
                        var sorts = filterProvider.getSortsFromKey(Dashboard.Utilities.FilterProvider.Tracking);
                        this.viewReportPage(sorts);
                    };
                    return CarrierTracking;
                })();
                ViewModels.CarrierTracking = CarrierTracking;
                var CarrierTrackingData = (function (_super) {
                    __extends(CarrierTrackingData, _super);
                    function CarrierTrackingData(gd, ctd) {
                        _super.call(this, gd.key, gd.uid, gd.value);
                        this.carriersTotal = ctd.CarriersTotal;
                        this.carrierTrackedTotal = ctd.CarrierTrackedTotal;
                        this.carrierTrackedPercentage = ctd.CarrierTrackedPercentage;
                        this.shipmentVolumeTotal = ctd.ShipmentVolumeTotal;
                        this.shipmentVolumeTracked = ctd.ShipmentVolumeTracked;
                        this.shipmentVolumeTrackedPercentage = ctd.ShipmentVolumeTrackedPercentage;
                        this.timeSegmentStart = moment(ctd.TimeSegmentStart).utc().startOf("day").toDate();
                        this.timeSegmentEnd = moment(ctd.TimeSegmentEnd).utc().startOf("day").toDate();
                    }
                    return CarrierTrackingData;
                })(GroupData);
                ViewModels.CarrierTrackingData = CarrierTrackingData;
                var CarrierTrackingSummary = (function () {
                    function CarrierTrackingSummary() {
                        var _this = this;
                        this.carriersTracked = ko.observable();
                        this.carriersTrackedPct = ko.observable("");
                        this.carriersTrackedPctTxt = ko.observable("");
                        this.dateEnd = ko.observable();
                        this.dateStart = ko.observable();
                        this.isDateRange = ko.observable(false);
                        this.operatingCarriers = ko.observable();
                        this.shipmentVolume = ko.observable();
                        this.volumeTracked = ko.observable();
                        this.volumeTrackedPct = ko.observable("");
                        this.volumeTrackedPctTxt = ko.observable("");
                        //FORMATTED PROPERTIES
                        this.dateEndTt = ko.observable("");
                        this.dateStartTt = ko.observable("");
                        this.carriersTrackedPct.subscribe(function (pct) { _this.carriersTrackedPctTxt(numeral(pct).format("0,0") + "%"); });
                        this.volumeTrackedPct.subscribe(function (pct) { _this.volumeTrackedPctTxt(numeral(pct).format("0,0") + "%"); });
                    }
                    CarrierTrackingSummary.prototype.formatDateRange = function () {
                        this.isDateRange(true);
                        var dateEnd = moment(this.dateEnd()).format("MMM D, YYYY");
                        var dateStart = moment(this.dateStart()).format("MMM D, YYYY");
                        this.dateEnd(dateEnd);
                        this.dateEndTt(" - " + dateEnd);
                        this.dateStart(dateStart);
                        this.dateStartTt(dateStart);
                    };
                    CarrierTrackingSummary.prototype.formatDate = function () {
                        this.isDateRange(false);
                        var day = moment(this.dateStart()).format("dddd");
                        var dateShort = moment(this.dateStart()).format("MMM D, YYYY");
                        this.dateEnd(dateShort);
                        this.dateStart(day);
                        this.dateStartTt([day, ", ", dateShort].join(""));
                    };
                    return CarrierTrackingSummary;
                })();
                ViewModels.CarrierTrackingSummary = CarrierTrackingSummary;
            })(ViewModels = Performance.ViewModels || (Performance.ViewModels = {}));
        })(Performance = Dashboard.Performance || (Dashboard.Performance = {}));
    })(Dashboard = TenFour.Dashboard || (TenFour.Dashboard = {}));
})(TenFour || (TenFour = {}));
//# sourceMappingURL=CarrierTracking.js.map