module TenFour.Dashboard.Performance.Interfaces {

	export interface IAxis {
		xAxis: d3.svg.Axis;
		yAxis: d3.svg.Axis;
		y2Axis: d3.svg.Axis;
	}

	export interface IAxisProperties {
		scale: any;
		orientation: any;
		ticks: number;
		tickFormat: any;
		tickValues: Array<string>;
		axisClass: string;
	}

	export interface IAxisTextProperties {
		text: string;
		textAnchor: string;
		axisTextClass: string;
		axisXOffset: any;
		axisYOffset: number;
		axisTransform: string;
	}
} 