import React, { useState, useRef, useEffect } from 'react';

const XIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const CopyIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const DownloadIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const ZoomInIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    <line x1="11" y1="8" x2="11" y2="14"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);

const ZoomOutIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);

const HomeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

// Main App Component
const MindMap = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [connectingMode, setConnectingMode] = useState(false);
  const [connectSource, setConnectSource] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const startDragging = (e, nodeId) => {
    e.stopPropagation();
    const currentNode = nodes.find(node => node.id === nodeId);
    if (!currentNode) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startNodeX = currentNode.x;
    const startNodeY = currentNode.y;

    const handleMouseMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;

      setNodes(prevNodes => prevNodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, x: startNodeX + dx, y: startNodeY + dy };
        }
        return node;
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Function to create a node at a specific position
  const createNode = (x, y, shape) => {
    const newNode = {
      id: Date.now(),
      x,
      y,
      shape: shape || selectedShape,
      text: '',
      width: 120,
      height: shape === 'square' || selectedShape === 'square' ? 120 : 
              (shape === 'rectangle' || selectedShape === 'rectangle' ? 160 : 100),
      isParent: false
    };
    
    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode.id);
  };

  // This will be called when clicking on the canvas
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      if (selectedShape) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom - position.x;
        const y = (e.clientY - rect.top) / zoom - position.y;
        
        createNode(x, y);
      } else {
        setSelectedNode(null);
      }
    }
  };

  const updateNodeText = (id, text) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, text } : node
    ));
  };

  const deleteNode = (id) => {
    setNodes(prev => prev.filter(node => node.id !== id));
    setConnections(prev => prev.filter(conn => conn.source !== id && conn.target !== id));
    setSelectedNode(null);
  };

  const startConnecting = (nodeId) => {
    setConnectingMode(true);
    setConnectSource(nodeId);
  };

  const completeConnection = (targetId) => {
    if (connectSource === targetId) {
      setConnectingMode(false);
      setConnectSource(null);
      return;
    }

    const connectionExists = connections.some(
      conn => conn.source === connectSource && conn.target === targetId
    );

    if (!connectionExists) {
      const newConnection = { source: connectSource, target: targetId };
      setConnections(prev => [...prev, newConnection]);
      
      // Set source as parent
      setNodes(prev => prev.map(node => {
        if (node.id === connectSource) {
          return { ...node, isParent: true };
        }
        return node;
      }));
    }
    
    setConnectingMode(false);
    setConnectSource(null);
  };

  const handleDragCanvas = (e) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = position.x;
    const startPosY = position.y;

    const handleMouseMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      setPosition({
        x: startPosX + dx,
        y: startPosY + dy
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // New function to handle shape selection with automatic node creation
  const handleShapeSelection = (shape) => {
    setSelectedShape(shape);
    
    // Create a node in the center of the visible canvas
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const centerX = rect.width / 2 / zoom - position.x;
      const centerY = rect.height / 2 / zoom - position.y;
      
      createNode(centerX, centerY, shape);
    }
  };

  const exportAsSVG = () => {
    const svgContent = document.getElementById('mind-map-svg').outerHTML;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mind-map.svg';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  // Node Shape Renderer
  const renderShape = (node) => {
    const baseNodeClassName = `node ${node.isParent ? 'node-parent' : ''}`;
    
    switch (node.shape) {
      case 'rectangle':
        return (
          <div
            className={`${baseNodeClassName} node-rectangle`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: `${node.width}px`,
              height: `${node.height}px`,
              zIndex: selectedNode === node.id ? 10 : 1
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNode(node.id);
              if (connectingMode) {
                completeConnection(node.id);
              }
            }}
            onMouseDown={(e) => startDragging(e, node.id)}
          >
            {renderNodeContent(node)}
          </div>
        );
      
      case 'square':
        return (
          <div
            className={`${baseNodeClassName} node-square`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: `${node.width}px`,
              height: `${node.height}px`,
              zIndex: selectedNode === node.id ? 10 : 1
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNode(node.id);
              if (connectingMode) {
                completeConnection(node.id);
              }
            }}
            onMouseDown={(e) => startDragging(e, node.id)}
          >
            {renderNodeContent(node)}
          </div>
        );
      
      case 'circle':
        return (
          <div
            className={`${baseNodeClassName} node-circle`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: `${node.width}px`,
              height: `${node.height}px`,
              zIndex: selectedNode === node.id ? 10 : 1
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNode(node.id);
              if (connectingMode) {
                completeConnection(node.id);
              }
            }}
            onMouseDown={(e) => startDragging(e, node.id)}
          >
            {renderNodeContent(node)}
          </div>
        );
      
      case 'triangle':
        return (
          <div
            className={`${baseNodeClassName} node-triangle-container`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: `${node.width}px`,
              height: `${node.height}px`,
              zIndex: selectedNode === node.id ? 10 : 1
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNode(node.id);
              if (connectingMode) {
                completeConnection(node.id);
              }
            }}
            onMouseDown={(e) => startDragging(e, node.id)}
          >
            <div 
              className="node-triangle"
              style={{
                borderLeft: `${node.width / 2}px solid transparent`,
                borderRight: `${node.width / 2}px solid transparent`,
                borderBottom: `${node.height}px solid ${node.isParent ? 'rgba(255, 165, 0, 0.7)' : 'rgba(100, 149, 237, 0.7)'}`
              }}
            />
            <div className="node-triangle-content">
              {renderNodeContent(node)}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Node content with text input and action buttons
  const renderNodeContent = (node) => {
    return (
      <>
        {selectedNode === node.id ? (
          <textarea
            className="node-textarea"
            value={node.text}
            onChange={(e) => updateNodeText(node.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span>{node.text || 'Click to edit'}</span>
        )}
        
        {selectedNode === node.id && (
          <div className="node-actions">
            <button
              className="node-action-button"
              onClick={(e) => {
                e.stopPropagation();
                startConnecting(node.id);
              }}
            >
              +
            </button>
            <button
              className="node-action-button node-delete-button"
              onClick={(e) => {
                e.stopPropagation();
                deleteNode(node.id);
              }}
            >
              <XIcon size={14} />
            </button>
          </div>
        )}
      </>
    );
  };

  // SVG Renderer for connections
  const renderConnections = () => {
    return connections.map((conn, index) => {
      const sourceNode = nodes.find(node => node.id === conn.source);
      const targetNode = nodes.find(node => node.id === conn.target);
      
      if (!sourceNode || !targetNode) return null;
      
      const sourceX = sourceNode.x + sourceNode.width / 2;
      const sourceY = sourceNode.y + sourceNode.height / 2;
      const targetX = targetNode.x + targetNode.width / 2;
      const targetY = targetNode.y + targetNode.height / 2;
      
      return (
        <g key={index}>
          <line
            x1={sourceX}
            y1={sourceY}
            x2={targetX}
            y2={targetY}
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        </g>
      );
    });
  };

  // Visualization of current connection being made
  const renderCurrentConnection = () => {
    if (!connectingMode || !connectSource) return null;
    
    const sourceNode = nodes.find(node => node.id === connectSource);
    if (!sourceNode) return null;
    
    const sourceX = sourceNode.x + sourceNode.width / 2;
    const sourceY = sourceNode.y + sourceNode.height / 2;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = position.x + (window.mouseX - rect.left) / zoom;
    const mouseY = position.y + (window.mouseY - rect.top) / zoom;
    
    return (
      <line
        x1={sourceX}
        y1={sourceY}
        x2={mouseX || sourceX}
        y2={mouseY || sourceY}
        stroke="rgba(255, 255, 255, 0.4)"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
    );
  };

  // Track mouse position for connection line
  useEffect(() => {
    const handleMouseMove = (e) => {
      window.mouseX = e.clientX;
      window.mouseY = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="mind-map-container">
      {/* Header */}
      <div className="mind-map-header">
        <h1 className="mind-map-title">Mind Map Maker
           <span>
          by @arcaptor
          </span>
          </h1>
        <div className="button-group">
          <button 
            onClick={exportAsSVG}
            className="glassmorphic-button"
          >
            <CopyIcon size={16} />
            Copy SVG
          </button>
          <button 
            onClick={() => {
              // Generating PDF would require additional libraries
              alert('PDF Export feature would be implemented here');
            }}
            className="glassmorphic-button"
          >
            <DownloadIcon size={16} />
            Export PDF
          </button>
        </div>
      </div>
      
      <div className="main-content">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="shape-options">
            <div 
              className={`shape-button ${selectedShape === 'rectangle' ? 'selected' : ''}`}
              onClick={() => handleShapeSelection('rectangle')}
            >
              <div className="shape-rectangle"></div>
            </div>
            
            <div 
              className={`shape-button ${selectedShape === 'square' ? 'selected' : ''}`}
              onClick={() => handleShapeSelection('square')}
            >
              <div className="shape-square"></div>
            </div>
            
            <div 
              className={`shape-button ${selectedShape === 'triangle' ? 'selected' : ''}`}
              onClick={() => handleShapeSelection('triangle')}
            >
              <div className="shape-triangle"></div>
            </div>
            
            <div 
              className={`shape-button ${selectedShape === 'circle' ? 'selected' : ''}`}
              onClick={() => handleShapeSelection('circle')}
            >
              <div className="shape-circle"></div>
            </div>
          </div>
          
          <div className="zoom-controls">
            <button 
              onClick={handleZoomIn}
              className="zoom-button"
            >
              <ZoomInIcon size={20} />
            </button>
            
            <button 
              onClick={handleZoomOut}
              className="zoom-button"
            >
              <ZoomOutIcon size={20} />
            </button>
            
            <button 
              onClick={handleResetZoom}
              className="zoom-button"
            >
              <HomeIcon size={20} />
            </button>
          </div>
        </div>
        
        {/* Canvas */}
        <div 
          ref={containerRef}
          className="canvas-container"
          onMouseDown={(e) => {
            if (e.target === canvasRef.current) {
              handleDragCanvas(e);
            }
          }}
        >
          <div 
            ref={canvasRef}
            className="canvas"
            style={{
              transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: '0 0'
            }}
            onClick={handleCanvasClick}
          >
            {/* SVG for connections */}
            <svg 
              id="mind-map-svg"
              width="100%" 
              height="100%" 
              style={{ position: 'absolute', pointerEvents: 'none' }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="rgba(255, 255, 255, 0.6)"
                  />
                </marker>
              </defs>
              {renderConnections()}
              {renderCurrentConnection()}
            </svg>
            
            {/* Nodes */}
            {nodes.map(node => renderShape(node))}
            
            {/* Background grid */}
            <div className="grid-background"></div>
          </div>
        </div>
      </div>
      
      {/* Status bar */}
      <div className="status-bar">
        <div>
          {connectingMode ? 'Connecting mode: Select a target node' : 'Click a shape in the sidebar to create a new node'}
        </div>
        <div>
          Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
};

export default MindMap;