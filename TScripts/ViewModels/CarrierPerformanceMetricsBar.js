var TenFour;
(function (TenFour) {
    var Dashboard;
    (function (Dashboard) {
        var Performance;
        (function (Performance) {
            var ViewModels;
            (function (ViewModels) {
                var colorNeutral = 'neutral';
                var colorPositive = 'positive';
                var colorNegative = 'negative';
                var arrowDropDown = 'arrow_drop_down';
                var arrowDropUp = 'arrow_drop_up';
                var CarrierPerformanceMetrics = (function () {
                    function CarrierPerformanceMetrics() {
                        this.clear();
                        var self = this;
                        this.OnTimePickupPercentChangeText = ko.computed(function () {
                            if (self.OnTimePickupPercentChange() != null) {
                                return self.OnTimePickupPercentChange() + '%';
                            }
                            else {
                                return '--' + '%';
                            }
                        });
                        this.OnTimeDeliveryPercentChangeText = ko.computed(function () {
                            if (self.OnTimeDeliveryPercentChange() != null) {
                                return self.OnTimeDeliveryPercentChange() + '%';
                            }
                            else {
                                return '--' + '%';
                            }
                        });
                        this.TransitTimePercentChangeText = ko.computed(function () {
                            if (self.TransitTimePercentChange() != null) {
                                return self.TransitTimePercentChange() + '%';
                            }
                            else {
                                return '--' + '%';
                            }
                        });
                        this.AverageLengthOfHaulPercentChangeText = ko.computed(function () {
                            if (self.AverageLengthOfHaulPercentChange() != null) {
                                return self.AverageLengthOfHaulPercentChange() + '%';
                            }
                            else {
                                return '--' + '%';
                            }
                        });
                        this.ShipmentsPickedUpPercentChangeText = ko.computed(function () {
                            if (self.ShipmentsPickedUpPercentChange() != null) {
                                return self.ShipmentsPickedUpPercentChange() + '%';
                            }
                            else {
                                return '--' + '%';
                            }
                        });
                        this.ShipmentsDeliveredPercentChangeText = ko.computed(function () {
                            if (self.ShipmentsDeliveredPercentChange() != null) {
                                return self.ShipmentsDeliveredPercentChange() + '%';
                            }
                            else {
                                return '--' + '%';
                            }
                        });
                        this.OnTimePickupPercentChangeColor = ko.computed(function () {
                            return self.computedPercentChangeClass(self.OnTimePickupPercentChange());
                        });
                        this.OnTimePickupPercentChangeArrow = ko.computed(function () {
                            return self.computedPercentChangeArrow(self.OnTimePickupPercentChange());
                        });
                        this.OnTimeDeliveryPercentChangeColor = ko.computed(function () {
                            return self.computedPercentChangeClass(self.OnTimeDeliveryPercentChange());
                        });
                        this.OnTimeDeliveryPercentChangeArrow = ko.computed(function () {
                            return self.computedPercentChangeArrow(self.OnTimeDeliveryPercentChange());
                        });
                        this.TransitTimePercentChangeColor = ko.computed(function () {
                            return self.computedPercentChangeClass(self.TransitTimePercentChange());
                        });
                        this.TransitTimePercentChangeArrow = ko.computed(function () {
                            return self.computedPercentChangeArrow(self.TransitTimePercentChange());
                        });
                        this.AverageLengthOfHaulPercentChangeColor = ko.computed(function () {
                            return self.computedPercentChangeClass(self.AverageLengthOfHaulPercentChange());
                        });
                        this.AverageLengthOfHaulPercentChangeArrow = ko.computed(function () {
                            return self.computedPercentChangeArrow(self.AverageLengthOfHaulPercentChange());
                        });
                        this.ShipmentsPickedUpPercentChangeColor = ko.computed(function () {
                            return self.computedPercentChangeClass(self.ShipmentsPickedUpPercentChange());
                        });
                        this.ShipmentsPickedUpPercentChangeArrow = ko.computed(function () {
                            return self.computedPercentChangeArrow(self.ShipmentsPickedUpPercentChange());
                        });
                        this.ShipmentsDeliveredPercentChangeColor = ko.computed(function () {
                            return self.computedPercentChangeClass(self.ShipmentsDeliveredPercentChange());
                        });
                        this.ShipmentsDeliveredPercentChangeArrow = ko.computed(function () {
                            return self.computedPercentChangeArrow(self.ShipmentsDeliveredPercentChange());
                        });
                    }
                    CarrierPerformanceMetrics.prototype.numberWithCommas = function (x) {
                        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    };
                    CarrierPerformanceMetrics.prototype.computedPercentChangeArrow = function (percentChange) {
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
                    };
                    CarrierPerformanceMetrics.prototype.computedPercentChangeClass = function (percentChange) {
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
                    };
                    CarrierPerformanceMetrics.prototype.clear = function () {
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
                    };
                    CarrierPerformanceMetrics.prototype.onNewData = function (carrierMetrics) {
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
                    };
                    return CarrierPerformanceMetrics;
                })();
                ViewModels.CarrierPerformanceMetrics = CarrierPerformanceMetrics;
            })(ViewModels = Performance.ViewModels || (Performance.ViewModels = {}));
        })(Performance = Dashboard.Performance || (Dashboard.Performance = {}));
    })(Dashboard = TenFour.Dashboard || (TenFour.Dashboard = {}));
})(TenFour || (TenFour = {}));
//# sourceMappingURL=CarrierPerformanceMetricsBar.js.map