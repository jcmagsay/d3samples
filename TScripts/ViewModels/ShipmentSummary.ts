module TenFour.Dashboard.Performance.ViewModels {

    declare var numeral;
    declare var componentHandler;
    declare var MaterialTooltip;

    interface IPerformanceArc extends d3.svg.arc.Arc {
        x: number;
        dx: number;
        y: number;
        dy: number;
        name: string;
        depth: number;
    }

    interface IShipmentSummaryNode extends d3.layout.partition.Node, Dashboard.WebService.Models.IShipmentSummary {
        parent?: IShipmentSummaryNode;
    }

    export class ShipmentSummary {
              
        private width = 475;
        private height = 300;
        private radius = Math.min(this.width, this.height) / 2;
        private useUnderlineBreadcrumbs = true;
        private useIconLegend = true;

        private breadcrumb = {
            width: 160, height: 30, spacing: 3, tip: 10
        }

        private colors = {
            "early": "#058dca",
            "on time": "#05ca69",
            "late": "#ca0505",
            "unavailable": "#FFC107"
        };

        private totalSize = 0;
        private vis: d3.Selection<any>;
        private svgRoot: d3.Selection<any>;
        private tooltip: d3.Selection<any>;
        private paths: d3.Selection<any>;
        private partition: d3.layout.Partition<IShipmentSummaryNode>;
        private arc: d3.svg.Arc<d3.svg.arc.Arc>;
        private shipmentSummaryProse: ShipmentSummaryProse;
        private shipmentSummaryReport: Dashboard.Utilities.ShipmentSummaryReport;
        private lockedBreadcrumbs: boolean;
        private nodesAssociatedWithBreadcrumbs: Array<any>;

        orderBy: KnockoutObservableString;
        lifeCycleSummary: KnockoutComputed;
        private isInChronologicalOrder: KnockoutComputed;

        constructor(
            private id: string,
            private loadReportPage: (additionalFilterClauses: Array<App.Filter.IFilterClause>) => void,
            private isSummaryInChronologicalOrder: KnockoutObservableBool
        ) {
            this.orderBy = ko.observable("inOrder");

            this.isInChronologicalOrder = ko.computed(() => this.orderBy() === "inOrder");

            this.svgRoot = d3.select("#" + id).append("svg:svg")
                .attr("width", this.width)
                .attr("height", this.height);
            this.vis = this.svgRoot
                .append("svg:g")
                .attr("id", "container")
                .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

            this.partition = d3.layout.partition<IShipmentSummaryNode>()
                .size([2 * Math.PI, this.radius * this.radius])
                .children((d) => d.Children)
                .value((d) => d.Size);

            this.arc = d3.svg.arc<IPerformanceArc>()
                .startAngle((d) => d.x)
                .endAngle(d => (d.x + d.dx))
                .innerRadius(d => Math.sqrt(d.y))
                .outerRadius(d => Math.sqrt(d.y + d.dy));

            this.tooltip = d3.select("#shipment-summary-tooltip");

            this.shipmentSummaryProse = new ShipmentSummaryProse(this.isInChronologicalOrder);
            this.shipmentSummaryReport = new Dashboard.Utilities.ShipmentSummaryReport();
            this.isInChronologicalOrder.subscribe((newValue) => isSummaryInChronologicalOrder(newValue));
            this.lifeCycleSummary = ko.computed(() => {return this.isInChronologicalOrder() ? "PICKUP" : "DELIVERY"});

        }

        init() {
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

        }



        createVisualization(json: Dashboard.WebService.Models.IShipmentSummary) {

            // For efficiency, filter nodes to keep only those large enough to see.
            var nodes = this.partition.nodes(json)
                .filter(d => (d.dx > 0.005));

            var wholeThing = this.vis.data([json]);

            var paths = this.paths
                .selectAll("path")
                .data(nodes, (d) => {
                    var key = d.Name;
                    if (d.parent) {
                        key += d.parent.Name;
                    }
                    return key;
                })          
                .attr("display", d => (d.depth ? null : "none"))
                .attr("d", this.arc.bind(this));

            this.update(paths);

            wholeThing.exit().remove();
            paths.exit().remove();

            this.updatePathLabels();

            // Get total size of the tree = value of root node from partition.
            var firstElement: any = paths.node();
            this.totalSize = (firstElement !== null && firstElement !== undefined) ? firstElement.__data__.value : 0;

            d3.select("#shipment-summary-default")
                .style("display", "block");

            d3.select("#shipment-summary-count")                
                .text(numeral(this.totalSize).format("0,0"));

            if (firstElement == null) {
                 console.warn("Shipment Summary: First Element was null");
            }
        }

        private initRingLabels() {
            var defs = this.svgRoot.append("svg:defs");
            var innerRingArc = d3.svg.arc<any>()
                .startAngle(Math.PI / 2 * -1)
                .endAngle(Math.PI / 2)
                .innerRadius(96)
                .outerRadius(101);

            var outerRingArc = d3.svg.arc<any>()
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
        }

        viewReport() {
            var additionalClauses = this.shipmentSummaryReport.getClausesFor(this.nodesAssociatedWithBreadcrumbs);
            this.loadReportPage(additionalClauses);
        }

        
        private updatePathLabels() {
            d3.select("#shipment-summary-inner-ring-label textPath").text(this.shipmentSummaryProse.getRingLabel.bind(this.shipmentSummaryProse, { depth: 1 }));
            d3.select("#shipment-summary-outer-ring-label textPath").text(this.shipmentSummaryProse.getRingLabel.bind(this.shipmentSummaryProse, { depth: 2 }));
        }

        private update(paths: d3.selection.Update<any>) {
            paths
                .enter()
                .append("svg:path")
                .attr("display", d => (d.depth ? null : "none"))
                .attr("d", this.arc)
                .style("opacity", 0.5)
                .attr("fill-rule", "evenodd")
                .style("fill", d => this.colors[d.Name])
                .on("mouseover", this.mouseover.bind(this))
                .on("click", this.mouseclick.bind(this));
        }

        private mouseclick(d) {
            //var sequenceArray = this.getAncestors(d);
            //var additionalClauses = this.shipmentSummaryReport.getClausesFor(sequenceArray);
            //this.loadReportPage(additionalClauses);
            d3.select("#shipment-summary-close").attr("visibility", "");
            this.lockedBreadcrumbs = true;
        }

        private circleEnter() {
            $(".ring-text").hide();
        }

        private mouseover(d) {
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
                .filter(node => (sequenceArray.indexOf(node) >= 0))
                .style("opacity", 1);


        }

        private mouseleave(d) {

            if (this.lockedBreadcrumbs) {
                return;
            }
            this.bringBackChartVibrancy();
            $(".ring-text").show();

        }

        private bringBackChartVibrancy() {
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
        }

        private getAncestors(node) {
            var path = [];
            var current = node;
            while (current.parent) {
                path.unshift(current);
                current = current.parent;
            }
            return path;
        }

        private initializeBreadcrumbTrail() {
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
                .attr("transform", "translate("+(this.width - 50) + ", 27)")
                .on("click", () => {
                    this.lockedBreadcrumbs = false;
                    this.bringBackChartVibrancy();
                });
        }

        private breadcrumbPoints(d, i) {
            return this.useUnderlineBreadcrumbs ? this.underlineBreadcrumbPoints(d, i) : this.chevronBreadcrumbPoints(d, i);
        }

        private underlineBreadcrumbPoints(d, i) {
            var points = [];
            var top = (this.breadcrumb.height - 3);
            var left = 17;
            var right = this.breadcrumb.width - 7;
            points.push(left+"," + top);
            points.push(right + "," + top);
            points.push(right + "," + this.breadcrumb.height);
            points.push(left+"," + this.breadcrumb.height);
            return points.join(" ");
        }

        private chevronBreadcrumbPoints(d, i) {
            var points = [];

            points.push("0,0");
            points.push(this.breadcrumb.width + ",0");
            points.push(this.breadcrumb.width + this.breadcrumb.tip + "," + (this.breadcrumb.height / 2));
            points.push(this.breadcrumb.width + "," + this.breadcrumb.height);
            points.push("0," + this.breadcrumb.height);
            if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                points.push(this.breadcrumb.tip + "," + (this.breadcrumb.height / 2));
            }
            return points.join(" ");
        }

        // ReSharper disable once InconsistentNaming
        // This is how it comes back from the database.
        private updateBreadcrumbs(nodeArray : Array<{Name: string; depth: number}>, percentageString) {

            // Data join; key function combines name and depth (= position in sequence).
            var g = d3.select("#shipment-summary-trail")
                .selectAll("g")
                .data(nodeArray, (d) => (d.Name + d.depth));

            // Add breadcrumb and label for entering nodes.
            var entering = g.enter().append("svg:g");

            entering.append("svg:polygon")
                .attr("points", this.breadcrumbPoints.bind(this))
                .style("fill", d => this.colors[d.Name]);            

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
            g.attr("transform", (d, i) => ("translate(" + i * (this.breadcrumb.width + this.breadcrumb.spacing) + ", 0)"));

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
        }

        private drawLegend() {
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
                .attr("transform", (d, i) => ("translate(" + i * (listItem.width + listItem.spacing) + ", 0)"))
                .attr("id", d => d.key.replace(" ", "-") + "-info-icon");


            var text = g.append("svg:text")
                .attr("dy", "0.35em")
                .text((d: { key: string }) => {
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
                    .style("fill", d => d.value); 
                    
                text.attr("x", 20)
                    .attr("y", listItem.height / 2)
                    .attr("text-anchor", "left");
                      
            } else {
                g.append("svg:rect")
                    .attr("rx", listItem.radius)
                    .attr("ry", listItem.radius)
                    .attr("width", listItem.width)
                    .attr("height", listItem.height)
                    .style("fill", d => d.value);    

                text.
                    attr("x", listItem.width / 2)
                    .attr("y", listItem.height / 2)
                    .attr("text-anchor", "middle");
            }
            ["early", "on-time", "late", "unavailable"].forEach((tooltip) => {
                var tooltipBody = document.querySelector("[for='"+tooltip+"-info-icon']");
                var toolip = new MaterialTooltip(tooltipBody);
            });
            
        }
    }
}