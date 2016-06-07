/// <reference path="../../../../../commoncontent/content/typedefs/d3.d.ts" />

module TenFour.Dashboard.Performance.ViewModels {
	import CarrierOverTimeData = WebService.Models.IAggregatePerformanceLevelTwoData;
	declare var numeral;
	var area_: any = d3.svg.area();
	var maxVolumeBarWidth = 40;

	export class CarrierOverTimeChart {
		carrierId: number;
		carrierName: KnockoutObservableString;
		carrierData: Array<CarrierOverTimeData>;
		chart: Performance.Models.Chart;
		chartData: any;
		table: CarrierPerformanceLevelTwoTable;
		tickspan: number;
		tooltips: KnockoutObservableArray;
		volumeBarWidth: number;

		constructor(public filter: App.Filter.IPagedFilter, private showShipmentLog: (additionalFilterClauses: Array<App.Filter.IFilterClause>) => void, public parentContext: Performance.Page) {
			this.carrierName = ko.observable("");
			this.chart = new Performance.Models.Chart("carrier-over-time", 318, 626, { top: 20, right: 66, bottom: 40, left: 66 });
			this.table = new CarrierPerformanceLevelTwoTable();
			this.tooltips = ko.observableArray([]);
		}

		init() {
			this.chart.layout.xAxisWraps = true;
			this.chart.layout.xCharToSplitOn = " - ";
			this.chart.layout.xHasRangeRoundBands = true;
			this.chart.layout.xRangeBoundPadding = 0.2;
			this.chart.layout.yIsPct = true;
			this.chart.layout.xIsOrdinal = true;
			this.chart.layout.y2IsLinear = true;
			this.chart.init();
			this.chart.xMap = (x: CarrierOverTimeData) => { return x.StartDate; }
			this.chart.yMap = () => { return 100; }
			this.chart.y2Map = () => { return this.chartData.HighestVolume; };
			this.chartData = [];
			this.chart.chart.data(this.chartData);
		}

		updateData(data: WebService.Models.ILevelTwoCarrierPerformanceReport) {
			this.chartData = data;
			this.carrierData = data.CarrierData;
			this.onNewData();
			this.resetLegend();
			this.table.onNewData(data.CarrierData);
		}

		onNewData() {
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
		}

		setupAxis() {
			var self = this;
			this.chart.bufferSize();
			this.chart.layout.hasTicks = true;
			var maxTickMarks = 10;
			var tickFormat = (d, i) => {
				var carrierData = self.carrierData;
				if (carrierData.length <= maxTickMarks) return carrierData[i].TimePeriodLabel;
				self.tickspan = Math.ceil(carrierData.length / maxTickMarks);
				if (i % self.tickspan === 0) return carrierData[i].TimePeriodLabel;
				return "";
			}
			this.chart.setAxisProperties(this.chart.axis.xAxis,
				{ scale: null, orientation: "bottom", ticks: null, tickFormat: tickFormat, tickValues: null, axisClass: "x axis" });
			this.chart.setAxisProperties(this.chart.axis.yAxis,
				{ scale: null, orientation: "left", ticks: 5, tickFormat: (value) => { return value + "%" }, tickValues: null, axisClass: "y axis" });
			this.chart.setAxisProperties(this.chart.axis.y2Axis,
				{ scale: null, orientation: "right", ticks: null, tickFormat: null, tickValues: null, axisClass: "y2 axis" });
			this.volumeBarWidth = Math.min(this.chart.xScale.rangeBand(), maxVolumeBarWidth);
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
			var groupContainer = this.createGroupContainer();
			this.createAvgLine(this.chart.chart, "AverageCarrierPickupPercent", "avg-pickup");
			this.createAvgLine(this.chart.chart, "AverageCarrierDeliveryPercent", "avg-delivery");
			var bcdGroup = this.createBcdGroup(groupContainer);
			this.createBars(bcdGroup, this.chart.xScale, this.chart.y2Scale);
			var barWidth = Math.min(this.chart.xScale.rangeBand(), maxVolumeBarWidth);
			if (barWidth > 20) this.createBarText(bcdGroup);
			this.createCircles(bcdGroup, this.chart.xScale, this.chart.yScale);
			this.createDiamonds(bcdGroup, this.chart.xScale, this.chart.yScale);
			this.createHoverArea(bcdGroup, this.chart.xScale, this.chart.yScale);
		}

		createGroupContainer(): d3.Selection<any> {
			var groupContainer = this.chart.chart.selectAll(".group-container");
			groupContainer.remove();
			return this.chart.chart.append("g").attr("class", "group-container");
		}
		
		createAvgLine(parentNode: d3.Selection<any>, datafield: string, className: string) {
			var lineCurve: any = d3.svg.line()
				.x((d: any) => { return this.chart.xScale(d.StartDate); })
				.y((d: any) => { return this.chart.yScale(d[datafield]); })
				.interpolate("basis");
			if (parentNode.selectAll("." + className)) parentNode.selectAll("." + className).remove();
			parentNode.append("path").attr("class", className + " metric-item").attr("d", lineCurve(this.carrierData));
		}

		createBcdGroup(parentNode: d3.Selection<any>): d3.Selection<any> {
			return parentNode.selectAll(".bcd-group")
				.remove()
				.data(this.carrierData)
				.enter()
				.append("g")
				.attr("class", "bcd-group")
				.attr("width", this.volumeBarWidth)
				.attr("id", (d) => "segment-tt-" + this.carrierData.indexOf(d))
				.on("mouseover", (d: CarrierOverTimeData) => {
					var event: any = d3.event;
					var target = $(event.currentTarget);
					var id = target.attr("id");
					if (d.Volume !== 0 || d.Pickup !== 0 || d.Delivery !== 0 || d.AverageCarrierPickupPercent !== 0 || d.AverageCarrierDeliveryPercent !== 0) {
						var top = target.find(".volume-bar").offset().top - 150;
						var left = target.find(".volume-bar").offset().left - 50;
						var position = ["left: ", left, "px; top: ", top, "px;"].join("");
						$(".chart-tooltip[for='" + id + "']").attr("style", position).addClass("is-active");
					} else {
						target.css("cursor", "default");
					}
				}).on("mouseout", () => {
					var event: any = d3.event;
					var target = $(event.currentTarget);
					var id = target.attr("id");
					$(".chart-tooltip[for='" + id + "']").removeClass("is-active");
				});
		}

		createBars(parentNode: d3.Selection<any>, x: any, y2: any): d3.Selection<any> {
			return parentNode.selectAll(".volume-bar")
				.remove()
				.data((d, index) => { return [{ 'index': index, 'data': d }]; })
				.enter()
				.append("rect")
				.attr("class", "volume-bar metric-item full-volume-bar")
				.attr("width", this.volumeBarWidth)
				.attr("height", (d) => {
					var appear = this.chart.appearance;
					var h = appear.height + appear.margin.top + appear.margin.bottom;
					return h - this.chart.y2Scale(d.data.Volume);
				})
                .attr("x", (d) => {
			         return (this.chart.xScale(d.data.StartDate) + (this.chart.xScale.rangeBand() / 2) - (this.volumeBarWidth / 2));
			    })
				.attr("y", (d: { index: number; data: CarrierOverTimeData }) => { return y2(d.data.Volume); });
		}

		createBarText(parentNode: d3.Selection<any>) {
			parentNode.selectAll("text")
				.remove()
				.data((d, index) => { return [{ 'index': index, 'data': d }]; })
				.enter()
				.append("text")
				.style("text-anchor", "middle")
				.attr("class", "volume-bar text metric-item full")
				.attr("width", this.volumeBarWidth)
				.attr("x", (d) => (this.chart.xScale(d.data.StartDate) + (this.chart.xScale.rangeBand() / 2)))
				.attr("y", (d) => {
					var yOffset = 0;
					var volume = d.data.Volume;
					var yRange = this.chart.y2Scale(volume);
					var difference = yRange - this.chart.appearance.height;
					if (volume === 0) { yOffset = this.chart.appearance.height - 10; }
					else if (difference < 15) { yOffset = this.chart.y2Scale(volume) + 15; }
					else { yOffset = this.chart.y2Scale(volume) - 15; }
					return yOffset;
				})
				.text((d) => {
					var volume = d.data.Volume;
					var appear = this.chart.appearance;
					var h = appear.height + appear.margin.top + appear.margin.bottom;
					var yRange = this.chart.y2Scale(d.data.Volume);
					var offset = h - yRange;
					if (volume >= 1000) return numeral(volume).format("0.0a");
					else if (this.volumeBarWidth < 16 || volume === 0) return "";
					else return volume.toLocaleString();
				});
		}

		createCircles(parentNode: d3.Selection<any>, x: any, y: any) {
			var barWidth = Math.min(this.chart.xScale.rangeBand(), maxVolumeBarWidth);
			parentNode.selectAll(".delivery-circle")
				.remove()
				.data((d, index) => { return [{ 'index': index, 'data': d }]; })
				.enter()
				.append("circle") // Delivery
				.attr("class", "delivery-circle metric-item")
				.attr("cx", (d) => {
					var xtranslate = (this.chart.xScale(d.data.StartDate) + (this.chart.xScale.rangeBand() / 2)) - (barWidth / 2);
					return  xtranslate + barWidth - (barWidth / 4);
				})
				.attr("cy", (d) => { return this.chart.yScale(d.data.Delivery); })
				.attr("r", (d) => ((d.data.Volume > 0) ? (barWidth / 4) : 0));
		}

		createDiamonds(parentNode: d3.Selection<any>, x: any, y: any) {
			var barWidth = Math.min(this.chart.xScale.rangeBand(), this.volumeBarWidth);
			var rectSize = Math.sqrt(Math.pow(barWidth, 2) + Math.pow(barWidth, 2));
			parentNode.selectAll(".pickup-diamond")
				.remove()
				.data((d, index) => { return [{ 'index': index, 'data': d }]; })
				.enter()
				.append("rect") // Delivery
				.attr("class", "pickup-diamond metric-item")
				.attr("height", (d) => (d.data.Volume > 0 ? (rectSize / 4) : 0))
				.attr("width", (d) => (d.data.Volume > 0 ? (rectSize / 4) : 0))
				.style("color", "#fff")
				.attr("transform", (d) => {
					var xTranslate = this.chart.xScale(d.data.StartDate) + (this.chart.xScale.rangeBand() / 2) - (barWidth / 4);
					return "translate(" + xTranslate + "," + (this.chart.yScale(d.data.Pickup) - (barWidth / 4)) + ") rotate(" + 45 + ")";
				});
		}

		createHoverArea(parentNode: d3.Selection<any>, x: any, y: any) {
			parentNode.selectAll(".hover-area")
				.remove()
				.data((d, index) => { return [{ 'index': index, 'data': d }]; })
				.enter()
				.append("rect")
				.attr("class", "hover-area")
				.attr("fill", () => { return "transparent"; })
				.attr("x", (d) => { return (this.chart.xScale(d.data.StartDate) + (this.chart.xScale.rangeBand() / 2) - (this.volumeBarWidth / 2)); })
				.attr("y", 0)
				.attr("width", this.volumeBarWidth)
				.attr("style", "height: 100%; stroke-width: 1px;");
		}

		initializeTooltips(carrierData: Array<any>) {
			if (carrierData) {
				var tooltips = [];
				$.each(carrierData, (i: number, d) => { tooltips.push(new Models.ChartTooltip(`segment-tt-${i}`, d.Volume, d.Pickup, d.Delivery, d.AverageCarrierPickupPercent, d.AverageCarrierDeliveryPercent, d.TooltipHeader)); });
				this.parentContext.observableTooltipCollection(tooltips);
				this.chart.createSvgTooltipElements();
			}
		}

		resetLegend() {
			$(".levelTwoContainer .CarrierPerformanceChartlegend .legend-button").each((idx, val) => {
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
			var metricItems = $("#carrier-over-time .metric-item." + metricClass);

			var status = target.attr('data-toggle');
			if (status === "true") {
				target.attr("data-toggle", "false");
				metricItems.filter((i) => { metricItems[i].classList.add("hide"); });
			} else {
				target.attr("data-toggle", "true");
				metricItems.filter((i) => { metricItems[i].classList.remove("hide"); });
			}
		}

		showLevelOne(filter: App.Filter.IPagedGenericFilter, carrierId: number) {
			this.parentContext.observableTooltipCollection(this.parentContext.topCarriersChart.tooltips());
			$('.LevelTwo').addClass("hidden");
			$('.LevelOne').removeClass("hidden");
		}

		viewReport() {
			var carrierRestriction = new App.Filter.Restriction(App.Filter.FilterOperator.EqualTo, [this.carrierId]);
            var filterClauses: Array<App.Filter.IFilterClause> = [
                new App.Filter.FilterClause("RollupCarrierID", carrierRestriction)
            ];
            this.showShipmentLog(filterClauses);
		}
	}
} 