var TenFour;
(function (TenFour) {
    var Dashboard;
    (function (Dashboard) {
        var Performance;
        (function (Performance) {
            var ViewModels;
            (function (ViewModels) {
                var ShipmentSummaryProse = (function () {
                    function ShipmentSummaryProse(inChronologicalOrder) {
                        this.inChronologicalOrder = inChronologicalOrder;
                        this.unknown = "unavailable";
                    }
                    ShipmentSummaryProse.prototype.unknownActual = function (location) {
                        return "did not have actual " + location + " times provided";
                    };
                    ShipmentSummaryProse.prototype.getTextFor = function (d) {
                        var renderer = d.length === 2 ? this.levelTwoText : this.levelOneText;
                        return renderer.call(this, d);
                    };
                    ShipmentSummaryProse.prototype.getDefaultText = function (number) {
                        return numeral(number).format("0,0") + " shipments";
                    };
                    ShipmentSummaryProse.prototype.getBreadcrumbText = function (node) {
                        return node.Name.toUpperCase() + (this.isPickupFirst(node) ? " PICKUP" : " DELIVERY");
                    };
                    ShipmentSummaryProse.prototype.getRingLabel = function (node) {
                        return (this.isPickupFirst(node) ? "Pickup" : "Delivery") + " Performance";
                    };
                    ShipmentSummaryProse.prototype.isPickupFirst = function (node) {
                        var isFirstInOrder = node.depth === 1;
                        var isInChronologicalOrder = this.inChronologicalOrder();
                        return (isFirstInOrder && isInChronologicalOrder) || (!isFirstInOrder && !isInChronologicalOrder);
                    };
                    ShipmentSummaryProse.prototype.renderLocation = function (name, location, pastTense) {
                        if (name === this.unknown) {
                            return this.unknownActual(location);
                        }
                        else {
                            return pastTense + " " + this.formatName(name);
                        }
                    };
                    ShipmentSummaryProse.prototype.renderPickup = function (nodeName) {
                        return this.renderLocation(nodeName, "pickup", "picked up");
                    };
                    ShipmentSummaryProse.prototype.renderDelivery = function (nodeName) {
                        return this.renderLocation(nodeName, "delivery", "delivered");
                    };
                    ShipmentSummaryProse.prototype.levelOneText = function (nodes) {
                        var isInChronologicalOrder = this.inChronologicalOrder();
                        var render = isInChronologicalOrder ? this.renderPickup : this.renderDelivery;
                        return "of shipments " + render.call(this, nodes[0].Name);
                    };
                    ShipmentSummaryProse.prototype.levelTwoText = function (nodes) {
                        var areBothUnknown = nodes[0].Name === this.unknown && nodes[1].Name === this.unknown;
                        var seperator = areBothUnknown ? " also " : " ";
                        var isInChronologicalOrder = this.inChronologicalOrder();
                        var render1 = isInChronologicalOrder ? this.renderPickup : this.renderDelivery;
                        var render2 = isInChronologicalOrder ? this.renderDelivery : this.renderPickup;
                        var returnString = "of the shipments that " + render1.call(this, nodes[0].Name) + seperator + render2.call(this, nodes[1].Name);
                        return returnString;
                    };
                    ShipmentSummaryProse.prototype.formatName = function (name) {
                        if (name === this.unknown) {
                            return "at an ambiguous time";
                        }
                        return name;
                    };
                    return ShipmentSummaryProse;
                })();
                ViewModels.ShipmentSummaryProse = ShipmentSummaryProse;
            })(ViewModels = Performance.ViewModels || (Performance.ViewModels = {}));
        })(Performance = Dashboard.Performance || (Dashboard.Performance = {}));
    })(Dashboard = TenFour.Dashboard || (TenFour.Dashboard = {}));
})(TenFour || (TenFour = {}));
//# sourceMappingURL=ShipmentSummaryProse.js.map