/// <reference path="../../../../../commoncontent/content/typedefs/d3.d.ts" />
/// <reference path="../Models/PerformanceEnums.ts" />

module TenFour.Dashboard.Performance.ViewModels {
	import Metric = PerformanceEnums.CarrierSortMetrics;
	import CarrierData = WebService.Models.ICarrierRowData;
	declare var numeral;
	var volumeBarWidth = 40;
	var deliveryCircleRadius = 8;
	var pickupDiamondSize = 12;

	export class TopCarrierPerformanceChart {
		chart: Performance.Models.Chart;
		chartData: any;
		carriers: Array<CarrierData>;
		tooltips: KnockoutObservableArray;

		//FOR TABLE
		allChartData: KnockoutObservableArray;
		sortedChartData: KnockoutComputed;
		table: CarrierPerformanceLevelOneTable;

		//REFACTOR
		carrierSort: ViewModels.IKnockoutObservableCarrierSort;
		carrierSortMenu: ViewModels.CarrierSortMenu;

		constructor(public filter: App.Filter.IPagedFilter, private viewReportPage: (key: Array<App.Filter.ISortClause>) => void, public parentContext: Performance.Page) {
			this.chart = new Performance.Models.Chart("top-carriers", 318, 626, { top: 20, right: 66, bottom: 50, left: 66 });
			this.carriers = new Array<CarrierData>();
			this.tooltips = ko.observableArray([]);

			//REFACTOR
			var sort = new ViewModels.CarrierSort(Metric[0], 1);
			this.carrierSort = ko.observable(sort);
			this.carrierSortMenu = new ViewModels.CarrierSortMenu(this.carrierSort);

			this.allChartData = ko.observableArray([]);
			this.sortedChartData = ko.computed(this.computeVisibleCarrierData, this);
			this.table = new CarrierPerformanceLevelOneTable(this.sortedChartData);

			this.sortedChartData.subscribeChanged((newValues) => {
				if (newValues && this.chartData) {
					this.chartData.carriers = newValues;
					this.carriers = newValues;
					this.onNewData();
					this.initializeTooltips(newValues);
				}
			});
		}

		init() {
			this.chart.layout.xAxisWraps = true;
			this.chart.layout.xHasRangeRoundBands = true;
			this.chart.layout.yIsPct = true;
			this.chart.layout.xIsOrdinal = true;
			this.chart.layout.y2IsLinear = true;
			this.chart.init();
			this.chart.xMap = (x: CarrierData) => { return x.name; }
			this.chart.yMap = () => { return 100; }
			this.chart.y2Map = () => { return this.chartData.highestVolume; };
			this.chartData = [];
			this.chart.chart.data(this.chartData);
		}

		updateData(data: WebService.Models.ILevelOneCarrierPerformanceReport) {
			this.chartData = data.ChartData;
			this.carriers = data.ChartData.carriers;
			this.allChartData(data.ChartData.carriers);
			this.computeVisibleCarrierData();
			this.onNewData();
			this.resetLegend();
		}

		//summary - Will populate chart with new data
		onNewData() {
			this.chart.appearance.height = 318;
			this.chart.appearance.width = 626;
			this.chart.setXdomain(this.chartData.carriers, this.chart.xScale, this.chart.xMap);
			this.chart.setYdomain(this.chartData.carriers, this.chart.yScale, this.chart.yMap);
			this.chart.setY2domain(this.chartData.carriers, this.chart.y2Scale, this.chart.y2Map);
			this.setupAxis();
			this.chart.renderAxis();
			this.setupAxisProperties();
			this.drawChart();
		}

		setupAxis() {
			this.chart.bufferSize();
			this.chart.layout.hasTicks = true;
			this.chart.setAxisProperties(this.chart.axis.xAxis,
				{ scale: null, orientation: "bottom", ticks: null, tickFormat: null, tickValues: null, axisClass: "x axis" });
			this.chart.setAxisProperties(this.chart.axis.yAxis,
				{ scale: null, orientation: "left", ticks: 5, tickFormat: (value) => { return value + "%" }, tickValues: null, axisClass: "y axis" });
			this.chart.setAxisProperties(this.chart.axis.y2Axis,
				{ scale: null, orientation: "right", ticks: null, tickFormat: null, tickValues: null, axisClass: "y2 axis" });
		}

		setupAxisProperties() {
			var xoffset = (this.chart.appearance.height / 2) * -1;
			this.chart.createAxisLabel(this.chart.$yAxis,
				{ text: "On-Time Performance", textAnchor: "middle", axisTextClass: "y label", axisXOffset: xoffset, axisYOffset: -50, axisTransform: "rotate(-90)" });
			this.chart.createAxisLabel(this.chart.$y2Axis,
				{ text: "Volume (# of Shipments)", textAnchor: "middle", axisTextClass: "y2 label", axisXOffset: xoffset, axisYOffset: 60, axisTransform: "rotate(-90)" });
		}

		drawChart() {
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
		}

		createGroupContainer(): d3.Selection<any> {
			var groupContainer = this.chart.chart.selectAll(".group-container");
			groupContainer.remove();
			return this.chart.chart.append("g").attr("class", "group-container");
		}

		createBcdGroup(parentNode: d3.Selection<any>): d3.Selection<any> {
			return parentNode.selectAll(".bcd-group")
				.remove()
				.data(this.carriers)
				.enter()
				.append("g")
				.attr({ "class": "bcd-group", id: (d: CarrierData) => { return "top-carrier-" + d.carrierId; } })
				.on("mouseover", (d: CarrierData) => {
					var event: any = d3.event;
					var target = $(event.currentTarget);
					var id = target.attr("id");
					if (d.Volume !== 0 || d.Pickup !== 0 || d.Delivery !== 0 || this.chartData.avgdelivery !== 0 || this.chartData.avgpickup != null) {
						var top = target.find(".volume-bar").offset().top - 150;
						var left = target.find(".volume-bar").offset().left - 50;
						var position = ["left: ", left, "px; top: ", top, "px;"].join("");

						$(".chart-tooltip[for='" + id + "']").attr("style", position);
						$(".chart-tooltip[for='" + id + "']").addClass("is-active");
					}
				}).on("mouseout", () => {
					var event: any = d3.event;
					var target = $(event.currentTarget);
					var id = target.attr("id");
					$(".chart-tooltip[for='" + id + "']").removeClass("is-active");
				})
				.on("click", (d: CarrierData) => {
					$(".tooltip-section .mdl-tooltip").removeClass("is-active");
					this.showLevelTwo(d);
				});
		}

		createBars(parentNode: d3.Selection<any>, x: any, y2: any): d3.Selection<any> {
			return parentNode.selectAll(".volume-bar")
				.remove()
				.data((d, index) => { return [{ 'index': index, 'data': d }]; })
				.enter()
				.append("rect")
				.attr({
					"class": "volume-bar metric-item full-volume-bar", width: volumeBarWidth,
					height: (d) => {
						var appear = this.chart.appearance, h = appear.height + appear.margin.top + appear.margin.bottom;
						return h - this.chart.y2Scale(d.data.Volume);
					},
					y: (d: { index: number; data: CarrierData }) => { return y2(d.data.Volume); },
					x: (d: { data: { name: string } }) => { return ((this.chart.xScale(d.data.name) || 0) + (this.chart.xScale.rangeBand() / 2) - (volumeBarWidth / 2)); }
				});
		}

		createBarText(parentNode: d3.Selection<any>) {
			parentNode.selectAll("text")
				.remove()
				.data((d, index) => { return [{ 'index': index, 'data': d }]; })
				.enter()
				.append("text")
				.style("text-anchor", "middle")
				.attr({
					"class": "volume-bar text metric-item full", x: (d) => (this.chart.xScale(d.data.name) + (this.chart.xScale.rangeBand() / 2)),
					y: (d) => {
						var yOffset, volume = d.data.Volume, yRange = this.chart.y2Scale(volume), difference = yRange - this.chart.appearance.height;
						if (d.data.Volume === 0) { yOffset = this.chart.appearance.height - 10; }
						else if (difference < 10) { yOffset = this.chart.y2Scale(volume) + 15; }
						else { yOffset = this.chart.y2Scale(volume) - 15; }
						return yOffset;
					}
				})
				.text((d) => {
					var volume = d.data.Volume;
					if (volume >= 1000) return numeral(volume).format("0.0a");
					else if (volume === 0) return "";
					else return volume.toLocaleString();
				});
		}

		createCircles(parentNode: d3.Selection<any>, x: any, y: any) {
			parentNode.selectAll(".delivery-circle")
				.remove()
				.data((d, index) => { return [{ 'index': index, 'data': d }]; })
				.enter()
				.append("circle")
				.attr({
					"class": "delivery-circle metric-item", cy: (d) => { return this.chart.yScale(d.data.Delivery); }, r: deliveryCircleRadius,
					cx: (d) => {
						var xTranslate = this.chart.xScale(d.data.name) + (this.chart.xScale.rangeBand() / 2);
						xTranslate = xTranslate + (deliveryCircleRadius + 4);
						return xTranslate;
					}
				});
		}

		createDiamonds(parentNode: d3.Selection<any>, x: any, y: any) {
			parentNode.selectAll(".pickup-diamond")
				.remove()
				.data((d, index) => { return [{ 'index': index, 'data': d }]; })
				.enter()
				.append("rect")
				.attr({
					"class": "pickup-diamond metric-item", height: pickupDiamondSize, width: pickupDiamondSize, "transform": (d) => {
						var xTranslate = this.chart.xScale(d.data.name) + (this.chart.xScale.rangeBand() / 2);
						xTranslate = xTranslate - (pickupDiamondSize / 2);
						return "translate(" + (xTranslate - 2) + "," + (this.chart.yScale(d.data.Pickup) - 10) + ") rotate(" + 45 + ")";
					}
				});
		}

		createHoverArea(parentNode: d3.Selection<any>, x: any, y: any) {
			parentNode.selectAll(".hover-area")
				.remove()
				.data((d, index) => { return [{ 'index': index, 'data': d }]; })
				.enter()
				.append("rect")
				.attr({ "class": "hover-area", "fill": () => { return "transparent"; }, height: "100%", x: (d) => { return (this.chart.xScale(d.data.name) + (this.chart.xScale.rangeBand() / 2) - (volumeBarWidth / 2)); }, y: 0, style: "stroke-width: 1px;", width: 40 });
		}

		initializeTooltips(carrierData: Array<any>) {
			if (carrierData) {
				var tooltips = [];
				$.each(carrierData, (i: number, d) => { tooltips.push(new Models.ChartTooltip(`top-carrier-${d.carrierId}`, d.Volume, d.Pickup, d.Delivery, this.chartData.avgpickup, this.chartData.avgdelivery, this.chartData.tooltipHeader)); });
				this.parentContext.observableTooltipCollection(tooltips);
				this.tooltips(tooltips);
				this.chart.createSvgTooltipElements();
			}
		}

		computeVisibleCarrierData(): Array<WebService.Models.ICarrierRowData> {
			var allCarriers = this.allChartData();
			var sorter = this.carrierSort();
			var sortedCarriers = allCarriers.sort(sorter.compareFunction.bind(sorter)).slice(0, 6);

			return sortedCarriers;
		}

		resetLegend() {
			// Set all Legend Items back to Visible when we redraw the chart

			$(".levelOneContainer .CarrierPerformanceChartlegend .legend-button").each((idx, val) => {
				var target = $(val);
				var metricClass = target.data('metric');
				var metricItems = $("#carrierPerformanceChartLevelOne .metricItem." + metricClass);

				var status = target.attr('data-toggle');

				target.attr("data-toggle", "true");
				try {
					// IE is throwing an exception here because of calling remove() on 'undefined'.
					metricItems.filter((i) => { metricItems[i].classList.remove("hide"); });
				} catch (e) {
					// nothing
				}
			});
		}

		toggleChartMetric($data: any, event: JQueryEventObject) {
			var target = $(event.currentTarget);
			var metricClass = target.data('metric');
			var metricItems = $("#top-carriers .metric-item." + metricClass);

			var status = target.attr('data-toggle');
			if (status === "true") {
				target.attr("data-toggle", "false");
				metricItems.filter((i) => { metricItems[i].classList.add("hide"); });
			} else {
				target.attr("data-toggle", "true");
				metricItems.filter((i) => { metricItems[i].classList.remove("hide"); });
			}
		}

		sortByMetric($data: any, event: JQueryEventObject) {
			var target = $(event.currentTarget);
			var metric = Metric[target.data("metric")];
			var sort = target.data("sort");
			this.carrierSortMenu.setSort(metric, sort);
		}

		showLevelTwo(d: CarrierData) {
			var settings = ko.toJSON(this.filter);
			var $mask = $("#mask");
			$mask.show();
			WebService.getCarrierPerformanceLevelTwo(settings, parseInt(d.carrierId))
				.done((data) => {
					$('.LevelOne').addClass("hidden");
					$('.LevelTwo').removeClass("hidden");
					this.parentContext.carrierOverTime.carrierId = parseInt(d.carrierId);
					this.parentContext.carrierOverTime.carrierName(d.name);
                    this.parentContext.carrierOverTime.updateData(data);
				})
				.fail(() => {
					alert("An Error has Occured");
				})
				.always(() => $mask.hide());
		}

		viewReport() {
			this.viewReportPage([this.carrierSortMenu.getSort()]);
		}
	}
}