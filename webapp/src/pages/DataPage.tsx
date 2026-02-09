import React, { useCallback, useEffect, useState } from 'react';
import { 
  ReactFlow, 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges, 
  MarkerType, 
  Position,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange
} from '@reactflow/core';
import { MiniMap } from '@reactflow/minimap';
import { Controls } from '@reactflow/controls';
import { Background } from '@reactflow/background';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { Box, Spinner, Flex, Heading } from '@chakra-ui/react';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { ObjectType, Funnel } from 'src/types';
import { axiosWithAuth } from 'src/api/utils';

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const DataPage: React.FC = () => {
  const { globalData } = useGlobalContext();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const newSelectedId = node.id === selectedNodeId ? null : node.id;
    setSelectedNodeId(newSelectedId);
    
    // Find connected edges and nodes to highlight
    const connectedEdgeIds = new Set<string>();
    const connectedNodeIds = new Set<string>();
    
    if (newSelectedId) {
        connectedNodeIds.add(newSelectedId);
        // We use the current edges state to find connections
        // Note: This relies on the closure 'edges' being relatively fresh.
        // Since onNodeClick is recreated when edges change (in dependency array), this should be fine.
        edges.forEach(edge => {
            if (edge.source === newSelectedId || edge.target === newSelectedId) {
                connectedEdgeIds.add(edge.id);
                connectedNodeIds.add(edge.source);
                connectedNodeIds.add(edge.target);
            }
        });
    }

    setNodes((nds) => nds.map(n => ({
        ...n,
        style: {
            ...n.style,
            opacity: newSelectedId ? (connectedNodeIds.has(n.id) ? 1 : 0.1) : 1
        }
    })));

    setEdges((eds) => eds.map(e => ({
        ...e,
        style: {
            ...e.style,
            stroke: newSelectedId 
                ? (connectedEdgeIds.has(e.id) ? '#ff0072' : (e.data?.originalColor || '#b1b1b7'))
                : (e.data?.originalColor || '#b1b1b7'),
            opacity: newSelectedId ? (connectedEdgeIds.has(e.id) ? 1 : 0.1) : 1,
            strokeWidth: newSelectedId && connectedEdgeIds.has(e.id) ? 3 : 1,
        },
        animated: newSelectedId ? (connectedEdgeIds.has(e.id) ? true : (e.data?.originalAnimated ?? e.animated)) : (e.data?.originalAnimated ?? e.animated),
        labelStyle: {
            opacity: newSelectedId ? (connectedEdgeIds.has(e.id) ? 1 : 0.1) : 1,
        },
        zIndex: newSelectedId && connectedEdgeIds.has(e.id) ? 999 : 0,
    })));

  }, [selectedNodeId, edges, setNodes, setEdges]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setNodes((nds) => nds.map(n => ({ ...n, style: { ...n.style, opacity: 1 } })));
    setEdges((eds) => eds.map(e => ({
        ...e,
        style: { 
            ...e.style, 
            stroke: e.data?.originalColor || '#b1b1b7', 
            opacity: 1, 
            strokeWidth: 1 
        },
        animated: e.data?.originalAnimated ?? e.animated,
        labelStyle: { opacity: 1 },
        zIndex: 0,
    })));
  }, [setNodes, setEdges]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all objects. 
      const response = await axiosWithAuth().get('/objects/advanced', {
        params: {
          page_size: 1000,
        },
      });
      
      const objects = response.data?.items || [];
      const objectTypes: ObjectType[] = globalData?.objectTypeData?.objectTypes || [];
      const funnels: Funnel[] = globalData?.funnelData?.funnels || [];

      const initialNodes: Node[] = [];
      const initialEdges: Edge[] = [];
      const objectIdMap = new Set<string>();
      const stepIdMap = new Set<string>();
      const objectTypeIdMap = new Set<string>();

      // Create Nodes for Object Types
      objectTypes.forEach((ot) => {
        const typeNodeId = `type-${ot.id}`;
        objectTypeIdMap.add(typeNodeId);
        initialNodes.push({
            id: typeNodeId,
            data: { label: `Type: ${ot.name}` },
            position: { x: 0, y: 0 },
            type: 'default',
            style: {
                background: '#faf5ff', // Light purple background
                border: '1px solid #805ad5',
                borderRadius: '5px',
                padding: '10px',
                fontSize: '12px',
                fontWeight: 'bold',
                width: nodeWidth,
            },
        });
      });

      // Create Nodes for Objects
      objects.forEach((obj: any) => {
        objectIdMap.add(obj.id);
        initialNodes.push({
          id: obj.id,
          data: { label: obj.name || 'Untitled' },
          position: { x: 0, y: 0 }, // Position will be set by dagre
          type: 'default',
          style: { 
            background: '#fff', 
            border: '1px solid #777', 
            borderRadius: '5px',
            padding: '10px',
            fontSize: '12px',
            width: nodeWidth,
            opacity: 1, // Ensure opacity is set
          },
        });
      });

      // Create Nodes for Funnel Steps
      funnels.forEach((funnel) => {
        funnel.steps.forEach((step) => {
            const stepNodeId = `step-${step.id}`;
            stepIdMap.add(stepNodeId);
            initialNodes.push({
                id: stepNodeId,
                data: { label: `${funnel.name}: ${step.name}` },
                position: { x: 0, y: 0 },
                type: 'default',
                style: {
                    background: '#e6fffa', // Light teal background for steps
                    border: '1px solid #319795',
                    borderRadius: '5px',
                    padding: '10px',
                    fontSize: '12px',
                    width: nodeWidth,
                },
            });
        });
      });

      // Create Edges
      objects.forEach((obj: any) => {
        // 1. Edges from Object Type Values (Object Links)
        if (obj.type_values) {
            obj.type_values.forEach((otv: any) => {
                // Link Object Type to Object (Instance of)
                const typeNodeId = `type-${otv.objectTypeId}`;
                if (objectTypeIdMap.has(typeNodeId)) {
                    const color = '#9f7aea';
                    initialEdges.push({
                        id: `type-${otv.objectTypeId}-${obj.id}`,
                        source: typeNodeId,
                        target: obj.id,
                        label: 'instance of',
                        type: 'smoothstep',
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                        },
                        animated: false,
                        style: { stroke: color, strokeDasharray: '5,5' }, // Purple dashed line
                        data: { originalColor: color, originalAnimated: false }
                    });
                }

                const objectType = objectTypes.find(t => t.id === otv.objectTypeId);
                if (!objectType || !objectType.fields) return;

                Object.entries(otv.type_values).forEach(([fieldKey, fieldValue]: [string, any]) => {
                    const fieldConfig = objectType.fields[fieldKey];
                    let isObjectField = false;
                    if (fieldConfig === 'object') isObjectField = true;
                    else if (typeof fieldConfig === 'object' && fieldConfig.type === 'object') isObjectField = true;

                    if (isObjectField && fieldValue) {
                    const targets = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
                    
                    targets.forEach((target: any) => {
                        if (target && target.id && objectIdMap.has(target.id)) {
                        const color = '#555';
                        initialEdges.push({
                            id: `${obj.id}-${target.id}-${fieldKey}`,
                            source: obj.id,
                            target: target.id,
                            label: fieldKey,
                            type: 'smoothstep',
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                            },
                            animated: true,
                            style: { stroke: color },
                            data: { originalColor: color, originalAnimated: true }
                        });
                        }
                    });
                    }
                });
            });
        }

        // 2. Edges from Funnel Steps (Object -> Step)
        if (obj.steps && Array.isArray(obj.steps)) {
            obj.steps.forEach((step: any) => {
                const stepNodeId = `step-${step.stepId}`;
                if (stepIdMap.has(stepNodeId)) {
                     const color = '#319795';
                     initialEdges.push({
                        id: `${obj.id}-${stepNodeId}`,
                        source: obj.id,
                        target: stepNodeId,
                        label: 'in step',
                        type: 'smoothstep',
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                        },
                        style: { stroke: color, strokeDasharray: '5,5' },
                        data: { originalColor: color, originalAnimated: false }
                    });
                }
            });
        }
      });

      const layouted = getLayoutedElements(initialNodes, initialEdges);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);

    } catch (error) {
      console.error("Failed to fetch data for graph", error);
    } finally {
      setLoading(false);
    }
  }, [globalData, setNodes, setEdges]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <Box height="100%" width="100%" p={4} bg="gray.50">
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="md">Data Workflow View</Heading>
            {loading && <Spinner size="sm" />}
        </Flex>
      <Box height="calc(100vh - 150px)" border="1px solid #ddd" borderRadius="md" bg="white">
        {!loading && (
            <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            attributionPosition="bottom-right"
            >
            <MiniMap />
            <Controls />
            <Background color="#aaa" gap={16} />
            </ReactFlow>
        )}
        {loading && (
            <Flex justify="center" align="center" height="100%">
                <Spinner size="xl" />
            </Flex>
        )}
      </Box>
    </Box>
  );
};

export default DataPage;
