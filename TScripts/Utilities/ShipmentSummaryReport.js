var TenFour;
(function (TenFour) {
    var Dashboard;
    (function (Dashboard) {
        var Utilities;
        (function (Utilities) {
            var ShipmentSummaryReport = (function () {
                function ShipmentSummaryReport() {
                }
                ShipmentSummaryReport.prototype.getClausesFor = function (nodes) {
                    if (!nodes || !nodes.length) {
                        return [];
                    }
                    if (nodes.length >= 2) {
                        return [this.pickup(nodes[0]), this.delivery(nodes[1])];
                    }
                    return [this.pickup(nodes[0])];
                };
                ShipmentSummaryReport.prototype.getRestriction = function (name) {
                    var myValue;
                    switch (name) {
                        case "early":
                            myValue = App.Enums.TimelinessType.Early;
                            break;
                        case "on time":
                            myValue = App.Enums.TimelinessType.OnTime;
                            break;
                        case "late":
                            myValue = App.Enums.TimelinessType.Late;
                            break;
                        default:
                            myValue = App.Enums.TimelinessType.Unknown;
                            break;
                    }
                    return new App.Filter.Restriction(App.Filter.FilterOperator.EqualTo, [myValue]);
                };
                ShipmentSummaryReport.prototype.getClause = function (propertyName, node) {
                    var restriction = this.getRestriction(node.Name);
                    return new App.Filter.FilterClause(propertyName, restriction);
                };
                ShipmentSummaryReport.prototype.pickup = function (node) {
                    return this.getClause("PickupTimelinessType", node);
                };
                ShipmentSummaryReport.prototype.delivery = function (node) {
                    return this.getClause("DeliveryTimelinessType", node);
                };
                return ShipmentSummaryReport;
            })();
            Utilities.ShipmentSummaryReport = ShipmentSummaryReport;
        })(Utilities = Dashboard.Utilities || (Dashboard.Utilities = {}));
    })(Dashboard = TenFour.Dashboard || (TenFour.Dashboard = {}));
})(TenFour || (TenFour = {}));
//# sourceMappingURL=ShipmentSummaryReport.js.map