var TenFour;
(function (TenFour) {
    var Dashboard;
    (function (Dashboard) {
        var Performance;
        (function (Performance) {
            var ViewModels;
            (function (ViewModels) {
                var CarrierPerformanceLevelOneTable = (function () {
                    function CarrierPerformanceLevelOneTable(sortedChartData) {
                        var _this = this;
                        this.sortedChartData = sortedChartData;
                        this.rows = ko.computed(function () {
                            return _this.sortedChartData();
                        }, this);
                    }
                    return CarrierPerformanceLevelOneTable;
                })();
                ViewModels.CarrierPerformanceLevelOneTable = CarrierPerformanceLevelOneTable;
            })(ViewModels = Performance.ViewModels || (Performance.ViewModels = {}));
        })(Performance = Dashboard.Performance || (Dashboard.Performance = {}));
    })(Dashboard = TenFour.Dashboard || (TenFour.Dashboard = {}));
})(TenFour || (TenFour = {}));
//# sourceMappingURL=CarrierPerformanceLevelOneTable.js.map