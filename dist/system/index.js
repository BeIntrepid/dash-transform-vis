System.register(['./joint', './joint.shapes.devs', './treelayout', 'lodash', 'vectorizer', 'geometry', './PipeConverter', 'dash-transform', './pipeConverter'], function (_export) {
    'use strict';

    var jointLib, jointShapesDevLib, treeLayout, _, V, g, PipeConverter, transform;

    _export('runStuff', runStuff);

    function generatePipeGraph(graph) {
        var pc = new PipeConverter();

        var getDataArrayFilter = new transform.FunctionFilter('GetDataArray', function (input, i) {
            return [1, 2, 3, 4];
        });

        var incrementInputFilter = new transform.FunctionFilter('IncrementInput', function (input, i) {
            return i + 1;
        });
        var IncrementInputFilterNodea = new transform.TransformNode(null, incrementInputFilter);
        var IncrementInputFilterNodeb = new transform.TransformNode(null, incrementInputFilter);

        var GetFiveFilter = new transform.TransformNode(null, new transform.FunctionFilter('GetFive', function (input, i) {
            return 5;
        }));

        GetFiveFilter.addInput(IncrementInputFilterNodea);

        var pipeline = new transform.Pipe('Simple Pipe');

        pipeline.add(getDataArrayFilter).add(IncrementInputFilterNodeb).add(GetFiveFilter);

        return pc.toJointGraph(pipeline, graph);
    }

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

        generatePipeGraph(graph);

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
        }, function (_treelayout) {
            treeLayout = _treelayout['default'];
        }, function (_lodash) {
            _ = _lodash['default'];
        }, function (_vectorizer) {
            V = _vectorizer['default'];
        }, function (_geometry) {
            g = _geometry['default'];
        }, function (_PipeConverter) {
            PipeConverter = _PipeConverter.PipeConverter;
        }, function (_dashTransform) {
            transform = _dashTransform;
        }, function (_pipeConverter) {
            _export('PipeConverter', _pipeConverter.PipeConverter);
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