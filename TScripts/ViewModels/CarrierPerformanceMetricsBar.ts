
module TenFour.Dashboard.Performance.ViewModels {

	var colorNeutral = 'neutral';
	var colorPositive = 'positive';
	var colorNegative = 'negative';


	var arrowDropDown = 'arrow_drop_down';
	var arrowDropUp = 'arrow_drop_up';

	export class CarrierPerformanceMetrics {
		//	This is intended to drive the 'virgin view' of the chart, before we have any data.
		IsEmpty: KnockoutObservableBool;

		OnTimePickup: KnockoutObservableNumber;
		OnTimePickupPercentChange: KnockoutObservableNumber;
		OnTimePickupPercentChangeText: KnockoutComputed;
		OnTimePickupPercentChangeColor: KnockoutComputed;
		OnTimePickupPercentChangeArrow: KnockoutComputed;

		OnTimeDelivery: KnockoutObservableNumber;
		OnTimeDeliveryPercentChange: KnockoutObservableNumber;
		OnTimeDeliveryPercentChangeText: KnockoutComputed;
		OnTimeDeliveryPercentChangeColor: KnockoutComputed;
		OnTimeDeliveryPercentChangeArrow: KnockoutComputed;

		TransitTime: KnockoutObservableNumber;
		TransitTimePercentChange: KnockoutObservableNumber;
		TransitTimePercentChangeText: KnockoutComputed;
		TransitTimePercentChangeColor: KnockoutComputed;
		TransitTimePercentChangeArrow: KnockoutComputed;

		AverageLengthOfHaul: KnockoutObservableNumber;
		AverageLengthOfHaulPercentChange: KnockoutObservableNumber;
		AverageLengthOfHaulPercentChangeText: KnockoutComputed;
		AverageLengthOfHaulPercentChangeColor: KnockoutComputed;
		AverageLengthOfHaulPercentChangeArrow: KnockoutComputed;

		ShipmentsPickedUp: KnockoutObservableNumber;
		ShipmentsPickedUpPercentChange: KnockoutObservableNumber;
		ShipmentsPickedUpPercentChangeText: KnockoutComputed;
		ShipmentsPickedUpPercentChangeColor: KnockoutComputed;
		ShipmentsPickedUpPercentChangeArrow: KnockoutComputed;

		ShipmentsDelivered: KnockoutObservableNumber;
		ShipmentsDeliveredPercentChange: KnockoutObservableNumber;
		ShipmentsDeliveredPercentChangeText: KnockoutComputed;
		ShipmentsDeliveredPercentChangeColor: KnockoutComputed;
		ShipmentsDeliveredPercentChangeArrow: KnockoutComputed;


		constructor() {

			this.clear();

			var self = this;
			this.OnTimePickupPercentChangeText = ko.computed(() => {
				if (self.OnTimePickupPercentChange() != null) {
					return self.OnTimePickupPercentChange() + '%';
				} else {
					return '--' + '%';
				}
			});
			this.OnTimeDeliveryPercentChangeText = ko.computed(() => {
				if (self.OnTimeDeliveryPercentChange() != null) {
					return self.OnTimeDeliveryPercentChange() + '%';
				} else {
					return '--' + '%';
				}
			});
			this.TransitTimePercentChangeText = ko.computed(() => {
				if (self.TransitTimePercentChange() != null) {
					return self.TransitTimePercentChange() + '%';
				} else {
					return '--' + '%';
				}
			});
			this.AverageLengthOfHaulPercentChangeText = ko.computed(() => {
				if (self.AverageLengthOfHaulPercentChange() != null) {
					return self.AverageLengthOfHaulPercentChange() + '%';
				} else {
					return '--' + '%';
				}
			});
			this.ShipmentsPickedUpPercentChangeText = ko.computed(() => {
				if (self.ShipmentsPickedUpPercentChange() != null) {
					return self.ShipmentsPickedUpPercentChange() + '%';
				} else {
					return '--' + '%';
				}
			});
			this.ShipmentsDeliveredPercentChangeText = ko.computed(() => {
				if (self.ShipmentsDeliveredPercentChange() != null) {
					return self.ShipmentsDeliveredPercentChange() + '%';
				} else {
					return '--' + '%';
				}
			});
			
			this.OnTimePickupPercentChangeColor = ko.computed(() => {
				return self.computedPercentChangeClass(self.OnTimePickupPercentChange());
			});

			this.OnTimePickupPercentChangeArrow = ko.computed(() => {
				return self.computedPercentChangeArrow(self.OnTimePickupPercentChange());
			});

			this.OnTimeDeliveryPercentChangeColor = ko.computed(() => {
				return self.computedPercentChangeClass(self.OnTimeDeliveryPercentChange());
			});

			this.OnTimeDeliveryPercentChangeArrow = ko.computed(() => {
				return self.computedPercentChangeArrow(self.OnTimeDeliveryPercentChange());
			});

			this.TransitTimePercentChangeColor = ko.computed(() => {
				return self.computedPercentChangeClass(self.TransitTimePercentChange());
			});

			this.TransitTimePercentChangeArrow = ko.computed(() => {
				return self.computedPercentChangeArrow(self.TransitTimePercentChange());
			});

			this.AverageLengthOfHaulPercentChangeColor = ko.computed(() => {
				return self.computedPercentChangeClass(self.AverageLengthOfHaulPercentChange());
			});

			this.AverageLengthOfHaulPercentChangeArrow = ko.computed(() => {
				return self.computedPercentChangeArrow(self.AverageLengthOfHaulPercentChange());
			});

			this.ShipmentsPickedUpPercentChangeColor = ko.computed(() => {
				return self.computedPercentChangeClass(self.ShipmentsPickedUpPercentChange());
			});

			this.ShipmentsPickedUpPercentChangeArrow = ko.computed(() => {
				return self.computedPercentChangeArrow(self.ShipmentsPickedUpPercentChange());
			});

			this.ShipmentsDeliveredPercentChangeColor = ko.computed(() => {
				return self.computedPercentChangeClass(self.ShipmentsDeliveredPercentChange());
			});

			this.ShipmentsDeliveredPercentChangeArrow = ko.computed(() => {
				return self.computedPercentChangeArrow(self.ShipmentsDeliveredPercentChange());
			});

		}

		numberWithCommas(x) {
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}

		computedPercentChangeArrow(percentChange: number): string {

			if (percentChange === 0) {
				return arrowDropUp;
			}
			else if (percentChange > 0) {
				return arrowDropUp;
			}
			else if (percentChange < 0) {
				return arrowDropDown;
			}

			return '';
		}

		computedPercentChangeClass(percentChange: number) : string {

			if (percentChange === 0) {
				return colorNeutral;
			}
			else if (percentChange > 0) {
				return colorPositive;
			}
			else if (percentChange < 0) {
				return colorNegative;
			}

			return '';
		}

		clear() {

			this.IsEmpty = ko.observable(true);

			this.OnTimePickup = ko.observable(0);
			this.OnTimePickupPercentChange = ko.observable(0);

			this.OnTimeDelivery = ko.observable(0);
			this.OnTimeDeliveryPercentChange = ko.observable(0);

			this.TransitTime = ko.observable(0);
			this.TransitTimePercentChange = ko.observable(0);

			this.AverageLengthOfHaul = ko.observable(0);
			this.AverageLengthOfHaulPercentChange = ko.observable(0);

			this.ShipmentsPickedUp = ko.observable(0);
			this.ShipmentsPickedUpPercentChange = ko.observable(0);

			this.ShipmentsDelivered = ko.observable(0);
			this.ShipmentsDeliveredPercentChange = ko.observable(0);
			return;
		}

		onNewData(carrierMetrics: TenFour.Dashboard.WebService.Models.ICarrierPerformanceMetrics) {

			if (!carrierMetrics) {

				this.clear();
				return;
			}

			this.IsEmpty(false);

			this.OnTimePickup(carrierMetrics.OnTimePickup);
			this.OnTimePickupPercentChange(carrierMetrics.OnTimePickupPercentChange);

			this.OnTimeDelivery(carrierMetrics.OnTimeDelivery);
			this.OnTimeDeliveryPercentChange(carrierMetrics.OnTimeDeliveryPercentChange);

			this.TransitTime(carrierMetrics.TransitTime);
			this.TransitTimePercentChange(carrierMetrics.TransitTimePercentChange);

			this.AverageLengthOfHaul(carrierMetrics.AverageLengthOfHaul);
			this.AverageLengthOfHaulPercentChange(carrierMetrics.AverageLengthOfHaulPercentChange);

			this.ShipmentsPickedUp(carrierMetrics.ShipmentsPickedUp);
			this.ShipmentsPickedUpPercentChange(carrierMetrics.ShipmentsPickedUpPercentChange);

			this.ShipmentsDelivered(carrierMetrics.ShipmentsDelivered);
			this.ShipmentsDeliveredPercentChange(carrierMetrics.ShipmentsDeliveredPercentChange);
		}

	}
}