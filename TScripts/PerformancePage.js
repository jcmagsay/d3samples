/// <reference path="../../../../CommonContent/Content/TScripts/KnockoutPagedGenericFilter.ts" />
/// <reference path="../../../../CommonContent/Content/TScripts/PagedGenericFilter.ts" />
var TenFour;
(function (TenFour) {
    var Dashboard;
    (function (Dashboard) {
        var Performance;
        (function (Performance) {
            var WebService = Dashboard.WebService;
            var Page = (function () {
                function Page(userCapabillities) {
                    var _this = this;
                    this.userCapabillities = userCapabillities;
                    this.startCtor = window.performance.now();
                    this.currentPeriod = ko.observable(Dashboard.WebService.Models.RollupPeriod.Month);
                    this.filterProvider = new Dashboard.Utilities.FilterProvider([]);
                    this.resetFilters();
                    this.filterDrawer = new Dashboard.Shared.ViewModels.FilterDrawer(this.filter, this.resetFilters.bind(this));
                    this.appFilterBar = new Dashboard.Shared.ViewModels.AppFilterBar(this.filterDrawer, this.filter, this.currentPeriod);
                    this.isShipmentSummaryInChronologicalOrder = ko.observable(true);
                    //Charts
                    this.carrierOverTime = new Performance.ViewModels.CarrierOverTimeChart(this.filter, this.loadShipmentLog.bind(this), this);
                    this.topCarriersChart = new Performance.ViewModels.TopCarrierPerformanceChart(this.filter, this.loadReportsPage.bind(this), this);
                    this.carrierPerformanceMetrics = new Performance.ViewModels.CarrierPerformanceMetrics();
                    this.carrierTrackingChart = new Performance.ViewModels.CarrierTracking(this.loadReportsPage.bind(this));
                    this.filter.subscribeChanged(function (newFilter) {
                        _this.getWrappedDataFromServer(newFilter);
                    });
                    this.observableTooltipCollection = ko.observable();
                    this.shipmentSummary = new Performance.ViewModels.ShipmentSummary("shipment-summary-chart", this.loadShipmentLog.bind(this), this.isShipmentSummaryInChronologicalOrder);
                    this.isShipmentSummaryInChronologicalOrder.subscribe(function (newValue) {
                        _this.getShipmentSummaryData(newValue);
                    });
                    this.carrierTracking = null;
                    this.carrierPerformanceTable = null;
                    this.hasInitted = false;
                    this.showVirginView = ko.observable(false);
                    this.hasShipments = ko.observable(false);
                    this.previousSettings = "";
                }
                Page.prototype.init = function () {
                    var _this = this;
                    this.hasInitted = true;
                    var $mask = $("#mask");
                    var dataPromise = this.getDataFromServer(this.filter());
                    var filterPromise = this.getFilterData();
                    this.topCarriersChart.init();
                    this.carrierOverTime.init();
                    this.carrierTrackingChart.init();
                    this.filterDrawer.init();
                    this.shipmentSummary.init();
                    $.when(dataPromise, filterPromise).always(function () {
                        setTimeout(function () {
                            console.debug("Performance Page Load Time (ms): ", window.performance.now() - _this.startCtor);
                            $mask.hide();
                        });
                    });
                };
                Page.prototype.getShipmentSummaryData = function (inChronologicalOrder) {
                    var _this = this;
                    if (!this.hasInitted) {
                        return;
                    }
                    var settings = ko.toJSON(this.filter);
                    var $mask = $("#mask");
                    $mask.show();
                    var promise = WebService.getShipmentSummaryData(inChronologicalOrder, settings);
                    promise.then(function (data) {
                        _this.shipmentSummary.createVisualization(data);
                        $mask.hide();
                    });
                    return promise;
                };
                Page.prototype.getFilterData = function () {
                    var _this = this;
                    var promise = WebService.getFilterData();
                    promise.then(function (data) {
                        if (data != null) {
                            _this.filterDrawer.filters.buildFilters(data);
                            _this.hasShipments(data.TotalCount > 0);
                        }
                    });
                    return promise;
                };
                Page.prototype.getWrappedDataFromServer = function (filter) {
                    if (!this.hasInitted) {
                        return;
                    }
                    var settings = ko.toJSON(filter);
                    if (settings === this.previousSettings) {
                        return;
                    }
                    var $mask = $("#mask");
                    $mask.show();
                    var promise = this.getDataFromServer(filter);
                    promise.then(function () {
                        $mask.hide();
                    });
                    return promise;
                };
                Page.prototype.getDataFromServer = function (filter) {
                    var _this = this;
                    if (!this.hasInitted) {
                        return;
                    }
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
                        .always(function () {
                        _this.dataPromise = null;
                    });
                    return promise;
                };
                Page.prototype.onPerformanceDone = function (data) {
                    if (this.isVirginView(data)) {
                        this.showVirginView(true);
                        return;
                    }
                    else {
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
                };
                Page.prototype.isVirginView = function (data) {
                    return (data.UnfilteredRowsCount === 0);
                };
                Page.prototype.resetFilters = function () {
                    this.currentPeriod(Dashboard.WebService.Models.RollupPeriod.Month);
                    var filterObject = this.filterProvider.getPageFilter();
                    this.filter = App.Filter.knockoutObservablePagedGenericFilter(filterObject).extend({ throttle: 100 });
                };
                Page.prototype.loadReportsPage = function (sorts) {
                    $("#mask").show();
                    var filterJs = ko.toJS(this.filter);
                    filterJs.sorts = sorts;
                    window.location.href = "/Dashboard/Reports/Index?settings=" + JSON.stringify(filterJs);
                };
                Page.prototype.loadShipmentLog = function (additionalFilterClauses) {
                    $("#mask").show();
                    var filterJs = ko.toJS(this.filter);
                    filterJs.clauses = filterJs.clauses.concat(additionalFilterClauses);
                    window.location.href = "/Dashboard/Reports/ShipmentLog?settings=" + JSON.stringify(filterJs);
                };
                return Page;
            })();
            Performance.Page = Page;
        })(Performance = Dashboard.Performance || (Dashboard.Performance = {}));
    })(Dashboard = TenFour.Dashboard || (TenFour.Dashboard = {}));
})(TenFour || (TenFour = {}));
//# sourceMappingURL=PerformancePage.js.map