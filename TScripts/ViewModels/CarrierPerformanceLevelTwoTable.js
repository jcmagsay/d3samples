var TenFour;
(function (TenFour) {
    var Dashboard;
    (function (Dashboard) {
        var Performance;
        (function (Performance) {
            var ViewModels;
            (function (ViewModels) {
                var CarrierPerformanceLevelTwoTable = (function () {
                    function CarrierPerformanceLevelTwoTable() {
                        this.rows = ko.observableArray([]);
                    }
                    CarrierPerformanceLevelTwoTable.prototype.onNewData = function (newData) {
                        this.rows(newData.filter(function (datum) { return datum.Volume !== 0; }));
                    };
                    return CarrierPerformanceLevelTwoTable;
                })();
                ViewModels.CarrierPerformanceLevelTwoTable = CarrierPerformanceLevelTwoTable;
            })(ViewModels = Performance.ViewModels || (Performance.ViewModels = {}));
        })(Performance = Dashboard.Performance || (Dashboard.Performance = {}));
    })(Dashboard = TenFour.Dashboard || (TenFour.Dashboard = {}));
})(TenFour || (TenFour = {}));
//# sourceMappingURL=CarrierPerformanceLevelTwoTable.js.map