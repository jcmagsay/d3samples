/// <reference path="../../../../../CommonContent/Content/TScripts/Utilities.ts" />
/// <reference path="../../../../../Marketplace/TenFour.MarketplacePortal/TScripts/Dashboard/Company.ts" />
module TenFour.Dashboard.Performance.Models {
	import Axis = Performance.Interfaces.IAxis;
	import Box = Performance.Interfaces.IBox;

	export class Chart {
		axis: Axis;
		$xAxis: any;
		$yAxis: any;
		$y2Axis: any;
		xScale: any; //TODO: union type using d3.time.Scale<number, number> | d3.scale.Ordinal<number, number>;
		yScale: d3.scale.Linear<number, number>;
		y2Scale: d3.scale.Linear<number, number>;
		xMap: (T) => any;
		yMap: (T) => any;
		y2Map: (T) => any;
		chartId: string;
		appearance: Properties.Appearance;
		layout: Properties.Layout;
		base: d3.Selection<any>;
		chart: d3.Selection<any>;

		constructor(chartId: string, public h: number, w: number, m: Box) {
			this.axis = { xAxis: d3.svg.axis(), yAxis: d3.svg.axis(), y2Axis: d3.svg.axis() };
			this.appearance = new Properties.Appearance(h, m, w);
			this.layout = new Properties.Layout(this.axis);
			this.chartId = "#" + chartId;
			this.appearance.height = h;
			this.appearance.width = w;
		}

		init() {
			this.createChartWrapper();
			this.setupScale();
			this.setupRanges();
			this.setupAxis();
			this.renderChart();
		}

		onNewData(data: any) {
			this.chart.data(data).enter();
			this.rescaleDomains(data);
		}

		private setupScale() {
			if (this.layout.xIsOrdinal) this.xScale = d3.scale.ordinal();
			if (this.layout.xIsTime) this.xScale = d3.time.scale();
			this.yScale = d3.scale.linear();
			if (this.layout.y2IsLinear) this.y2Scale = d3.scale.linear();
			
		}

		private setupRanges() {
			this.xScale.range([0, this.appearance.width]);
			this.yScale.range([this.appearance.height, 0]);
			if (this.layout.y2IsLinear) this.y2Scale.range([this.appearance.height, 0]);
		}

		private setupAxis() {
			this.axis.xAxis.scale(this.xScale);
			this.axis.yAxis.scale(this.yScale);
			if (this.layout.y2IsLinear) this.axis.y2Axis.scale(this.y2Scale);
		}

		private renderChart() {
			this.setupAxis();
		}

		private rescaleDomains(data: any) {
			this.xScale.domain(d3.extent(data.map(this.xMap)));
			this.yScale.domain([0, d3.max(data.map(this.yMap))]);
			if (this.layout.y2IsLinear) this.y2Scale.domain([0, d3.max(data.map(this.y2Map))]);
		}

		renderAxis() {
			this.createXaxis(this.chart);
			this.createYaxis(this.chart);
			if (this.layout.y2IsLinear) this.createY2Axis(this.chart);
		}

		private setupSelections() {
			
		}
		
		bufferSize() {
			var a = this.appearance;
			this.appearance.height = (a.height - a.margin.top - a.margin.bottom);
			this.appearance.width = (a.width - a.margin.left - a.margin.right);
		}

		setXdomain<T>(data: Array<T>, x: d3.scale.Ordinal<string, string>, xmap: (T) => string) {
			var appear = this.appearance;
			if (this.layout.xIsTime) {
				var xs = d3.extent(data.map(xmap));
				x.domain(xs);
			} else {
				x.domain(data.map(xmap));
			}

			if (this.layout.xHasRangeRoundBands) x.rangeRoundBands([0, appear.width - (appear.margin.left - appear.margin.right)], this.layout.xRangeBoundPadding);
		}

		setYdomain<T>(data: Array<T>, y: d3.scale.Linear<number, number>, ymap: (T) => number) {
			var yMax = d3.max(data.map(ymap));
			y.domain([0, yMax]);
		}

		setY2domain<T>(data: Array<T>, y2: any, y2map: (T) => number) {
			var y2Max = d3.max(data.map(y2map));
			y2.domain([0, y2Max]);
		}

		createChartWrapper() {
			this.createChartContainer();
			this.createSpacingGroup(this.base, this.appearance);
		}

		createChartContainer() {
			var appear = this.appearance;
			this.base = d3.select(this.chartId).append("svg").attr({ "width": appear.width + appear.margin.left + appear.margin.right, "height": appear.height + appear.margin.top + appear.margin.bottom });
		}

		createSpacingGroup(parentNode: d3.Selection<any>, appear: Properties.Appearance) {
			this.chart = parentNode.append("g").attr("transform", "translate(" + appear.margin.left + "," + appear.margin.top + ")");	
		}

		createTickLines(parentNode: d3.Selection<any>, scale: any): void {
			if (parentNode.selectAll(".horizontal-line-group")) parentNode.selectAll(".horizontal-line-group").remove();
			parentNode.append("g").attr("class", "horizontal-line-group")
				.selectAll(".horizontal-line").append("g")
				.remove()
				.data(scale.ticks(5))
				.enter()
				.append("line")
				.attr("class", "horizontal-line")
				.attr("x1", 0)
				.attr("x2", this.appearance.width + this.appearance.margin.left + this.appearance.margin.right)
				.attr("y1", (d) => { return scale(d).toString(); })
				.attr("y2", (d) => { return scale(d).toString(); })
				.attr("fill", "none")
				.attr("shape-rendering", "crispEdges");
		}

		createLine(parentNode: d3.Selection<any>, scale: any, datapoint: number, classname: string) {
			if (parentNode.selectAll("." + classname)) parentNode.selectAll("." + classname).remove();
			parentNode.append("line")
				.attr("class", classname + " line metric-item")
				.attr("x1", 0)
				.attr("y1", scale(datapoint))
				.attr("x2", this.appearance.width + this.appearance.margin.left + this.appearance.margin.right)
				.attr("y2", scale(datapoint));
		}

		createXaxis(parentNode: d3.Selection<any>): void {
			if (this.$xAxis) parentNode.selectAll(".x.axis").remove();
			this.$xAxis = parentNode.append("g").attr({ "class": "x axis", transform: "translate(0, " + this.h + ")" }).call(this.layout.axis.xAxis);

			if (!this.layout.hasTicks) this.$xAxis.selectAll("text").remove();
			if (this.layout.xAxisWraps) {
				this.$xAxis.selectAll("text").call(this.wrap, this.xScale.rangeBand(), 1, this.layout.xCharToSplitOn, true);
			}
		}

		createYaxis(parentNode: d3.Selection<any>): void {
			if (this.$yAxis) parentNode.selectAll(".y.axis").remove();
			this.$yAxis = parentNode.append("g").attr({ "class": "y axis" }).call(this.layout.axis.yAxis);
		}

		createY2Axis(parentNode: d3.Selection<any>): void {
			if (this.$y2Axis) parentNode.selectAll(".y2.axis").remove();
			var appear = this.appearance;
			this.$y2Axis = parentNode.append("g")
				.attr("class", "y2 axis")
				.call(this.layout.axis.y2Axis)
				.attr("transform", () => { return "translate(" + (appear.width + appear.margin.left + appear.margin.right) + ", 0)"; });
		}

		setAxisProperties(axis: any, properties: Interfaces.IAxisProperties): void {
			if (properties.scale != null) axis.scale(properties.scale);
			if (properties.ticks != null) axis.ticks(properties.ticks);
			if (properties.tickFormat != null) axis.tickFormat(properties.tickFormat);
			if (properties.tickValues != null) axis.tickValues(properties.tickValues);
			if (properties.orientation != null) axis.orient(properties.orientation);
		}

		createAxisLabel(axis: d3.Selection<Axis>, properties: Interfaces.IAxisTextProperties): void {
			axis.append("text")
				.text(properties.text)
				.attr("class", properties.axisTextClass)
				.attr("text-anchor", properties.textAnchor)
				.attr("transform", properties.axisTransform)
				.attr("y", properties.axisYOffset)
				.attr("x", properties.axisXOffset);

			if (axis === this.$xAxis) axis.selectAll("text").call(this.wrap, this.xScale.rangeBand());
		}

		wrap(text, width, padding, charToSplit) {
			var hasChartToSplit = -1;
			var band = 10;
			width = width - 10; // Padding between RangeBands so the labels don't run together
			if (!charToSplit) charToSplit = /\s+/;

			text.each(function () {
				if (this.innerHTML) { hasChartToSplit = this.innerHTML.indexOf(charToSplit); }
				var text = d3.select(this),
					origTxt = text.text(),
					charToSplit = (origTxt.length > band) ? /\s+/ : null,
					words = text.text().split(charToSplit).reverse(),
					word,
					line = [],
					lineNumber = 0,
					lineHeight = 1.1, // ems
					y = text.attr("y"),
					dy = parseFloat(text.attr("dy")),
					tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
				if ($.isArray(words)) {
				while (word = words.pop()) {
					line.push(word);
					tspan.text(line.join(""));

					var node: any = tspan.node();

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
							result.forEach((word: string) => {
								tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", (++lineNumber) * lineHeight + dy + "em").text(word);
							});
						} else {
							tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", (++lineNumber) * lineHeight + dy + "em").text(word);
						}
					}
				}
				}
			});

			if (hasChartToSplit > -1) {
				var tspans = d3.selectAll(".x.axis text tspan:first-child");
				tspans.each((val, i) => {
					var tspan = $(tspans[0][i]);
					var txt = tspan.text();
					if (txt !== "") tspan.text(txt + charToSplit);
				});
			}

		}

		createSvgTooltipElements() {
			var container = d3.select("#tooltipcontainer");
			container.selectAll("svg").remove();
			d3.selectAll(".tooltip-volume")
				.append("svg").attr("width", 15).attr("height", 15)
				.append("svg:rect").attr("width", 14).attr("height", 14);

			d3.selectAll(".tooltip-pickup")
				.append("svg").attr("width", 16).attr("height", 16)
				.append("svg:rect").attr("width", 10).attr("height", 10)
				.attr("transform", (d) => {
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
		}
	}

	export class GroupData {
		key: string;
		uid: number;
		value: any;

		constructor(k: string, u: number, v: any) {
			this.key = k;
			this.uid = u;
			this.value = v;
		}
	}

	export module Properties {

		export class Appearance {
			constructor(public height: number, public margin: Box, public width: number) {}
		}

		export class Layout {
			hasTicks: boolean;
			yIsPct: boolean;
			xAxisWraps: boolean;
			xCharToSplitOn: string;
			xIsOrdinal: boolean;
			xHasRangeRoundBands: boolean;
			xRangeBoundPadding: number;
			xIsTime: boolean;
			y2IsLinear: boolean;
			constructor(public axis: Axis) {
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
		}
	}
}