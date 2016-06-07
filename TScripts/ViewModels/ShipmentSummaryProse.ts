module TenFour.Dashboard.Performance.ViewModels {

    declare var numeral;

    export class ShipmentSummaryProse {

        
        private unknown = "unavailable";
        private unknownActual(location: string) {
            return "did not have actual " + location + " times provided";
        }

        constructor(private inChronologicalOrder: KnockoutObservableBool) {
            
        }

        getTextFor(d: Array<any>) : string {
            var renderer = d.length === 2 ? this.levelTwoText : this.levelOneText;
            return renderer.call(this, d);
        }

        getDefaultText(number: number): string {
            return numeral(number).format("0,0") + " shipments";
        }

        getBreadcrumbText(node): string {
            return node.Name.toUpperCase() + (this.isPickupFirst(node) ? " PICKUP" : " DELIVERY");
        }

        getRingLabel(node): string {
            return (  this.isPickupFirst(node) ? "Pickup" : "Delivery") + " Performance";
        }

        private isPickupFirst(node): boolean {
            var isFirstInOrder = node.depth === 1;
            var isInChronologicalOrder = this.inChronologicalOrder();
            return (isFirstInOrder && isInChronologicalOrder) || (!isFirstInOrder && !isInChronologicalOrder);
        }

        private renderLocation(name: string, location: string, pastTense: string) {
            if (name === this.unknown) {
                return this.unknownActual(location);
            } else {
                return pastTense + " " + this.formatName(name);
            }
        }

        private renderPickup(nodeName: string) {
            return this.renderLocation(nodeName, "pickup", "picked up");
        }

        private renderDelivery(nodeName) {
            return this.renderLocation(nodeName, "delivery", "delivered");
        }

        private levelOneText(nodes): string {
            var isInChronologicalOrder = this.inChronologicalOrder();
            var render : (name: string) => string = isInChronologicalOrder ? this.renderPickup : this.renderDelivery;
            return "of shipments " + render.call(this, nodes[0].Name);
        }

        private levelTwoText(nodes): string {
            var areBothUnknown = nodes[0].Name === this.unknown && nodes[1].Name === this.unknown;
            var seperator = areBothUnknown ? " also " : " ";
            var isInChronologicalOrder = this.inChronologicalOrder();
            var render1: (name: string) => string = isInChronologicalOrder ? this.renderPickup : this.renderDelivery;
            var render2: (name: string) => string = isInChronologicalOrder ? this.renderDelivery : this.renderPickup;
            var returnString = "of the shipments that " + render1.call(this, nodes[0].Name) + seperator + render2.call(this, nodes[1].Name);

            return returnString;
        }

        private formatName(name: string) {
            if (name === this.unknown) { return "at an ambiguous time" }
            return name;
        }

    }


}