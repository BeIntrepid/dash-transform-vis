System.register(['./joint', './joint.shapes.devs', 'linq-es6'], function (_export) {
    'use strict';

    var jointLib, jointShapesDevLib, Enumerable, PipeConverter;

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    return {
        setters: [function (_joint) {
            jointLib = _joint['default'];
        }, function (_jointShapesDevs) {
            jointShapesDevLib = _jointShapesDevs['default'];
        }, function (_linqEs6) {
            Enumerable = _linqEs6['default'];
        }],
        execute: function () {
            PipeConverter = (function () {
                function PipeConverter() {
                    _classCallCheck(this, PipeConverter);

                    this.currentOffset = 0;
                    this.nodeMargin = 160;
                }

                PipeConverter.prototype.toJointGraph = function toJointGraph(pipe, graph) {
                    var joint = jointLib();

                    var rootNode = pipe.rootNode;
                    this.traverseAndBuild(null, null, graph, pipe.rootNode);
                };

                PipeConverter.prototype.traverseAndBuild = function traverseAndBuild(parentNode, parentGraphNode, graph, node) {
                    var _this = this;

                    var outputs = [];
                    node.ancestors.forEach(function (n) {
                        outputs.push(n.getNodeName());
                    });

                    var c1 = new joint.shapes.devs.Coupled({
                        position: { x: this.currentOffset, y: 150 },
                        size: { width: 100, height: 100 },
                        inPorts: ['in'],
                        outPorts: outputs,
                        attrs: { '.label': { text: node.getNodeName() } }
                    });

                    graph.addCells([c1]);

                    if (parentGraphNode != null) {
                        this.connect(parentGraphNode, node.getNodeName(), c1, 'in', graph);
                    }

                    this.currentOffset += this.nodeMargin;
                    node.ancestors.forEach(function (n) {
                        _this.traverseAndBuild(node, c1, graph, n);
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
        }
    };
});