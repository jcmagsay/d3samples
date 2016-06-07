var TenFour;
(function (TenFour) {
    var Dashboard;
    (function (Dashboard) {
        var Performance;
        (function (Performance) {
            var Models;
            (function (Models) {
                var ChartTooltip = (function () {
                    function ChartTooltip(controlId, volume, pickup, delivery, avgPickup, avgDelivery, header) {
                        this.volume = volume.toString();
                        this.deliveryPercent = delivery + "%";
                        this.pickupPercent = pickup + "%";
                        this.avgDeliveryPercent = avgDelivery + "%";
                        this.avgPickupPercent = avgPickup + "%";
                        this.tooltipIdentifier = controlId;
                        this.tooltipHeader = header;
                    }
                    return ChartTooltip;
                })();
                Models.ChartTooltip = ChartTooltip;
            })(Models = Performance.Models || (Performance.Models = {}));
        })(Performance = Dashboard.Performance || (Dashboard.Performance = {}));
    })(Dashboard = TenFour.Dashboard || (TenFour.Dashboard = {}));
})(TenFour || (TenFour = {}));
//# sourceMappingURL=ChartTooltip.js.map