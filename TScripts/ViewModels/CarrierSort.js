var TenFour;
(function (TenFour) {
    var Dashboard;
    (function (Dashboard) {
        var Performance;
        (function (Performance) {
            var ViewModels;
            (function (ViewModels) {
                var CarrierSort = (function () {
                    function CarrierSort(propertyName, sortDirection) {
                        this.propertyName = propertyName;
                        this.sortDirection = sortDirection;
                    }
                    CarrierSort.prototype.compareFunction = function (a, b) {
                        if (a[this.propertyName] < b[this.propertyName]) {
                            return 1 * this.sortDirection;
                        }
                        if (a[this.propertyName] > b[this.propertyName]) {
                            return -1 * this.sortDirection;
                        }
                        return 0;
                    };
                    return CarrierSort;
                })();
                ViewModels.CarrierSort = CarrierSort;
                var propertyLookup = {
                    Pickup: "On-Time Pickup",
                    Delivery: "On-Time Delivery",
                    Volume: "Volume",
                    Frequency: "Frequency"
                };
                var SortLabel = (function () {
                    function SortLabel(ascending, descending) {
                        this.ascending = ascending;
                        this.descending = descending;
                    }
                    return SortLabel;
                })();
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
                var CarrierSortMenu = (function () {
                    function CarrierSortMenu(carrierSort) {
                        this.carrierSort = carrierSort;
                        this.getActualPropertyName = {
                            Volume: "TotalVolume",
                            Pickup: "PercentOnTimePickup",
                            Delivery: "PercentOnTimeDelivery"
                        };
                        this.currentSortText = ko.computed(this.currentSortTextComputed, this);
                    }
                    CarrierSortMenu.prototype.setSort = function (propertyName, sortDirection) {
                        this.carrierSort(new CarrierSort(propertyName, sortDirection));
                    };
                    CarrierSortMenu.prototype.getSort = function () {
                        var sort = this.carrierSort();
                        var actualPropertyName = this.getActualPropertyName[sort.propertyName] || sort.propertyName;
                        return {
                            propertyName: actualPropertyName,
                            sortDirection: sort.sortDirection === 1 ? App.Filter.SortDirection.Descending : App.Filter.SortDirection.Ascending
                        };
                    };
                    CarrierSortMenu.prototype.currentSortTextComputed = function () {
                        var sort = this.carrierSort();
                        return this.getFriendlyPropertyName(sort.propertyName) + " - " +
                            this.getFriendlySortOrderName(sort.sortDirection, sort.propertyName);
                    };
                    CarrierSortMenu.prototype.getFriendlyPropertyName = function (propertyName) {
                        return propertyLookup[propertyName];
                    };
                    CarrierSortMenu.prototype.getFriendlySortOrderName = function (sortDirection, propertyName) {
                        var sortLabel = sortLabelLookup[propertyName] || sortNames.Generic;
                        return sortDirection === 1 ? sortLabel.ascending : sortLabel.descending;
                    };
                    return CarrierSortMenu;
                })();
                ViewModels.CarrierSortMenu = CarrierSortMenu;
            })(ViewModels = Performance.ViewModels || (Performance.ViewModels = {}));
        })(Performance = Dashboard.Performance || (Dashboard.Performance = {}));
    })(Dashboard = TenFour.Dashboard || (TenFour.Dashboard = {}));
})(TenFour || (TenFour = {}));
//# sourceMappingURL=CarrierSort.js.map