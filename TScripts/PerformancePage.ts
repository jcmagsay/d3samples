/// <reference path="../../../../CommonContent/Content/TScripts/KnockoutPagedGenericFilter.ts" />
/// <reference path="../../../../CommonContent/Content/TScripts/PagedGenericFilter.ts" />

module TenFour.Dashboard.Performance {
	import WebService = Dashboard.WebService;

    export class Page {
        private dataPromise: JQueryXHR;

        private hasInitted: boolean;
        private showVirginView: KnockoutObservableBool;
		private hasShipments: KnockoutObservableBool;
        private startCtor: number;
		/**
		 * Models
		 */
		filter: App.Filter.IKnockoutObservablePagedGenericFilter;
		currentPeriod: KnockoutObservableNumber;

		/**
		 * View Models
		 */
		appFilterBar: Shared.ViewModels.AppFilterBar;
		filterDrawer: Shared.ViewModels.FilterDrawer;
		topCarriersChart: ViewModels.TopCarrierPerformanceChart;
		carrierOverTime: ViewModels.CarrierOverTimeChart;
		carrierPerformanceMetrics: ViewModels.CarrierPerformanceMetrics;
		carrierTrackingChart: ViewModels.CarrierTracking;

        shipmentSummary: ViewModels.ShipmentSummary;
		observableTooltipCollection: KnockoutObservableAny;

		carrierTracking: any;
		carrierPerformanceTable: any;
		previousSettings: string;

        private isShipmentSummaryInChronologicalOrder: KnockoutObservableBool;
        private filterProvider: Utilities.IFilterProvider;

        constructor(private userCapabillities: App.Models.UserCapabilities) {
            this.startCtor = window.performance.now();
			this.currentPeriod = ko.observable(Dashboard.WebService.Models.RollupPeriod.Month);
            this.filterProvider = new Utilities.FilterProvider([]);
            this.resetFilters();
			this.filterDrawer = new Shared.ViewModels.FilterDrawer(this.filter, this.resetFilters.bind(this));
			this.appFilterBar = new Shared.ViewModels.AppFilterBar(this.filterDrawer, this.filter, this.currentPeriod);
			this.isShipmentSummaryInChronologicalOrder = ko.observable(true);

			//Charts
			this.carrierOverTime = new ViewModels.CarrierOverTimeChart(this.filter, this.loadShipmentLog.bind(this), this);
			this.topCarriersChart = new ViewModels.TopCarrierPerformanceChart(this.filter, this.loadReportsPage.bind(this), this);

			this.carrierPerformanceMetrics = new ViewModels.CarrierPerformanceMetrics();
			this.carrierTrackingChart = new ViewModels.CarrierTracking(this.loadReportsPage.bind(this));

			this.filter.subscribeChanged((newFilter) => {
                this.getWrappedDataFromServer(newFilter);
			});

	        this.observableTooltipCollection = ko.observable();
            this.shipmentSummary = new ViewModels.ShipmentSummary("shipment-summary-chart", this.loadShipmentLog.bind(this), this.isShipmentSummaryInChronologicalOrder);
			this.isShipmentSummaryInChronologicalOrder.subscribe((newValue) => {
				this.getShipmentSummaryData(newValue);
            });

			this.carrierTracking = null;
			this.carrierPerformanceTable = null;
			this.hasInitted = false;
			this.showVirginView = ko.observable(false);
			this.hasShipments = ko.observable(false);
            this.previousSettings = "";
        }

		init() {
            this.hasInitted = true;
            var $mask = $("#mask");
            var dataPromise = this.getDataFromServer(this.filter());
			var filterPromise = this.getFilterData();
			this.topCarriersChart.init();
			this.carrierOverTime.init();
			this.carrierTrackingChart.init();
            this.filterDrawer.init();
            this.shipmentSummary.init();
			$.when(dataPromise, filterPromise).always(() => {
                setTimeout(() => {
                    console.debug("Performance Page Load Time (ms): ", window.performance.now() - this.startCtor);
                    $mask.hide();
                });
			});
		}

        private getShipmentSummaryData(inChronologicalOrder: boolean) {
            if (!this.hasInitted) { return; }
            var settings = ko.toJSON(this.filter);
            var $mask = $("#mask");
            $mask.show();
            var promise = WebService.getShipmentSummaryData(inChronologicalOrder, settings);
            promise.then((data) => {
                this.shipmentSummary.createVisualization(data);
				$mask.hide();
            });
            return promise;
        }

        private getFilterData(): JQueryPromise<Dashboard.WebService.Models.IFilterData> {
            var promise = WebService.getFilterData();
            promise.then((data: WebService.Models.IFilterData) => {
                if (data != null) {
                    this.filterDrawer.filters.buildFilters(data);
					this.hasShipments(data.TotalCount > 0);
                }
            });
            return promise;
        }

        private getWrappedDataFromServer(filter: App.Filter.IKnockoutObservablePagedGenericFilterObject): JQueryPromise<Dashboard.WebService.Models.IPageData> & JQueryXHR {
            if (!this.hasInitted) { return; }
            var settings = ko.toJSON(filter);
            if (settings === this.previousSettings) {
                return;
            }
            var $mask = $("#mask");
            $mask.show();
            var promise = this.getDataFromServer(filter);
            promise.then(() => {
                $mask.hide();
            });
            return promise;
        }

        private getDataFromServer(filter: App.Filter.IKnockoutObservablePagedGenericFilterObject): JQueryPromise<Dashboard.WebService.Models.IPageData> & JQueryXHR {
			if (!this.hasInitted) { return; }
			var settings = ko.toJSON(filter);
			if (settings === this.previousSettings) {
				return;
			}
			this.previousSettings = settings;
			console.info(settings);

			if (this.dataPromise && typeof (this.dataPromise.abort) === "function") {
				this.dataPromise.abort();
			}
            var promise = WebService.getPerformancePageData(settings, this.currentPeriod(), this.isShipmentSummaryInChronologicalOrder());
            this.dataPromise = promise;
            promise
                .done(this.onPerformanceDone.bind(this))
                .always(() => {
                    this.dataPromise = null;
                });
            return promise;
        }

        private onPerformanceDone(data: Dashboard.WebService.Models.IPageData) {
            if (this.isVirginView(data)) {
                this.showVirginView(true);
                return;
            } else {
                this.showVirginView(false);
            }

            // Load Data for each Chart
            this.topCarriersChart.updateData(data.LevelOneCarrierPerformanceReport);
            this.carrierPerformanceMetrics.onNewData(data.CarrierPerformanceMetricsData);
            this.carrierTrackingChart.refreshData(data.CarrierTrackingData);
            this.shipmentSummary.createVisualization(data.ShipmentSummary);

            //show level one chart!
            $('.LevelTwo').addClass("hidden");
            $('.LevelOne').removeClass("hidden");
        }

        private isVirginView(data: Dashboard.WebService.Models.IPageData): boolean {
            return (data.UnfilteredRowsCount === 0);
        }

		private resetFilters() {
			this.currentPeriod(Dashboard.WebService.Models.RollupPeriod.Month);
			var filterObject = this.filterProvider.getPageFilter();
			this.filter = App.Filter.knockoutObservablePagedGenericFilter(filterObject).extend({ throttle: 100 });
		}

        private loadReportsPage(sorts: Array<App.Filter.ISortClause>) {
            $("#mask").show();
            var filterJs: App.Filter.IPagedGenericFilter = ko.toJS(this.filter);
            filterJs.sorts = sorts;
            window.location.href = "/Dashboard/Reports/Index?settings=" + JSON.stringify(filterJs);
        }

        private loadShipmentLog(additionalFilterClauses: Array<App.Filter.IFilterClause>) {
            $("#mask").show();
            var filterJs: App.Filter.IPagedGenericFilter = ko.toJS(this.filter);
            filterJs.clauses = filterJs.clauses.concat(additionalFilterClauses);
            window.location.href = "/Dashboard/Reports/ShipmentLog?settings=" + JSON.stringify(filterJs);
        }
	}
}