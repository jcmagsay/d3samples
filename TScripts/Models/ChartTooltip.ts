module TenFour.Dashboard.Performance.Models {
	export class ChartTooltip {
		tooltipIdentifier: string;
		volume: string;
		deliveryPercent: string;
		pickupPercent: string;
		avgDeliveryPercent: string;
		avgPickupPercent: string;
		tooltipHeader: string;

		constructor(controlId: string, volume: number, pickup: number, delivery: number, avgPickup: number, avgDelivery: number, header: string) {
			this.volume = volume.toString();
			this.deliveryPercent = delivery + "%";
			this.pickupPercent = pickup + "%";
			this.avgDeliveryPercent = avgDelivery + "%";
			this.avgPickupPercent = avgPickup + "%";
			this.tooltipIdentifier = controlId;
			this.tooltipHeader = header;
		}
	} 
}