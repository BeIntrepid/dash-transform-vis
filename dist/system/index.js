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
        var IncrementInputFilterNodee = new transform.TransformNode(null, incrementInputFilter);

        IncrementInputFilterNoded.addInput(IncrementInputFilterNodee);
        embeddedPipe.add(IncrementInputFilterNoded);

        var embeddedPipeD = new transform.Pipe('Fourth Pipe');
        var embeddedPipeNodeD = new transform.TransformNode(null, embeddedPipeD);
        embeddedPipeD.add(embeddedPipe.rootNode.cloneTree());
        IncrementInputFilterNodea.addInput(embeddedPipeNodeD);

        var doubleEmbeddedPipe = new transform.Pipe('DoubleEmbeddedPipe');
        var IncrementInputFilterNodef = new transform.TransformNode(null, incrementInputFilter);
        doubleEmbeddedPipe.add(IncrementInputFilterNodef);

        IncrementInputFilterNodee.addInput(doubleEmbeddedPipe);

        var pipeline = new transform.Pipe('Simple Pipe');

        var dataArrayFilterNode = new transform.TransformNode(null, getDataArrayFilter);

        var IncrementInputFilterNodee = new transform.TransformNode(null, incrementInputFilter);
        var embeddedPipeNodeA = new transform.TransformNode(null, embeddedPipe);

        var embeddedPipeB = new transform.Pipe('Second Pipe');
        var embeddedPipeNodeB = new transform.TransformNode(null, embeddedPipeB);
        embeddedPipeB.add(embeddedPipe.rootNode.cloneTree());

        var embeddedPipeC = new transform.Pipe('Third Pipe');
        var embeddedPipeNodeC = new transform.TransformNode(null, embeddedPipeC);
        embeddedPipeC.add(embeddedPipeB.rootNode.cloneTree());
        embeddedPipeC.add(embeddedPipeB.rootNode.cloneTree());
        embeddedPipeC.add(embeddedPipeB.rootNode.cloneTree());
        embeddedPipeC.add(embeddedPipeB.rootNode.cloneTree());
        embeddedPipeC.add(embeddedPipeB.rootNode.cloneTree());

        embeddedPipeNodeA.addInput(IncrementInputFilterNodee);
        dataArrayFilterNode.addInput(embeddedPipeNodeA);
        dataArrayFilterNode.addInput(embeddedPipeNodeB);
        dataArrayFilterNode.addInput(embeddedPipeC);

        pipeline.add(dataArrayFilterNode).add(IncrementInputFilterNodeb).add(GetFiveFilter);

        return pc.toJointGraph(pipeline, graph);
    }

    function runStuff() {
        var V = joint.vectorizer;
        var g = joint.geometry;

        var graph = new joint.dia.Graph();

        var paper = new joint.dia.Paper({
            el: $('#MahDiagram'),
            width: 4920,
            height: 4024,
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