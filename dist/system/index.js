System.register(['./joint', './joint.shapes.devs', 'lodash', 'vectorizer', 'geometry'], function (_export) {
    'use strict';

    var jointLib, jointShapesDevLib, _, V, g;

    _export('runStuff', runStuff);

    function runStuff() {

        var joint = jointLib();

        var graph = new joint.dia.Graph();

        var paper = new joint.dia.Paper({
            el: $('#MahDiagram'),
            width: 800,
            height: 600,
            gridSize: 1,
            model: graph,
            snapLinks: true,
            embeddingMode: true,
            validateEmbedding: function validateEmbedding(childView, parentView) {
                return parentView.model instanceof joint.shapes.devs.Coupled;
            },
            validateConnection: function validateConnection(sourceView, sourceMagnet, targetView, targetMagnet) {
                return sourceMagnet != targetMagnet;
            }
        });

        var connect = function connect(source, sourcePort, target, targetPort) {
            var link = new joint.shapes.devs.Link({
                source: { id: source.id, selector: source.getPortSelector(sourcePort) },
                target: { id: target.id, selector: target.getPortSelector(targetPort) }
            });
            link.addTo(graph).reparent();
        };

        var c1 = new joint.shapes.devs.Coupled({
            position: { x: 260, y: 150 },
            size: { width: 300, height: 300 },
            inPorts: ['in'],
            outPorts: ['out 1', 'out 2']
        });

        var a1 = new joint.shapes.devs.Atomic({
            position: { x: 360, y: 360 },
            inPorts: ['xy'],
            outPorts: ['x', 'y']
        });

        var a2 = new joint.shapes.devs.Atomic({
            position: { x: 50, y: 260 },
            outPorts: ['out']
        });

        var a3 = new joint.shapes.devs.Atomic({
            position: { x: 650, y: 150 },
            size: { width: 100, height: 300 },
            inPorts: ['a', 'b']
        });

        graph.addCells([c1, a1, a2, a3]);

        c1.embed(a1);

        connect(a2, 'out', c1, 'in');
        connect(c1, 'in', a1, 'xy');
        connect(a1, 'x', c1, 'out 1');
        connect(a1, 'y', c1, 'out 2');
        connect(c1, 'out 1', a3, 'a');
        connect(c1, 'out 2', a3, 'b');

        _.each([c1, a1, a2, a3], function (element) {
            element.attr({ '.body': { 'rx': 6, 'ry': 6 } });
        });

        var highlighter = V('circle', {
            'r': 14,
            'stroke': '#ff7e5d',
            'stroke-width': '6px',
            'fill': 'transparent',
            'pointer-events': 'none'
        });

        paper.off('cell:highlight cell:unhighlight').on({

            'cell:highlight': function cellHighlight(cellView, el, opt) {

                if (opt.embedding) {
                    V(el).addClass('highlighted-parent');
                }

                if (opt.connecting) {
                    var bbox = V(el).bbox(false, paper.viewport);
                    highlighter.translate(bbox.x + 10, bbox.y + 10, { absolute: true });
                    V(paper.viewport).append(highlighter);
                }
            },

            'cell:unhighlight': function cellUnhighlight(cellView, el, opt) {

                if (opt.embedding) {
                    V(el).removeClass('highlighted-parent');
                }

                if (opt.connecting) {
                    highlighter.remove();
                }
            }
        });
    }

    return {
        setters: [function (_joint) {
            jointLib = _joint['default'];
        }, function (_jointShapesDevs) {
            jointShapesDevLib = _jointShapesDevs['default'];
        }, function (_lodash) {
            _ = _lodash['default'];
        }, function (_vectorizer) {
            V = _vectorizer['default'];
        }, function (_geometry) {
            g = _geometry['default'];
        }],
        execute: function () {
            System.config({
                meta: {
                    './geometry.js': {
                        format: 'amd'
                    },
                    './joint.js': {
                        format: 'amd'
                    },
                    './vectorizer.js': {
                        format: 'amd'
                    },
                    './joint.shapes.devs.js': {
                        format: 'amd'
                    }
                }
            });
        }
    };
});