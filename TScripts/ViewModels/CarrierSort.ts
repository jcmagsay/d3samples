module TenFour.Dashboard.Performance.ViewModels {

	import CarrierRowData = TenFour.Dashboard.WebService.Models.ICarrierRowData;

	export interface IKnockoutObservableCarrierSort extends KnockoutObservableAny {
		(): ICarrierSort;
		(value: ICarrierSort): void;
	}

	export interface ICarrierSort {
		propertyName: string;
		sortDirection: number;
		compareFunction(a: CarrierRowData, b: CarrierRowData): number;
	}

	export class CarrierSort implements ICarrierSort {
		constructor(public propertyName, public sortDirection: number) { }

		compareFunction(a: CarrierRowData, b: CarrierRowData): number {
			if (a[this.propertyName] < b[this.propertyName]) {
				return 1 * this.sortDirection;
			}

			if (a[this.propertyName] > b[this.propertyName]) {
				return -1 * this.sortDirection;
			}

			return 0;
		}
	}


	var propertyLookup = {
		Pickup: "On-Time Pickup",
		Delivery: "On-Time Delivery",
		Volume: "Volume",
		Frequency: "Frequency"
	};

	class SortLabel {
		constructor(public ascending: string, public descending: string) { }
	}

	var sortNames = {
		Generic: new SortLabel("Best to Worst", "Worst to Best"),
		Frequency: new SortLabel("Highest to Lowest", "Lowest to Highest"),
		Volume: new SortLabel("Greatest to Least", "Least to Greatest")
	};

	var sortLabelLookup = {
		Pickup: sortNames.Generic,
		Delivery: sortNames.Generic,
		Volume: sortNames.Volume,
		Frequency: sortNames.Frequency
	};

	export class CarrierSortMenu {
		currentSortText: KnockoutComputed;

		constructor(private carrierSort: IKnockoutObservableCarrierSort) {

			this.currentSortText = ko.computed(this.currentSortTextComputed, this);
		}

		setSort(propertyName: string, sortDirection: number) {
			this.carrierSort(new CarrierSort(propertyName, sortDirection));
		}

        getSort(): App.Filter.ISortClause {
            var sort = this.carrierSort();
            var actualPropertyName = this.getActualPropertyName[sort.propertyName] || sort.propertyName;
            return {
                propertyName: actualPropertyName,
                sortDirection: sort.sortDirection === 1 ? App.Filter.SortDirection.Descending : App.Filter.SortDirection.Ascending
            };
        }

        private getActualPropertyName = {
            Volume: "TotalVolume",
            Pickup: "PercentOnTimePickup",
            Delivery: "PercentOnTimeDelivery"
        };

		private currentSortTextComputed() {
			var sort = this.carrierSort();
			return this.getFriendlyPropertyName(sort.propertyName) + " - " +
				this.getFriendlySortOrderName(sort.sortDirection, sort.propertyName);
		}

		private getFriendlyPropertyName(propertyName: string): string {
			return propertyLookup[propertyName];
		}

		private getFriendlySortOrderName(sortDirection: number, propertyName: string): string {
			var sortLabel: SortLabel = sortLabelLookup[propertyName] || sortNames.Generic;
			return sortDirection === 1 ? sortLabel.ascending : sortLabel.descending;
		}
	}

}