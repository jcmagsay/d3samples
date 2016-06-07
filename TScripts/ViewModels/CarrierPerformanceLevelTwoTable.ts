module TenFour.Dashboard.Performance.ViewModels {
    export class CarrierPerformanceLevelTwoTable {

        rows: KnockoutObservableArray;

        constructor() {
            this.rows = ko.observableArray([]);
        }

        onNewData(newData: Array<Dashboard.WebService.Models.IAggregatePerformanceLevelTwoData>) {
            this.rows(newData.filter( datum => datum.Volume !== 0));
        }
    }
}