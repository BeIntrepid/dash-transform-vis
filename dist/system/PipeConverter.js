System.register(['jointjs', 'linq-es6', 'dash-transform'], function (_export) {
    'use strict';

    var joint, Enumerable, Pipe, PipeConverter, TraverseParams, LayoutInfo;

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

                    this.nodeBreadthPadding = 50;
                    this.nodeDepthPadding = 50;
                    this.currentOffset = 0;
                    this.nodeMargin = 560;
                }

                PipeConverter.prototype.toJointGraph = function toJointGraph(pipe, graph) {
                    var rootNode = pipe.rootNode;

                    var params = new TraverseParams();
                    params.graph = graph;
                    params.node = pipe.rootNode;
                    params.level = 0;

                    this.traverseAndBuild(params);

                    this.treeLayout(graph, pipe);
                };

                PipeConverter.prototype.treeLayout = function treeLayout(graph, pipe) {
                    var node = pipe.rootNode;
                    this.prepareNode(node);
                    this.layoutNode(graph, pipe);
                };

                PipeConverter.prototype.layoutNode = function layoutNode(graph, pipe) {
                    var hStart = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

                    var _this = this;

                    var vStart = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
                    var maxBreadth = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];

                    var levelInfo = [];
                    this.getNodeLevelInfo(levelInfo, pipe.rootNode, 0);
                    var max = 0;
                    levelInfo.forEach(function (n) {
                        if (n.breadth > max) {
                            max = n.breadth;
                        }
                    });

                    var maxNodeSpace = maxBreadth == 0 ? max : maxBreadth;
                    var centre = maxNodeSpace / 2;

                    var hOffset = hStart;
                    levelInfo.forEach(function (nodeLevel) {

                        var startPos = centre - nodeLevel.breadth / 2;
                        startPos += vStart;

                        var vOffset = startPos;

                        nodeLevel.children.forEach(function (node) {
                            node.graphInfo.graphNode.position(hOffset, vOffset);
                            vOffset += node.graphInfo.graphNode.attributes.size.height;
                            vOffset += _this.nodeBreadthPadding;

                            if (node.pipe instanceof Pipe) {
                                var pos = node.graphInfo.graphNode.position();
                                var startX = pos.x + _this.nodeDepthPadding;
                                var startY = pos.y + _this.nodeBreadthPadding / 2;
                                _this.layoutNode(graph, node.pipe, startX, startY, node.graphInfo.graphNode.attributes.size.height);
                            }
                        });

                        hOffset += nodeLevel.maxDepth;
                        hOffset += _this.nodeDepthPadding;
                    });
                };

                PipeConverter.prototype.prepareNode = function prepareNode(node) {
                    var _this2 = this;

                    if (node.pipe instanceof Pipe) {
                        this.prepareNode(node.pipe.rootNode);
                        this.layoutPipeNode(node);
                    } else {
                        node.graphInfo.graphNode.resize(100, 100);
                    }

                    node.ancestors.forEach(function (n) {
                        _this2.prepareNode(n);
                    });
                };

                PipeConverter.prototype.layoutPipeNode = function layoutPipeNode(node) {
                    var levelInfo = [];
                    this.getNodeLevelInfo(levelInfo, node.pipe.rootNode, 0);
                    var nodeBreadthNeeded = this.getMaxNodeSizeFromLevelInfo(levelInfo);
                    var nodeDepthNeeded = this.getTotalDepthSizeFromLevelInfo(levelInfo) + this.nodeDepthPadding;
                    node.graphInfo.graphNode.resize(nodeDepthNeeded, nodeBreadthNeeded);
                };

                PipeConverter.prototype.getTotalDepthSizeFromLevelInfo = function getTotalDepthSizeFromLevelInfo(levelInfo) {
                    var _this3 = this;

                    var depth = 0;
                    levelInfo.forEach(function (n) {
                        depth += n.maxDepth + _this3.nodeDepthPadding;
                    });
                    return depth;
                };

                PipeConverter.prototype.getMaxNodeSizeFromLevelInfo = function getMaxNodeSizeFromLevelInfo(levelInfo) {
                    var max = 0;
                    levelInfo.forEach(function (n) {
                        if (n.breadth > max) {
                            max = n.breadth;
                        }
                    });

                    return max;
                };

                PipeConverter.prototype.getNodeLevelInfo = function getNodeLevelInfo(levelInfo, node, level) {
                    var _this4 = this;

                    var nodeBreadth = node.graphInfo.graphNode.attributes.size.height;
                    var curNodeDepth = node.graphInfo.graphNode.attributes.size.width;

                    var breadthAddition = this.nodeBreadthPadding;

                    if (levelInfo[level] == null) {
                        levelInfo[level] = {};
                        levelInfo[level].breadth = nodeBreadth + breadthAddition;
                        levelInfo[level].maxDepth = curNodeDepth;
                        levelInfo[level].children = [];
                    } else {
                        levelInfo[level].breadth += nodeBreadth + breadthAddition;
                    }

                    if (curNodeDepth > levelInfo[level].maxDepth) {
                        levelInfo[level].maxDepth = curNodeDepth;
                    }

                    levelInfo[level].children.push(node);

                    node.ancestors.forEach(function (n) {
                        _this4.getNodeLevelInfo(levelInfo, n, level + 1);
                    });
                };

                PipeConverter.prototype.traverseAndBuild = function traverseAndBuild(params) {
                    var _this5 = this;

                    var parentNode = params.parentNode;
                    var parentGraphNode = params.parentGraphNode;
                    var graph = params.graph;
                    var node = params.node;
                    var level = params.level;
                    var parentPipe = params.parentPipe;
                    var parentPipeGraphNode = params.parentPipeGraphNode;

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

                    node.graphInfo = { graphNode: c1 };

                    if (node.pipe instanceof Pipe) {
                        var params = new TraverseParams();
                        params.parentNode = node;
                        params.parentGraphNode = c1;
                        params.graph = graph;
                        params.node = node.pipe.rootNode;
                        params.level = 0;
                        params.parentPipe = node.pipe;
                        params.parentPipeGraphNode = c1;
                        this.traverseAndBuild(params);
                    }

                    if (parentGraphNode != null) {
                        var parentNodeName = node.getNodeName();
                        if (parentPipe != null && parentNode.pipe instanceof Pipe) {
                            parentNodeName = 'in';
                        }

                        this.connect(parentGraphNode, parentNodeName, c1, 'in', graph);
                    }

                    if (parentPipe != null) {
                        parentPipeGraphNode.embed(c1);
                    }

                    this.currentOffset += this.nodeMargin;
                    node.ancestors.forEach(function (n) {
                        var params = new TraverseParams();
                        params.parentNode = node;
                        params.parentGraphNode = c1;
                        params.graph = graph;
                        params.node = n;
                        params.level = level + 1;
                        if (parentPipe != null) {
                            params.parentPipe = parentPipe;
                            params.parentPipeGraphNode = parentPipeGraphNode;
                        }

                        _this5.traverseAndBuild(params);
                    });
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

            LayoutInfo = function LayoutInfo() {
                _classCallCheck(this, LayoutInfo);

                this.ancestors = [];
            };
        }
    };
});