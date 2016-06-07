module TenFour.Dashboard.Performance.ViewModels {
    export class CarrierPerformanceLevelOneTable {

        rows: KnockoutComputed;

        constructor(private sortedChartData: KnockoutComputed) {
            this.rows = ko.computed(() => {
                return this.sortedChartData();
            }, this);
        }
    }
}