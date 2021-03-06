
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

export {PipeConverter} from './pipeConverter';

import joint from 'jointjs';
//import jointShapesDevLib from './joint.shapes.devs';
//import treeLayout from './treelayout';
//import _ from 'lodash';
//import V from 'vectorizer';
//import g from 'geometry';


import {PipeConverter} from './PipeConverter';
import * as transform from 'dash-transform';

function generatePipeGraph(graph)
{
    var pc = new PipeConverter();



    var getDataArrayFilter = new transform.FunctionFilter('GetDataArray',(input,i)=>{
        return [1,2,3,4];
    });

    var incrementInputFilter = new transform.FunctionFilter('IncrementInput',(input,i)=>{
        return i + 1;
    });
    var IncrementInputFilterNodea = new transform.TransformNode(null,incrementInputFilter);
    var IncrementInputFilterNodeb = new transform.TransformNode(null,incrementInputFilter);
    var IncrementInputFilterNodec = new transform.TransformNode(null,incrementInputFilter);

    var GetFiveFilter = new transform.TransformNode(null,new transform.FunctionFilter('GetFive',(input,i)=>{
        return 5;
    }));

    GetFiveFilter.addInput(IncrementInputFilterNodea);
    GetFiveFilter.addInput(IncrementInputFilterNodec);

    var embeddedPipe = new transform.Pipe('EmbeddedPipe');
    var IncrementInputFilterNoded = new transform.TransformNode(null,incrementInputFilter);
    var IncrementInputFilterNodee = new transform.TransformNode(null,incrementInputFilter);



    IncrementInputFilterNoded.addInput(IncrementInputFilterNodee);
    embeddedPipe.add(IncrementInputFilterNoded);

    var embeddedPipeD = new transform.Pipe('Fourth Pipe');
    var embeddedPipeNodeD = new transform.TransformNode(null,embeddedPipeD);
    embeddedPipeD.add(embeddedPipe.rootNode.cloneTree() );
    IncrementInputFilterNodea.addInput(embeddedPipeNodeD );


    var doubleEmbeddedPipe = new transform.Pipe('DoubleEmbeddedPipe');
    var IncrementInputFilterNodef = new transform.TransformNode(null,incrementInputFilter);
    doubleEmbeddedPipe.add(IncrementInputFilterNodef);

    IncrementInputFilterNodee.addInput(doubleEmbeddedPipe);

    var pipeline = new transform.Pipe('Simple Pipe');

    var dataArrayFilterNode = new transform.TransformNode(null,getDataArrayFilter);

    var IncrementInputFilterNodee = new transform.TransformNode(null,incrementInputFilter);
    var embeddedPipeNodeA = new transform.TransformNode(null,embeddedPipe);

    var embeddedPipeB = new transform.Pipe('Second Pipe');
    var embeddedPipeNodeB = new transform.TransformNode(null,embeddedPipeB);
    embeddedPipeB.add(embeddedPipe.rootNode.cloneTree() );

    var embeddedPipeC = new transform.Pipe('Third Pipe');
    var embeddedPipeNodeC = new transform.TransformNode(null,embeddedPipeC);
    embeddedPipeC.add(embeddedPipeB.rootNode.cloneTree() );
    embeddedPipeC.add(embeddedPipeB.rootNode.cloneTree());
    embeddedPipeC.add(embeddedPipeB.rootNode.cloneTree());
    embeddedPipeC.add(embeddedPipeB.rootNode.cloneTree());
    embeddedPipeC.add(embeddedPipeB.rootNode.cloneTree());

    embeddedPipeNodeA.addInput(IncrementInputFilterNodee);
   dataArrayFilterNode.addInput(embeddedPipeNodeA);
   dataArrayFilterNode.addInput(embeddedPipeNodeB);
   dataArrayFilterNode.addInput(embeddedPipeC);

    pipeline.add(dataArrayFilterNode)
        .add(IncrementInputFilterNodeb)
        .add(GetFiveFilter);

    return pc.toJointGraph(pipeline,graph);

}

export function runStuff()
{
    var V = joint.vectorizer;
    var g = joint.geometry;

    var graph = new joint.dia.Graph;

    var paper = new joint.dia.Paper({
        el: $('#MahDiagram'),
        width: 4920,
        height: 4024,
        gridSize: 1,
        model: graph,
        snapLinks: true,
        embeddingMode: true,
        validateEmbedding: function(childView, parentView) {
            return parentView.model instanceof joint.shapes.devs.Coupled;
        },
        validateConnection: function(sourceView, sourceMagnet, targetView, targetMagnet) {
            return sourceMagnet != targetMagnet;
        }
    });

    generatePipeGraph(graph);

    //var connect = function(source, sourcePort, target, targetPort) {
    //    var link = new joint.shapes.devs.Link({
    //        source: { id: source.id, selector: source.getPortSelector(sourcePort) },
    //        target: { id: target.id, selector: target.getPortSelector(targetPort) }
    //    });
    //    link.addTo(graph).reparent();
    //};
    //
    //var c1 = new joint.shapes.devs.Coupled({
    //    position: { x: 260, y: 150 },
    //    size: { width: 300, height: 300 },
    //    inPorts: ['in'],
    //    outPorts: ['out 1','out 2'],
    //});
    //
    //var a1 = new joint.shapes.devs.Atomic({
    //    position: { x: 360, y: 360 },
    //    inPorts: ['xy'],
    //    outPorts: ['x','y']
    //});
    //
    //var a2 = new joint.shapes.devs.Atomic({
    //    position: { x: 50, y: 260 },
    //    outPorts: ['out']
    //});
    //
    //var a3 = new joint.shapes.devs.Atomic({
    //    position: { x: 650, y: 150 },
    //    size: { width: 100, height: 300 },
    //    inPorts: ['a','b']
    //});
    //
    //graph.addCells([c1, a1, a2, a3]);

    //
    //c1.embed(a1);
    //
    //connect(a2,'out',c1,'in');
    //connect(c1,'in',a1,'xy');
    //connect(a1,'x',c1,'out 1');
    //connect(a1,'y',c1,'out 2');
    //connect(c1,'out 1',a3,'a');
    //connect(c1,'out 2',a3,'b');

    /* rounded corners */

    //_.each([c1,a1,a2,a3], function(element) {
    //    element.attr({ '.body': { 'rx': 6, 'ry': 6 }});
    //});

    /* custom highlighting */

    var highlighter = V('circle', {
        'r': 14,
        'stroke': '#ff7e5d',
        'stroke-width': '6px',
        'fill': 'transparent',
        'pointer-events': 'none'
    });

    paper.off('cell:highlight cell:unhighlight').on({

        'cell:highlight': function(cellView, el, opt) {

            if (opt.embedding) {
                V(el).addClass('highlighted-parent');
            }

            if (opt.connecting) {
                var bbox = V(el).bbox(false, paper.viewport);
                highlighter.translate(bbox.x + 10, bbox.y + 10, { absolute: true });
                V(paper.viewport).append(highlighter);
            }
        },

        'cell:unhighlight': function(cellView, el, opt) {

            if (opt.embedding) {
                V(el).removeClass('highlighted-parent');
            }

            if (opt.connecting) {
                highlighter.remove();
            }
        }
    });
}
