System.register(['jointjs', './PipeConverter', 'dash-transform', './pipeConverter'], function (_export) {
    'use strict';

    var joint, PipeConverter, transform;

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
        var IncrementInputFilterNodec = new transform.TransformNode(null, incrementInputFilter);

        var GetFiveFilter = new transform.TransformNode(null, new transform.FunctionFilter('GetFive', function (input, i) {
            return 5;
        }));

        GetFiveFilter.addInput(IncrementInputFilterNodea);
        GetFiveFilter.addInput(IncrementInputFilterNodec);

        var embeddedPipe = new transform.Pipe('EmbeddedPipe');
        var IncrementInputFilterNoded = new transform.TransformNode(null, incrementInputFilter);

        embeddedPipe.add(IncrementInputFilterNoded);

        var pipeline = new transform.Pipe('Simple Pipe');

        var dataArrayFilterNode = new transform.TransformNode(null, getDataArrayFilter);
        dataArrayFilterNode.addInput(embeddedPipe);

        pipeline.add(dataArrayFilterNode).add(IncrementInputFilterNodeb).add(GetFiveFilter);

        return pc.toJointGraph(pipeline, graph);
    }

    function runStuff() {
        var V = joint.vectorizer;
        var g = joint.geometry;

        var graph = new joint.dia.Graph();

        var paper = new joint.dia.Paper({
            el: $('#MahDiagram'),
            width: 1280,
            height: 1024,
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
        setters: [function (_jointjs) {
            joint = _jointjs['default'];
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