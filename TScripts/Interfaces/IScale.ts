module TenFour.Dashboard.Performance.Interfaces {

	export interface IScaleProperties {
		scaleType: ScaleType;
		scale: any;
	}

	export enum ScaleType {
		Linear,
		Ordinal,
		Time
	}
}