var TenFour;
(function (TenFour) {
    var Dashboard;
    (function (Dashboard) {
        var Performance;
        (function (Performance) {
            var ViewModels;
            (function (ViewModels) {
                var ShipmentSummary = (function () {
                    function ShipmentSummary(id, loadReportPage, isSummaryInChronologicalOrder) {
                        var _this = this;
                        this.id = id;
                        this.loadReportPage = loadReportPage;
                        this.isSummaryInChronologicalOrder = isSummaryInChronologicalOrder;
                        this.width = 475;
                        this.height = 300;
                        this.radius = Math.min(this.width, this.height) / 2;
                        this.useUnderlineBreadcrumbs = true;
                        this.useIconLegend = true;
                        this.breadcrumb = {
                            width: 160, height: 30, spacing: 3, tip: 10
                        };
                        this.colors = {
                            "early": "#058dca",
                            "on time": "#05ca69",
                            "late": "#ca0505",
                            "unavailable": "#FFC107"
                        };
                        this.totalSize = 0;
                        this.orderBy = ko.observable("inOrder");
                        this.isInChronologicalOrder = ko.computed(function () { return _this.orderBy() === "inOrder"; });
                        this.svgRoot = d3.select("#" + id).append("svg:svg")
                            .attr("width", this.width)
                            .attr("height", this.height);
                        this.vis = this.svgRoot
                            .append("svg:g")
                            .attr("id", "container")
                            .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
                        this.partition = d3.layout.partition()
                            .size([2 * Math.PI, this.radius * this.radius])
                            .children(function (d) { return d.Children; })
                            .value(function (d) { return d.Size; });
                        this.arc = d3.svg.arc()
                            .startAngle(function (d) { return d.x; })
                            .endAngle(function (d) { return (d.x + d.dx); })
                            .innerRadius(function (d) { return Math.sqrt(d.y); })
                            .outerRadius(function (d) { return Math.sqrt(d.y + d.dy); });
                        this.tooltip = d3.select("#shipment-summary-tooltip");
                        this.shipmentSummaryProse = new ViewModels.ShipmentSummaryProse(this.isInChronologicalOrder);
                        this.shipmentSummaryReport = new Dashboard.Utilities.ShipmentSummaryReport();
                        this.isInChronologicalOrder.subscribe(function (newValue) { return isSummaryInChronologicalOrder(newValue); });
                        this.lifeCycleSummary = ko.computed(function () { return _this.isInChronologicalOrder() ? "PICKUP" : "DELIVERY"; });
                    }
                    ShipmentSummary.prototype.init = function () {
                        // Basic setup of page elements.
                        this.initializeBreadcrumbTrail();
                        this.drawLegend();
                        //d3.select("#togglelegend").on("click", this.toggleLegend.bind(this));
                        // Bounding circle underneath the sunburst, to make it easier to detect
                        // when the mouse leaves the parent g.
                        this.vis.append("svg:circle")
                            .attr("r", this.radius)
                            .style("opacity", 0)
                            .on("mouseenter", this.circleEnter.bind(this));
                        // Add the mouseleave handler to the bounding circle.
                        d3.select("#" + this.id).on("mouseleave", this.mouseleave.bind(this));
                        this.paths = this.vis.append("svg:g");
                        this.initRingLabels();
                    };
                    ShipmentSummary.prototype.createVisualization = function (json) {
                        // For efficiency, filter nodes to keep only those large enough to see.
                        var nodes = this.partition.nodes(json)
                            .filter(function (d) { return (d.dx > 0.005); });
                        var wholeThing = this.vis.data([json]);
                        var paths = this.paths
                            .selectAll("path")
                            .data(nodes, function (d) {
                            var key = d.Name;
                            if (d.parent) {
                                key += d.parent.Name;
                            }
                            return key;
                        })
                            .attr("display", function (d) { return (d.depth ? null : "none"); })
                            .attr("d", this.arc.bind(this));
                        this.update(paths);
                        wholeThing.exit().remove();
                        paths.exit().remove();
                        this.updatePathLabels();
                        // Get total size of the tree = value of root node from partition.
                        var firstElement = paths.node();
                        this.totalSize = (firstElement !== null && firstElement !== undefined) ? firstElement.__data__.value : 0;
                        d3.select("#shipment-summary-default")
                            .style("display", "block");
                        d3.select("#shipment-summary-count")
                            .text(numeral(this.totalSize).format("0,0"));
                        if (firstElement == null) {
                            console.warn("Shipment Summary: First Element was null");
                        }
                    };
                    ShipmentSummary.prototype.initRingLabels = function () {
                        var defs = this.svgRoot.append("svg:defs");
                        var innerRingArc = d3.svg.arc()
                            .startAngle(Math.PI / 2 * -1)
                            .endAngle(Math.PI / 2)
                            .innerRadius(96)
                            .outerRadius(101);
                        var outerRingArc = d3.svg.arc()
                            .startAngle(3 * Math.PI / 2)
                            .endAngle(Math.PI / 2)
                            .innerRadius(136)
                            .outerRadius(140);
                        defs.append("svg:path")
                            .attr("id", "innerRingArc")
                            .attr("d", innerRingArc);
                        defs.append("svg:path")
                            .attr("id", "outerRingArc")
                            .attr("d", outerRingArc);
                        this.vis.append("svg:text")
                            .attr("class", "ring-text")
                            .attr("id", "shipment-summary-inner-ring-label")
                            .append("svg:textPath")
                            .attr("startOffset", "25%")
                            .attr("text-anchor", "middle")
                            .attr("stroke", "#fff")
                            .style("letter-spacing", "1px")
                            .attr("xlink:href", "#innerRingArc");
                        this.vis.append("svg:text")
                            .attr("class", "ring-text")
                            .attr("id", "shipment-summary-outer-ring-label")
                            .append("svg:textPath")
                            .attr("stroke", "#fff")
                            .attr("startOffset", "25%")
                            .attr("text-anchor", "middle")
                            .attr("xlink:href", "#outerRingArc")
                            .style("letter-spacing", "2px");
                    };
                    ShipmentSummary.prototype.viewReport = function () {
                        var additionalClauses = this.shipmentSummaryReport.getClausesFor(this.nodesAssociatedWithBreadcrumbs);
                        this.loadReportPage(additionalClauses);
                    };
                    ShipmentSummary.prototype.updatePathLabels = function () {
                        d3.select("#shipment-summary-inner-ring-label textPath").text(this.shipmentSummaryProse.getRingLabel.bind(this.shipmentSummaryProse, { depth: 1 }));
                        d3.select("#shipment-summary-outer-ring-label textPath").text(this.shipmentSummaryProse.getRingLabel.bind(this.shipmentSummaryProse, { depth: 2 }));
                    };
                    ShipmentSummary.prototype.update = function (paths) {
                        var _this = this;
                        paths
                            .enter()
                            .append("svg:path")
                            .attr("display", function (d) { return (d.depth ? null : "none"); })
                            .attr("d", this.arc)
                            .style("opacity", 0.5)
                            .attr("fill-rule", "evenodd")
                            .style("fill", function (d) { return _this.colors[d.Name]; })
                            .on("mouseover", this.mouseover.bind(this))
                            .on("click", this.mouseclick.bind(this));
                    };
                    ShipmentSummary.prototype.mouseclick = function (d) {
                        //var sequenceArray = this.getAncestors(d);
                        //var additionalClauses = this.shipmentSummaryReport.getClausesFor(sequenceArray);
                        //this.loadReportPage(additionalClauses);
                        d3.select("#shipment-summary-close").attr("visibility", "");
                        this.lockedBreadcrumbs = true;
                    };
                    ShipmentSummary.prototype.circleEnter = function () {
                        $(".ring-text").hide();
                    };
                    ShipmentSummary.prototype.mouseover = function (d) {
                        if (this.lockedBreadcrumbs) {
                            return;
                        }
                        $(".ring-text").hide();
                        var percentage = (d.value / this.totalSize);
                        var percentageString = numeral(percentage).format("0%");
                        var sequenceArray = this.nodesAssociatedWithBreadcrumbs = this.getAncestors(d);
                        d3.select("#shipment-summary-percentage")
                            .text(percentageString);
                        d3.select("#shipment-summary-prose")
                            .text(this.shipmentSummaryProse.getTextFor(sequenceArray));
                        d3.select("#shipment-summary-explination")
                            .style("visibility", "");
                        this.updateBreadcrumbs(sequenceArray, percentageString);
                        // Fade all the segments.
                        d3.selectAll("#shipment-summary-chart path")
                            .style("opacity", 0.3);
                        d3.select("#shipment-summary-default")
                            .style("visibility", "hidden");
                        // Then highlight only those that are an ancestor of the current segment.
                        this.vis.selectAll("path")
                            .filter(function (node) { return (sequenceArray.indexOf(node) >= 0); })
                            .style("opacity", 1);
                    };
                    ShipmentSummary.prototype.mouseleave = function (d) {
                        if (this.lockedBreadcrumbs) {
                            return;
                        }
                        this.bringBackChartVibrancy();
                        $(".ring-text").show();
                    };
                    ShipmentSummary.prototype.bringBackChartVibrancy = function () {
                        // Hide the breadcrumb trail
                        d3.select("#shipment-summary-trail")
                            .style("visibility", "hidden");
                        // Transition each segment to full opacity and then reactivate it.
                        d3.selectAll("#shipment-summary-chart path")
                            .style("opacity", 0.5);
                        d3.select("#shipment-summary-explination")
                            .style("visibility", "hidden");
                        this.tooltip.style("opacity", 0);
                        d3.select("#shipment-summary-close").attr("visibility", "hidden");
                        d3.select("#shipment-summary-default")
                            .style("visibility", "");
                    };
                    ShipmentSummary.prototype.getAncestors = function (node) {
                        var path = [];
                        var current = node;
                        while (current.parent) {
                            path.unshift(current);
                            current = current.parent;
                        }
                        return path;
                    };
                    ShipmentSummary.prototype.initializeBreadcrumbTrail = function () {
                        var _this = this;
                        // Add the svg area.
                        var trail = d3.select("#shipment-summary-sequence").append("svg:svg")
                            .attr("width", this.width)
                            .attr("height", 30)
                            .attr("id", "shipment-summary-trail");
                        // Add the label at the end, for the percentage.
                        trail.append("svg:text")
                            .attr("id", "endlabel")
                            .style("fill", "#fff");
                        trail.append("svg:text")
                            .attr("class", "material-icons")
                            .text("close")
                            .style("fill", "#fff")
                            .attr("id", "shipment-summary-close")
                            .attr("visibility", "hidden")
                            .attr("transform", "translate(" + (this.width - 50) + ", 27)")
                            .on("click", function () {
                            _this.lockedBreadcrumbs = false;
                            _this.bringBackChartVibrancy();
                        });
                    };
                    ShipmentSummary.prototype.breadcrumbPoints = function (d, i) {
                        return this.useUnderlineBreadcrumbs ? this.underlineBreadcrumbPoints(d, i) : this.chevronBreadcrumbPoints(d, i);
                    };
                    ShipmentSummary.prototype.underlineBreadcrumbPoints = function (d, i) {
                        var points = [];
                        var top = (this.breadcrumb.height - 3);
                        var left = 17;
                        var right = this.breadcrumb.width - 7;
                        points.push(left + "," + top);
                        points.push(right + "," + top);
                        points.push(right + "," + this.breadcrumb.height);
                        points.push(left + "," + this.breadcrumb.height);
                        return points.join(" ");
                    };
                    ShipmentSummary.prototype.chevronBreadcrumbPoints = function (d, i) {
                        var points = [];
                        points.push("0,0");
                        points.push(this.breadcrumb.width + ",0");
                        points.push(this.breadcrumb.width + this.breadcrumb.tip + "," + (this.breadcrumb.height / 2));
                        points.push(this.breadcrumb.width + "," + this.breadcrumb.height);
                        points.push("0," + this.breadcrumb.height);
                        if (i > 0) {
                            points.push(this.breadcrumb.tip + "," + (this.breadcrumb.height / 2));
                        }
                        return points.join(" ");
                    };
                    // ReSharper disable once InconsistentNaming
                    // This is how it comes back from the database.
                    ShipmentSummary.prototype.updateBreadcrumbs = function (nodeArray, percentageString) {
                        var _this = this;
                        // Data join; key function combines name and depth (= position in sequence).
                        var g = d3.select("#shipment-summary-trail")
                            .selectAll("g")
                            .data(nodeArray, function (d) { return (d.Name + d.depth); });
                        // Add breadcrumb and label for entering nodes.
                        var entering = g.enter().append("svg:g");
                        entering.append("svg:polygon")
                            .attr("points", this.breadcrumbPoints.bind(this))
                            .style("fill", function (d) { return _this.colors[d.Name]; });
                        entering.append("svg:text")
                            .attr("x", ((this.breadcrumb.width + this.breadcrumb.tip) / 2))
                            .attr("y", this.breadcrumb.height / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(this.shipmentSummaryProse.getBreadcrumbText.bind(this.shipmentSummaryProse));
                        if (this.useUnderlineBreadcrumbs) {
                            entering.append("svg:text")
                                .attr("class", "material-icons")
                                .attr("x", (this.breadcrumb.width + this.breadcrumb.tip) - 5)
                                .attr("y", (this.breadcrumb.height / 2) + 5)
                                .attr("dy", "0.35em")
                                .attr("text-anchor", "middle")
                                .text("chevron_right");
                        }
                        // Set position for entering and updating nodes.
                        g.attr("transform", function (d, i) { return ("translate(" + i * (_this.breadcrumb.width + _this.breadcrumb.spacing) + ", 0)"); });
                        // Remove exiting nodes.
                        g.exit().remove();
                        // Now move and update the percentage at the end.
                        d3.select("#shipment-summary-trail").select("#endlabel")
                            .attr("x", (nodeArray.length + 0.2) * (this.breadcrumb.width + this.breadcrumb.spacing))
                            .attr("y", this.breadcrumb.height / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(percentageString);
                        // detatch and 
                        var $close = $("#shipment-summary-close");
                        var $closeParent = $close.parent();
                        $closeParent.append($close);
                        // Make the breadcrumb trail visible, if it's hidden.
                        d3.select("#shipment-summary-trail")
                            .style("visibility", "");
                    };
                    ShipmentSummary.prototype.drawLegend = function () {
                        // Dimensions of legend item: width, height, spacing, radius of rounded rect.
                        var listItem = {
                            width: 110, height: 30, spacing: 10, radius: 3
                        };
                        var legend = d3.select("#shipment-summary-legend").append("svg:svg")
                            .attr("width", d3.keys(this.colors).length * (listItem.width + listItem.spacing))
                            .attr("height", listItem.height);
                        var g = legend.selectAll("g")
                            .data(d3.entries(this.colors))
                            .enter().append("svg:g")
                            .attr("transform", function (d, i) { return ("translate(" + i * (listItem.width + listItem.spacing) + ", 0)"); })
                            .attr("id", function (d) { return d.key.replace(" ", "-") + "-info-icon"; });
                        var text = g.append("svg:text")
                            .attr("dy", "0.35em")
                            .text(function (d) {
                            return d.key.toUpperCase();
                        });
                        if (this.useIconLegend) {
                            var points = [];
                            points.push("0,5");
                            points.push("12,5");
                            points.push("10,20");
                            points.push("2,20");
                            g.append("svg:polygon")
                                .attr("points", points.join(" "))
                                .style("stroke", "#fff")
                                .style("fill", function (d) { return d.value; });
                            text.attr("x", 20)
                                .attr("y", listItem.height / 2)
                                .attr("text-anchor", "left");
                        }
                        else {
                            g.append("svg:rect")
                                .attr("rx", listItem.radius)
                                .attr("ry", listItem.radius)
                                .attr("width", listItem.width)
                                .attr("height", listItem.height)
                                .style("fill", function (d) { return d.value; });
                            text.
                                attr("x", listItem.width / 2)
                                .attr("y", listItem.height / 2)
                                .attr("text-anchor", "middle");
                        }
                        ["early", "on-time", "late", "unavailable"].forEach(function (tooltip) {
                            var tooltipBody = document.querySelector("[for='" + tooltip + "-info-icon']");
                            var toolip = new MaterialTooltip(tooltipBody);
                        });
                    };
                    return ShipmentSummary;
                })();
                ViewModels.ShipmentSummary = ShipmentSummary;
            })(ViewModels = Performance.ViewModels || (Performance.ViewModels = {}));
        })(Performance = Dashboard.Performance || (Dashboard.Performance = {}));
    })(Dashboard = TenFour.Dashboard || (TenFour.Dashboard = {}));
})(TenFour || (TenFour = {}));
//# sourceMappingURL=ShipmentSummary.js.map