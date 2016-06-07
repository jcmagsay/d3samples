var TenFour;
(function (TenFour) {
    var Dashboard;
    (function (Dashboard) {
        var Performance;
        (function (Performance) {
            var Interfaces;
            (function (Interfaces) {
                (function (ScaleType) {
                    ScaleType[ScaleType["Linear"] = 0] = "Linear";
                    ScaleType[ScaleType["Ordinal"] = 1] = "Ordinal";
                    ScaleType[ScaleType["Time"] = 2] = "Time";
                })(Interfaces.ScaleType || (Interfaces.ScaleType = {}));
                var ScaleType = Interfaces.ScaleType;
            })(Interfaces = Performance.Interfaces || (Performance.Interfaces = {}));
        })(Performance = Dashboard.Performance || (Dashboard.Performance = {}));
    })(Dashboard = TenFour.Dashboard || (TenFour.Dashboard = {}));
})(TenFour || (TenFour = {}));
//# sourceMappingURL=IScale.js.map