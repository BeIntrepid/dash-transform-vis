import joint from 'jointjs';
//import jointShapesDevLib from './joint.shapes.devs';
import Enumerable from 'linq-es6'
import {Pipe} from 'dash-transform'

export class PipeConverter
{
    nodeBreadthPadding = 50;
    nodeDepthPadding = 50;

    toJointGraph(pipe,graph)
    {
        var rootNode = pipe.rootNode;

        var params = new TraverseParams();
        params.graph = graph;
        params.node = pipe.rootNode;
        params.level = 0;

        this.traverseAndBuild(params);

        this.treeLayout(graph,pipe);

        //var graphLayout = new joint.layout.TreeLayout({
        //    graph: graph,
        //    verticalGap: 80,
        //    horizontalGap: 80
        //});
        //
        //graphLayout.layout();

    }

    treeLayout(graph,pipe)
    {
        var node = pipe.rootNode;
        this.prepareNode(node);
        this.layoutNode(graph,pipe);
    }

    layoutNode(graph,pipe,hStart=0,vStart=0,maxBreadth=0)
    {
        var levelInfo = [];
        this.getNodeLevelInfo(levelInfo,pipe.rootNode,0);
        var max = 0;
        levelInfo.forEach((n)=>{
            if(n.breadth > max)
            {
                max= n.breadth;
            }
        });

        var maxNodeSpace = maxBreadth == 0 ? max : maxBreadth;
        var centre = maxNodeSpace / 2;

        var hOffset = hStart;
        levelInfo.forEach((nodeLevel)=>{

            var startPos = centre - (nodeLevel.breadth / 2);
            startPos += vStart;

            var vOffset = startPos;

            nodeLevel.children.forEach((node)=> {
                node.graphInfo.graphNode.position(hOffset,vOffset);
                vOffset += node.graphInfo.graphNode.attributes.size.height;
                vOffset += this.nodeBreadthPadding;

                if(node.pipe instanceof Pipe)
                {
                    var pos = node.graphInfo.graphNode.position();
                    var startX = pos.x + this.nodeDepthPadding;
                    var startY = pos.y + this.nodeBreadthPadding / 2;
                    this.layoutNode(graph,node.pipe,startX,startY,node.graphInfo.graphNode.attributes.size.height);
                }

            });

            hOffset += nodeLevel.maxDepth;
            hOffset += this.nodeDepthPadding;
        });
    }

    prepareNode(node)
    {
        if(node.pipe instanceof Pipe)
        {
            this.prepareNode(node.pipe.rootNode);
            this.layoutPipeNode(node)
        }
        else
        {
            // Build this depending on the text etc later
            node.graphInfo.graphNode.resize(100,100);
        }

        node.ancestors.forEach((n)=>{
            this.prepareNode(n);
        });
    }

    layoutPipeNode(node)
    {
        var levelInfo = [];
        this.getNodeLevelInfo(levelInfo,node.pipe.rootNode,0);
        var nodeBreadthNeeded = this.getMaxNodeSizeFromLevelInfo(levelInfo);
        var nodeDepthNeeded = this.getTotalDepthSizeFromLevelInfo(levelInfo) + this.nodeDepthPadding;
        node.graphInfo.graphNode.resize(nodeDepthNeeded,nodeBreadthNeeded);
    }

    getTotalDepthSizeFromLevelInfo(levelInfo)
    {
        var depth = 0;
        levelInfo.forEach((n)=>{
            depth += n.maxDepth + this.nodeDepthPadding;
        });
        return depth;
    }

    getMaxNodeSizeFromLevelInfo(levelInfo)
    {
        var max = 0;
        levelInfo.forEach((n)=>{
            if(n.breadth > max)
            {
                max= n.breadth;
            }
        });

        return max;
    }

    getNodeLevelInfo(levelInfo,node,level)
    {
        var nodeBreadth = node.graphInfo.graphNode.attributes.size.height;
        var curNodeDepth = node.graphInfo.graphNode.attributes.size.width;

        var breadthAddition = (this.nodeBreadthPadding );

        if(levelInfo[level] == null)
        {
            levelInfo[level] = {};
            levelInfo[level].breadth = nodeBreadth + breadthAddition ;
            levelInfo[level].maxDepth = curNodeDepth;
            levelInfo[level].children = [];
        }
        else
        {
            levelInfo[level].breadth += nodeBreadth + breadthAddition ;
        }

        if(curNodeDepth > levelInfo[level].maxDepth)
        {
            levelInfo[level].maxDepth = curNodeDepth;
        }

        levelInfo[level].children.push(node);

        node.ancestors.forEach((n)=>{
            this.getNodeLevelInfo(levelInfo,n,level + 1);
        });

    }

    currentOffset = 0;
    nodeMargin = 560;

    traverseAndBuild(params)
    {

        var [parentNode,parentGraphNode,graph,node,level,parentPipe,parentPipeGraphNode] = [params.parentNode,params.parentGraphNode,params.graph,params.node,params.level,params.parentPipe,params.parentPipeGraphNode];


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

        node.graphInfo = {graphNode : c1};

        if(node.pipe instanceof Pipe)
        {
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

        if(parentGraphNode != null)
        {
            var parentNodeName = node.getNodeName();
            if(parentPipe != null && parentNode.pipe instanceof Pipe) {
                parentNodeName = "in";
            }

            this.connect(parentGraphNode, parentNodeName, c1, 'in', graph);
        }

        if(parentPipe != null)
        {
            parentPipeGraphNode.embed(c1);
        }

        this.currentOffset += this.nodeMargin;
        node.ancestors.forEach((n)=>{
            var params = new TraverseParams();
            params.parentNode = node;
            params.parentGraphNode = c1;
            params.graph = graph;
            params.node = n;
            params.level = level + 1;
            if(parentPipe != null)
            {
                params.parentPipe = parentPipe;
                params.parentPipeGraphNode = parentPipeGraphNode;
            }


            this.traverseAndBuild(params);
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

class TraverseParams{
    parentNode;
    parentGraphNode;
    graph;
    node;
    level;
    layoutInfo;
    parentPipe;
}

class LayoutInfo
{
    constructor()
    {
        this.ancestors = [];
    }

    node;
    graphNode;
    ancestors;
}