import joint from 'jointjs';
//import jointShapesDevLib from './joint.shapes.devs';
import Enumerable from 'linq-es6'
import {Pipe} from 'dash-transform'

export class PipeConverter
{
    toJointGraph(pipe,graph)
    {

        var rootNode = pipe.rootNode;
        var layoutInfo = this.traverseAndBuild(null,null,graph,pipe.rootNode,0);

        this.treeLayout(graph,layoutInfo );

        //var graphLayout = new joint.layout.TreeLayout({
        //    graph: graph,
        //    verticalGap: 80,
        //    horizontalGap: 80
        //});
        //
        //graphLayout.layout();

    }

    treeLayout(graph,layoutInfo)
    {
        var counts = layoutInfo.nodeLevels;
        var max = 0;
        var verticalSpaceSize = 150;
        var horizontalSpaceSize = 250;
        layoutInfo.nodeLevels.forEach((n)=>{
            if(n.count > max)
            {
                max= n.count;
            }
        });

        var maxNodeSpace = verticalSpaceSize * max;
        var centre = maxNodeSpace / 2;

        var hOffset = 0;
        layoutInfo.nodeLevels.forEach((nodeLevel)=>{

            var startPos = centre - ((nodeLevel.count * verticalSpaceSize) / 2);

            var vOffset = startPos;

            var index = 0;
            nodeLevel.nodes.forEach((node)=> {

                node.position(hOffset,vOffset + (index * verticalSpaceSize));
                index++;
            });

            hOffset += horizontalSpaceSize;
        });


    }

    currentOffset = 0;
    nodeMargin = 560;

    traverseAndBuild(    parentNode,
    parentGraphNode,
    graph,
    node,
    level,
    layoutInfo)
    {

        if (layoutInfo == null)
        {
            layoutInfo = {nodeLevels : []};
        }

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

        graph.addCells([c1]);

        if(node.pipe instanceof Pipe)
        {
            this.traverseAndBuild(node,c1,graph,node.pipe.rootNode,0);
        }


        if(layoutInfo.nodeLevels[level] == null)
        {
            layoutInfo.nodeLevels[level] = {count : 1, nodes : []};
        }
        else
        {
            layoutInfo.nodeLevels[level].count =  layoutInfo.nodeLevels[level].count + 1;
        }

        layoutInfo.nodeLevels[level].nodes.push(c1);

        if(parentGraphNode != null)
        {
            this.connect(parentGraphNode,node.getNodeName(),c1,'in',graph);
        }

        this.currentOffset += this.nodeMargin;
        node.ancestors.forEach((n)=>{

            this.traverseAndBuild(node,c1,graph,n,level + 1,layoutInfo);
        });

        return layoutInfo;
    }

    connect (source, sourcePort, target, targetPort,graph) {
        var link = new joint.shapes.devs.Link({
            source: { id: source.id, selector: source.getPortSelector(sourcePort) },
            target: { id: target.id, selector: target.getPortSelector(targetPort) }
        });
        link.addTo(graph).reparent();
    };
}

class TraverseParams{
    parentNode;
    parentGraphNode;
    graph;
    node;
    level;
    layoutInfo;
}