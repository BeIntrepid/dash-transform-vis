System.register(['jointjs', 'linq-es6', 'dash-transform'], function (_export) {
    'use strict';

    var joint, Enumerable, Pipe, PipeConverter, TraverseParams;

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    return {
        setters: [function (_jointjs) {
            joint = _jointjs['default'];
        }, function (_linqEs6) {
            Enumerable = _linqEs6['default'];
        }, function (_dashTransform) {
            Pipe = _dashTransform.Pipe;
        }],
        execute: function () {
            PipeConverter = (function () {
                function PipeConverter() {
                    _classCallCheck(this, PipeConverter);

                    this.currentOffset = 0;
                    this.nodeMargin = 560;
                }

                PipeConverter.prototype.toJointGraph = function toJointGraph(pipe, graph) {

                    var rootNode = pipe.rootNode;

                    var params = new TraverseParams();
                    params.graph = graph;
                    params.node = pipe.rootNode;
                    params.level = 0;

                    var layoutInfo = this.traverseAndBuild(params);

                    this.treeLayout(graph, layoutInfo);
                };

                PipeConverter.prototype.treeLayout = function treeLayout(graph, layoutInfo) {
                    var counts = layoutInfo.nodeLevels;
                    var max = 0;
                    var verticalSpaceSize = 150;
                    var horizontalSpaceSize = 250;
                    layoutInfo.nodeLevels.forEach(function (n) {
                        if (n.count > max) {
                            max = n.count;
                        }
                    });

                    var maxNodeSpace = verticalSpaceSize * max;
                    var centre = maxNodeSpace / 2;

                    var hOffset = 0;
                    layoutInfo.nodeLevels.forEach(function (nodeLevel) {

                        var startPos = centre - nodeLevel.count * verticalSpaceSize / 2;

                        var vOffset = startPos;

                        var index = 0;
                        nodeLevel.nodes.forEach(function (node) {

                            node.position(hOffset, vOffset + index * verticalSpaceSize);
                            index++;
                        });

                        hOffset += horizontalSpaceSize;
                    });
                };

                PipeConverter.prototype.traverseAndBuild = function traverseAndBuild(params) {
                    var _this = this;

                    var node = params.parentNode;
                    var parentGraphNode = params.parentGraphNode;
                    var graph = params.graph;
                    var node = params.node;
                    var level = params.level;
                    var layoutInfo = params.layoutInfo;

                    if (layoutInfo == null) {
                        layoutInfo = { nodeLevels: [] };
                    }

                    var outputs = [];
                    node.ancestors.forEach(function (n) {
                        outputs.push(n.getNodeName());
                    });

                    var c1 = new joint.shapes.devs.Coupled({
                        position: { x: 100, y: 150 },
                        size: { width: 100, height: 100 },
                        inPorts: ['in'],
                        outPorts: outputs,
                        attrs: { '.label': { text: node.getNodeName() } }
                    });

                    graph.addCells([c1]);

                    if (node.pipe instanceof Pipe) {}

                    if (layoutInfo.nodeLevels[level] == null) {
                        layoutInfo.nodeLevels[level] = { count: 1, nodes: [] };
                    } else {
                        layoutInfo.nodeLevels[level].count = layoutInfo.nodeLevels[level].count + 1;
                    }

                    layoutInfo.nodeLevels[level].nodes.push(c1);

                    if (parentGraphNode != null) {
                        this.connect(parentGraphNode, node.getNodeName(), c1, 'in', graph);
                    }

                    this.currentOffset += this.nodeMargin;
                    node.ancestors.forEach(function (n) {

                        var params = new TraverseParams();
                        params.parentNode = node;
                        params.parentGraphNode = c1;
                        params.graph = graph;
                        params.node = n;
                        params.level = level + 1;
                        params.layoutInfo = layoutInfo;

                        _this.traverseAndBuild(params);
                    });

                    return layoutInfo;
                };

                PipeConverter.prototype.connect = function connect(source, sourcePort, target, targetPort, graph) {
                    var link = new joint.shapes.devs.Link({
                        source: { id: source.id, selector: source.getPortSelector(sourcePort) },
                        target: { id: target.id, selector: target.getPortSelector(targetPort) }
                    });
                    link.addTo(graph).reparent();
                };

                return PipeConverter;
            })();

            _export('PipeConverter', PipeConverter);

            TraverseParams = function TraverseParams() {
                _classCallCheck(this, TraverseParams);
            };
        }
    };
});