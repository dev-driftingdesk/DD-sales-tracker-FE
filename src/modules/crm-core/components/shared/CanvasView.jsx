import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';

export default function CanvasView({
  nodes,
  edges,
  onNodeClick,
  renderNode,
  className = '',
  height = '600px'
}) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Simple force-directed layout calculation
  useEffect(() => {
    if (!nodes.length) return;

    // Position nodes in a circle for now
    const centerX = 400;
    const centerY = 300;
    const radius = 200;
    
    nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });
  }, [nodes]);

  const handleMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.closest('.canvas-viewport')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom * 0.8, 0.5));
  };

  const handleFitToScreen = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className={`relative bg-gray-50 rounded-lg overflow-hidden ${className}`} style={{ height }}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitToScreen}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="canvas-viewport w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <svg
          width="100%"
          height="100%"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center'
          }}
        >
          {/* Render edges */}
          <g className="edges">
            {edges.map((edge, index) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              
              if (!sourceNode || !targetNode) return null;
              
              return (
                <line
                  key={index}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray={edge.type === 'dashed' ? '5,5' : ''}
                />
              );
            })}
          </g>

          {/* Render nodes */}
          <g className="nodes">
            {nodes.map((node) => (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onNodeClick(node)}
                className="cursor-pointer"
              >
                {renderNode ? (
                  <foreignObject
                    x="-60"
                    y="-30"
                    width="120"
                    height="60"
                    className="overflow-visible"
                  >
                    {renderNode(node)}
                  </foreignObject>
                ) : (
                  <>
                    <circle
                      r="30"
                      fill={node.color || '#0D9488'}
                      fillOpacity="0.1"
                      stroke={node.color || '#0D9488'}
                      strokeWidth="2"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fill="#374151"
                    >
                      {node.label}
                    </text>
                  </>
                )}
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Help text */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 flex items-center gap-1">
        <Move className="w-3 h-3" />
        Drag to pan • Scroll to zoom • Click nodes to interact
      </div>
    </div>
  );
}