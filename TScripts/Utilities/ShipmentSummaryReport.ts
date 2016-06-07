module TenFour.Dashboard.Utilities {
    export class ShipmentSummaryReport {

        getClausesFor(nodes: Array<{Name: string}>): Array<App.Filter.IFilterClause> {
            if (!nodes || !nodes.length) {
                return [];
            }
            if (nodes.length >= 2) {
                return [this.pickup(nodes[0]), this.delivery(nodes[1])];
            }
            return [this.pickup(nodes[0])];
        }

        private getRestriction(name: string): App.Filter.IRestriction {
            var myValue: App.Enums.TimelinessType;
            switch (name) {
                case "early": myValue = App.Enums.TimelinessType.Early; break;
                case "on time": myValue = App.Enums.TimelinessType.OnTime; break;
                case "late": myValue = App.Enums.TimelinessType.Late; break;
                default:
                    myValue = App.Enums.TimelinessType.Unknown; break;
            }

            return new App.Filter.Restriction(App.Filter.FilterOperator.EqualTo, [myValue]);
        }

        private getClause(propertyName: string, node: { Name: string }): App.Filter.IFilterClause {
            var restriction = this.getRestriction(node.Name);
            return new App.Filter.FilterClause(propertyName, restriction);
        }

        private pickup(node: {Name: string }): App.Filter.IFilterClause {
            return this.getClause("PickupTimelinessType", node);
        }

        private delivery(node: {Name: string }): App.Filter.IFilterClause {
            return this.getClause("DeliveryTimelinessType", node);
        }

    }
}