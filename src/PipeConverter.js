import jointLib from './joint';
import jointShapesDevLib from './joint.shapes.devs';
import Enumerable from 'linq-es6'

export class PipeConverter
{
    toJointGraph(pipe,graph)
    {
        var joint = jointLib();


        var rootNode = pipe.rootNode;
        this.traverseAndBuild(null,null,graph,pipe.rootNode);

        //var graphLayout = new joint.layout.TreeLayout({
        //    graph: graph,
        //    verticalGap: 80,
        //    horizontalGap: 80
        //});
        //
        //graphLayout.layout();

    }

    currentOffset = 0;
    nodeMargin = 560;

    traverseAndBuild(parentNode,parentGraphNode,graph,node)
    {
        var outputs = [];
        node.ancestors.forEach((n)=>{
            outputs.push(n.getNodeName());
        });

        //var outPorts = node.ancestors
        var c1 = new joint.shapes.devs.Coupled({
            position: { x: 100, y: 150 },
            size: { width: 100, height: 100 },
            inPorts: ['in'],
            outPorts: outputs,
            attrs: {'.label' : {text : node.getNodeName()}}
        });

        //var outPorts = node.ancestors
        var e1 = new joint.shapes.devs.Coupled({
            position: { x: 10, y: 150 },
            size: { width: 10, height: 10 },
            //inPorts: ['in'],
            attrs: {'.label' : {text : 'test'}}
        });

        graph.addCells([c1]);
        graph.addCells([e1]);

        c1.embed(e1);

        if(parentGraphNode != null)
        {
            this.connect(parentGraphNode,node.getNodeName(),c1,'in',graph);
        }

        this.currentOffset += this.nodeMargin;
        node.ancestors.forEach((n)=>{
            this.traverseAndBuild(node,c1,graph,n);
        });
    }

    connect (source, sourcePort, target, targetPort,graph) {
        var link = new joint.shapes.devs.Link({
            source: { id: source.id, selector: source.getPortSelector(sourcePort) },
            target: { id: target.id, selector: target.getPortSelector(targetPort) }
        });
        link.addTo(graph).reparent();
    };
}