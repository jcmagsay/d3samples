/// <reference path="../../../../../CommonContent/Content/TScripts/Utilities.ts" />

module TenFour.Dashboard.Performance.ViewModels {
	declare var componentHandler;
	declare var MaterialTooltip;
	declare var numeral;

	import TrackingData = Dashboard.WebService.Models.ICarrierTrackingData;
	import CarrierTrackingDetails = Dashboard.WebService.Models.ICarrierTrackingDetails;
	import GroupData = Performance.Models.GroupData;
	var area_: any = d3.svg.area();
	var stack_: any = d3.layout.stack();

	export class CarrierTracking {

        chartData: Array<CarrierTrackingData>;
		chart: Performance.Models.Chart;
		defaultSummaryData: CarrierTrackingDetails;
		percentageGoal: KnockoutObservableString;
		pctGoal: number;
		summaryData: CarrierTrackingSummary;
		tooltip: any;

		constructor(private viewReportPage: (key: Array<App.Filter.ISortClause>) => void) {
			this.chart = new Models.Chart("carrier-tracking-chart", 170, 410, { top: 20, right: 20, bottom: 20, left: 45 });
			this.pctGoal = userCaps.OrganizationCapabilities.CarrierTrackingGoal;
			var pctTxt = (this.pctGoal != null) ? this.pctGoal + " %" : "TBD";
			this.percentageGoal = ko.observable("Tracking Goal " + pctTxt);
			this.summaryData = new CarrierTrackingSummary();
		}

		init() {
			this.chart.layout.xIsTime = true;
			this.chart.layout.yIsPct = true;
			this.chart.init();
			this.chart.xMap = (x: CarrierTrackingData) => { return x.timeSegmentStart.valueOf(); };
			this.chart.yMap = (y: CarrierTrackingData) => { return y.value; };
			this.chartData = [];
			this.chart.chart.data(this.chartData);
		}

		refreshData(data: TrackingData) {
			this.convertToPcts(data);
			this.defaultSummaryData = data.Summary;
			this.setDefaultSummary(data.Summary);
			this.generateGroupData(data.TrackingDetails);
			this.onNewData();
		}

		onNewData() {
			this.chart.appearance.height = 170;
			this.chart.appearance.width = 410;
			this.chart.setXdomain(this.chartData, this.chart.xScale, this.chart.xMap);
			this.chart.setYdomain(this.chartData, this.chart.yScale, this.chart.yMap);
			this.setupAxis();
			this.drawChart();
			this.chart.renderAxis();
		}

		setupAxis() {
			this.chart.bufferSize();
			this.chart.setAxisProperties(this.chart.axis.xAxis,
				{ scale: null, orientation: "bottom", ticks: null, tickFormat: null, tickValues: null, axisClass: "x axis" });
			this.chart.setAxisProperties(this.chart.axis.yAxis,
				{ scale: null, orientation: "left", ticks: 5, tickFormat: (value) => { return value + "%" }, tickValues: null, axisClass: "y axis" });
		}

		convertToPcts(data: TrackingData) {
			$.map(data.TrackingDetails, (d: CarrierTrackingDetails) => {
				d.CarrierTrackedPercentage = numeral(d.CarrierTrackedPercentage).multiply(100);
				d.ShipmentVolumeTrackedPercentage = numeral(d.ShipmentVolumeTrackedPercentage).multiply(100);
			});
			numeral(data.Summary.CarrierTrackedPercentage).multiply(100);
			numeral(data.Summary.ShipmentVolumeTrackedPercentage).multiply(100);
		}

		generateGroupData(data: Array<CarrierTrackingDetails>) {
            var tmpArray = new Array<CarrierTrackingData>();
			data.forEach((d: CarrierTrackingDetails, dataIndex: number) => {
				var gdtc = new GroupData("tracked-carriers", dataIndex, d.CarrierTrackedPercentage);
				var gdts = new GroupData("tracked-shipments", dataIndex, d.ShipmentVolumeTrackedPercentage);
				tmpArray.push(new CarrierTrackingData(gdtc, d));
				tmpArray.push(new CarrierTrackingData(gdts, d));
			});

			// Have "Enter" handle the re-rendering
			//this.chart.chart.data( /*something*/tmpArray);
			this.chart.onNewData(tmpArray);
			this.chartData = tmpArray || [];
		}

		drawChart() {
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
		}

		tooltipBindings() {
			var element = $("body > .chart-tooltip")[0];
			ko.cleanNode(element);
			ko.applyBindings(this.summaryData, element);
		}

		setDefaultSummary(data: CarrierTrackingDetails) {
			this.summaryData.dateEnd(data.TimeSegmentEnd);
			this.summaryData.dateStart(data.TimeSegmentStart);
			this.summaryData.operatingCarriers(data.CarriersTotal);
			this.summaryData.carriersTracked(data.CarrierTrackedTotal);
			this.summaryData.shipmentVolume(data.ShipmentVolumeTotal);
			this.summaryData.volumeTracked(data.ShipmentVolumeTracked);
			this.determineifDateRange(data.TimeSegmentStart, data.TimeSegmentEnd);
		}

		setSummaryData(d: CarrierTrackingData) {
			this.summaryData.dateEnd(d.timeSegmentEnd);
			this.summaryData.dateStart(d.timeSegmentStart);
			this.summaryData.shipmentVolume(d.shipmentVolumeTotal);
			this.summaryData.volumeTracked(d.shipmentVolumeTracked);
			this.summaryData.operatingCarriers(d.carriersTotal);
			this.summaryData.carriersTracked(d.carrierTrackedTotal);
			this.summaryData.carriersTrackedPct(d.carrierTrackedPercentage.valueOf());
			this.summaryData.volumeTrackedPct(d.shipmentVolumeTrackedPercentage.valueOf());
			this.determineifDateRange(d.timeSegmentStart, d.timeSegmentEnd);
		}

		determineifDateRange(startDate, endDate) {
			if (startDate.valueOf() === endDate.valueOf()) this.summaryData.formatDate(); else this.summaryData.formatDateRange();
		}

		//Create Layered/Stacked/Nested data
		generateLayeredData() {
			var stack = stack_.offset("zero")
				.values((d: { key: any; values: Array<CarrierTrackingData>; }) => { return d.values; })
				.x((d: CarrierTrackingData) => { return d.timeSegmentStart; })
				.y((d: CarrierTrackingData) => { return d.value; });
			var nest = d3.nest().key((d: CarrierTrackingData) => { return d.key; });
			return (this.chartData.length) ? stack(nest.entries(this.chartData)) : [];
		}
		
		//Create goal line
		createGoalLine(parentNode: d3.Selection<any>, x: any, y: any, width: number) {
			if (parentNode.selectAll(".goal-group")) parentNode.selectAll(".goal-group").remove();
			var goalGroup = parentNode.append("g").attr("class", "goal-group");

			if (goalGroup.selectAll(".tracking-goal")) parentNode.selectAll(".tracking-goal").remove();
			goalGroup.append("text").attr("class", "tracking-goal").attr("x", "50%").attr("y", y(this.pctGoal)).text(this.percentageGoal());

			if (goalGroup.selectAll(".goal-line")) parentNode.selectAll(".goal-line").remove();
			goalGroup.append("svg:line")
				.attr("class", "goal-line")
				.attr("x1", 0)
				.attr("y1", y(this.pctGoal))
				.attr("x2", this.chart.appearance.width + this.chart.appearance.margin.left + this.chart.appearance.margin.right)
				.attr("y2", y(this.pctGoal));
		}

		//Create tooltip
		createTooltip(): d3.Selection<any> {
			if (d3.selectAll("body > .ct.chart-tooltip")) d3.selectAll("body > .ct.chart-tooltip").remove();
			var tt = d3.select("body")
				.append("section")
				.attr("class", "ct chart-tooltip mdl-tooltip")
				.attr("for", "ct-tt")
				.html(() => {
					var tt = $("<section>"),
						dateStart = $("<span class='tt-date' data-bind='text: dateStartTt'></span>"),
						dateEnd = $("<span class='tt-date' data-bind='visible: isDateRange, text: dateEndTt'></span>"),
						circle = $("<circle class='dot' r='6' cx='6' cy='6'></circle>"),
						carrierTxt = $("<text class='text-field' x='20' y='10'>").text("Carriers Tracked"),
						carrierValue = $("<text class='tt-ct-value' x='80%' y='10' data-bind='text: carriersTrackedPctTxt'>"),
						carrierLabel = $("<svg class='tt-ct-label' height='20' width='100%'>"),
						rect = $("<rect class='diamond' height='9' width='9'>"),
						volumeTxt = $("<text class='text-field' x='20' y='10'>").text("Volume Tracked"),
						volumeValue = $("<text class='tt-vt-value' x='80%' y='10' data-bind='text: volumeTrackedPctTxt'>"),
						volumeLabel = $("<svg class='tt-vt-label' height='20' width='100%'>");

					carrierLabel.append(circle, carrierTxt, carrierValue);
					volumeLabel.append(rect, volumeTxt, volumeValue);
					tt.append([dateStart, dateEnd, carrierLabel, volumeLabel]);
					return tt.html();
				});
			return tt;
		}

		//Create Area SVG
		createAreaObj(x: any, y: any): d3.svg.Area<any> {
			return area_
				.interpolate("monotone")
				.x((d: CarrierTrackingData) => { return x(d.timeSegmentStart); })
				.y0(() => { return y(0); })
				.y1((d: CarrierTrackingData) => { return y(d.value); });
		}
		
		//Create path for each layer
		createPaths(parentNode: d3.Selection<any>, area: d3.svg.Area<any>, layers: any) {
			if (parentNode.selectAll("path")) parentNode.selectAll("path").remove();
			parentNode.selectAll("path")
				.data(layers)
				.enter()
				.append("path")
				.attr("class", (d: { key: string }) => { return d.key; })
				.attr("d", (d: { values: number[] }) => { return area(d.values); });
		}

		createGroupContainer(): d3.Selection<any> {
			if (this.chart.chart.selectAll(".group-container")) this.chart.chart.selectAll(".group-container").remove();
			return this.chart.chart.append("g").attr("class", "group-container");
		}

		//Create cd-group (circle diamond)
		createCdGroups(parentNode: d3.Selection<any>, layers: any): d3.Selection<any> {
			if (parentNode.selectAll(".cd-group")) parentNode.selectAll(".cd-group").remove();
			return parentNode.selectAll(".cd-group")
				.data(() => {
					return $.map(layers, (data: { key: string; values: Array<CarrierTrackingData>; }, index: number) => { return data.values; });
				}, (a: CarrierTrackingData) => { return a.timeSegmentStart.toString(); })
				.enter()
				.append("g")
				.attr("id", "ct-tt")
				.attr("class", "cd-group");
		}

		//Create circles
		createCircles(parentNode: d3.Selection<any>, x: any, y: any, dataPoints: any) {
			if (parentNode.selectAll(".dot")) parentNode.selectAll(".dot").remove();
			parentNode.selectAll(".dot")
				.data((d, index) => { return [{ 'index': index, 'data': d }]; })
				.enter()
				.append("circle")
				.attr("class", "dot")
				.attr("id", (d) => { return ["chart-tooltip-", d.data.uid].join("-"); })
				.attr("fill", () => { return "#abc"; })
				.attr("r", 4)
				.attr("cx", (d: { index: number; data: CarrierTrackingData; }) => { return x(d.data.timeSegmentStart); })
				.attr("cy", (d) => {
					dataPoints[d.data.uid] = dataPoints[d.data.uid] || [];
					dataPoints[d.data.uid].push(d);
					return y(d.data.carrierTrackedPercentage);
				});
		}

		//Create diamonds
		createDiamonds(parentNode: d3.Selection<any>, x: any, y: any, dataPoints: any) {
			if (parentNode.selectAll(".diamond")) parentNode.selectAll(".diamond").remove();
			parentNode.selectAll(".diamond")
				.data((d, index) => { return [{ 'index': index, 'data': d }]; })
				.enter()
				.append("rect")
				.attr("class", "diamond")
				.attr("id", (d) => {
					return ["chart-tooltip-", d.data.uid].join("-");
				})
				.attr("fill", () => { return "#abc"; })
				.attr("transform", (d) => {
					var xTranslate = x(d.data.timeSegmentStart);
					var yTranslate = y(d.data.shipmentVolumeTrackedPercentage);
					return ["translate(", xTranslate, ", ", yTranslate - 8, ") rotate(45)"].join("");
				})
				.attr("height", 8)
				.attr("width", 8);
		}

		//Creates an aread that is the full size of the chart and cd-groud
		createHoverArea(parentNode: d3.Selection<any>, x: any, y: any, dataPoints: any) {
			if (parentNode.selectAll(".hover-area")) parentNode.selectAll(".hover-area").remove();
			parentNode.selectAll(".hover-area")
				.data((d, index) => { return [{ 'index': index, 'data': d }]; })
				.enter()
				.append("rect")
				.attr("class", "hover-area")
				.attr("fill", () => { return "transparent"; })
				.attr("x", (d) => { return x(d.data.timeSegmentStart) - 6; })
				.attr("y", 0)
				.attr("height", "100%")
				.attr("width", 15)
				.attr("style", "width: 15px; stroke-width: 1px;");
		}

		//Tooltip event handlers
		createTooltipEvents(eventTarget: d3.Selection<any>, tooltipContainer: d3.Selection<any>, context: CarrierTracking) {
			eventTarget.on("mouseenter", (d: CarrierTrackingData) => {
				var event: any = d3.event;
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
				.on("mouseleave", () => {
					var event: any = d3.event;
					var dot = $(event.currentTarget).find(".dot");
					var diamond = $(event.currentTarget).find(".diamond");
					dot.attr("r", 4);
					diamond.attr("height", 8);
					diamond.attr("width", 8);
					this.setDefaultSummary(this.defaultSummaryData);
					tooltipContainer.transition().duration(500);
					tooltipContainer.style("opacity", 0);
					$("body > .ct.chart-tooltip").removeClass("is-active");
				});
		}

		viewReport() {
            var filterProvider = new Dashboard.Utilities.FilterProvider([]);
            var sorts = filterProvider.getSortsFromKey(Dashboard.Utilities.FilterProvider.Tracking);
            this.viewReportPage(sorts);
        }
	}

	export class CarrierTrackingData extends GroupData {
		carriersTotal: number;
		carrierTrackedTotal: number;
		carrierTrackedPercentage: number;
		shipmentVolumeTotal: number;
		shipmentVolumeTracked: number;
		shipmentVolumeTrackedPercentage: number;
        timeSegmentStart: Date;
        timeSegmentEnd: Date;

		constructor(gd: GroupData, ctd: CarrierTrackingDetails) {
			super(gd.key, gd.uid, gd.value);
			this.carriersTotal = ctd.CarriersTotal;
			this.carrierTrackedTotal = ctd.CarrierTrackedTotal;
			this.carrierTrackedPercentage = ctd.CarrierTrackedPercentage;
			this.shipmentVolumeTotal = ctd.ShipmentVolumeTotal;
			this.shipmentVolumeTracked = ctd.ShipmentVolumeTracked;
			this.shipmentVolumeTrackedPercentage = ctd.ShipmentVolumeTrackedPercentage;
            this.timeSegmentStart = moment(ctd.TimeSegmentStart).utc().startOf("day").toDate();
			this.timeSegmentEnd = moment(ctd.TimeSegmentEnd).utc().startOf("day").toDate();
		}
	}

	export class CarrierTrackingSummary {
		carriersTracked: KnockoutObservableNumber;
		carriersTrackedPct: KnockoutObservableAny;
		carriersTrackedPctTxt: KnockoutObservableString;
		dateEnd: KnockoutObservableAny;
		dateStart: KnockoutObservableAny;
		isDateRange: KnockoutObservableBool;
		operatingCarriers: KnockoutObservableNumber;
		shipmentVolume: KnockoutObservableNumber;
		volumeTracked: KnockoutObservableNumber;
		volumeTrackedPct: KnockoutObservableAny;
		volumeTrackedPctTxt: KnockoutObservableString;

		//Tooltip properties
		dateStartTt: KnockoutObservableString;
		dateEndTt: KnockoutObservableString;

		constructor() {
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

			this.carriersTrackedPct.subscribe((pct) => { this.carriersTrackedPctTxt(numeral(pct).format("0,0") + "%"); });
			this.volumeTrackedPct.subscribe((pct) => { this.volumeTrackedPctTxt(numeral(pct).format("0,0") + "%"); });
		}

		formatDateRange() {
			this.isDateRange(true);
			var dateEnd = moment(this.dateEnd()).format("MMM D, YYYY");
			var dateStart = moment(this.dateStart()).format("MMM D, YYYY");
			this.dateEnd(dateEnd);
			this.dateEndTt(" - " + dateEnd);
			this.dateStart(dateStart);
			this.dateStartTt(dateStart);

		}

		formatDate() {
			this.isDateRange(false);
			var day = moment(this.dateStart()).format("dddd");
			var dateShort = moment(this.dateStart()).format("MMM D, YYYY");
			this.dateEnd(dateShort);
			this.dateStart(day);
			this.dateStartTt([day, ", ", dateShort].join(""));

		}
	}
}