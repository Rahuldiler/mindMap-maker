import React, { useState, useRef, useEffect } from 'react';
import { CiZoomIn, CiZoomOut } from 'react-icons/ci';
import { GrRevert } from 'react-icons/gr';
import { IoCopyOutline } from 'react-icons/io5';
import { RxCross2 } from 'react-icons/rx';

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
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const centerX = rect.width / 2 / zoom - position.x;
      const centerY = rect.height / 2 / zoom - position.y;
      
      createNode(centerX, centerY, shape);
    }
  };

  const exportAsImage = () => {
    const svgElement = document.getElementById('mind-map-svg');
    
    // Create a canvas element to render the SVG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Get the SVG dimensions
    const svgBBox = svgElement.getBBox();
    canvas.width = svgBBox.width;
    canvas.height = svgBBox.height;
    
    // Create an image object to render the SVG
    const img = new Image();
    const svgString = new XMLSerializer().serializeToString(svgElement);
    img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
    
    img.onload = () => {
      // Draw the SVG on the canvas
      ctx.drawImage(img, 0, 0);
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        try {
          // Use Clipboard API to copy the PNG
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          
          // Optional: Provide user feedback
          alert('Mind map copied to clipboard as PNG');
        } catch (err) {
          console.error('Failed to copy to clipboard', err);
          alert('Failed to copy mind map to clipboard');
        }
      }, 'image/png');
    };
  };

  // Node Shape Renderer
// const renderShape = (node) => {
//   const baseNodeClassName = `node ${node.isParent ? 'node-parent' : ''}`;
  
//   // Function to calculate dynamic node size based on content
//   const calculateNodeSize = () => {
//     const tempElement = document.createElement('div');
//     tempElement.style.position = 'absolute';
//     tempElement.style.visibility = 'hidden';
//     tempElement.style.whiteSpace = 'pre-wrap';
//     tempElement.style.width = 'auto';
//     tempElement.style.height = 'auto';
//     tempElement.innerHTML = node.text || 'Click to edit';
//     document.body.appendChild(tempElement);
    
//     const minWidth = 100; // Minimum node width
//     const minHeight = 50; // Minimum node height
//     const padding = 20; // Padding around text
    
//     const textWidth = tempElement.offsetWidth + padding * 2;
//     const textHeight = tempElement.offsetHeight + padding * 2;
    
//     document.body.removeChild(tempElement);
    
//     return {
//       width: Math.max(textWidth, minWidth),
//       height: Math.max(textHeight, minHeight)
//     };
//   };

//   // Dynamically calculate node size
//   const dynamicSize = calculateNodeSize();
  
//   // Common node rendering logic
//   const renderCommonNode = (additionalClasses = '', contentOverride = null) => (
//     <div
//       className={`${baseNodeClassName} ${additionalClasses}`}
//       style={{
//         left: `${node.x}px`,
//         top: `${node.y}px`,
//         width: `${dynamicSize.width}px`,
//         height: `${dynamicSize.height}px`,
//         zIndex: selectedNode === node.id ? 10 : 1
//       }}
//       onClick={(e) => {
//         e.stopPropagation();
//         setSelectedNode(node.id);
//         if (connectingMode) {
//           completeConnection(node.id);
//         }
//       }}
//       onMouseDown={(e) => startDragging(e, node.id)}
//     >
//       {contentOverride || renderNodeContent(node)}
//     </div>
//   );

//   switch (node.shape) {
//     case 'rectangle':
//       return renderCommonNode('node-rectangle');
    
//     case 'square':
//       return renderCommonNode('node-square');
    
//     case 'circle':
//       return renderCommonNode('node-circle');
    
//     // case 'triangle':
//     //   return (
//     //     <div
//     //       className={`${baseNodeClassName} node-triangle-container`}
//     //       style={{
//     //         left: `${node.x}px`,
//     //         top: `${node.y}px`,
//     //         width: `${dynamicSize.width}px`,
//     //         height: `${dynamicSize.height}px`,
//     //         zIndex: selectedNode === node.id ? 10 : 1
//     //       }}
//     //       onClick={(e) => {
//     //         e.stopPropagation();
//     //         setSelectedNode(node.id);
//     //         if (connectingMode) {
//     //           completeConnection(node.id);
//     //         }
//     //       }}
//     //       onMouseDown={(e) => startDragging(e, node.id)}
//     //     >
//     //       <div 
//     //         className="node-triangle"
//     //         style={{
//     //           borderLeft: `${dynamicSize.width / 2}px solid transparent`,
//     //           borderRight: `${dynamicSize.width / 2}px solid transparent`,
//     //           borderBottom: `${dynamicSize.height}px solid ${node.isParent ? 'rgba(255, 165, 0, 0.7)' : 'rgba(100, 149, 237, 0.7)'}`
//     //         }}
//     //       />
//     //       <div className="node-triangle-content">
//     //         {renderNodeContent(node)}
//     //       </div>
//     //     </div>
//     //   );

//     default:
//       return null;
//   }
// };

  // Node content with text input and action buttons
// Update the renderNodeContent function
const renderNodeContent = (node) => {
  return (
    <>
      {selectedNode === node.id ? (
        <textarea
          className="node-textarea"
          value={node.text}
          onChange={(e) => updateNodeText(node.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '300px',
            height: 'auto',
            minHeight: node.shape === 'square' ? '120px' : 
                       node.shape === 'rectangle' ? '160px' : '100px',
            resize: 'none',
            overflow: 'hidden',
            boxSizing: 'border-box',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            textAlign: 'center',
            padding: '10px'
          }}
          rows={1}
          onInput={(e) => {
            // Auto-resize logic
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />
      ) : (
        <span style={{ 
          maxWidth: '300px', 
          wordWrap: 'break-word', 
          display: 'inline-block' 
        }}>
          {node.text || 'Click to edit'}
        </span>
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
            <RxCross2 size={14} />
          </button>
        </div>
      )}
    </>
  );
};

// Update the renderShape function to use dynamic sizing
const renderShape = (node) => {
  const baseNodeClassName = `node ${node.isParent ? 'node-parent' : ''}`;
  
  // Function to calculate dynamic node size based on content
  const calculateNodeSize = () => {
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.style.maxWidth = '300px';
    tempElement.style.width = 'auto';
    tempElement.style.height = 'auto';
    tempElement.style.whiteSpace = 'pre-wrap';
    tempElement.style.wordWrap = 'break-word';
    tempElement.innerHTML = node.text || 'Click to edit';
    document.body.appendChild(tempElement);
    
    const minWidth = node.shape === 'square' ? 120 : 100;
    const minHeight = node.shape === 'square' ? 120 : 
                      node.shape === 'rectangle' ? 160 : 100;
    const padding = 10; // Padding around text
    
    const textWidth = Math.min(tempElement.offsetWidth + padding * 2, 300);
    const textHeight = tempElement.offsetHeight + padding * 2;
    
    document.body.removeChild(tempElement);
    
    return {
      width: Math.max(textWidth, minWidth),
      height: Math.max(textHeight, minHeight)
    };
  };

  // Dynamically calculate node size
  const dynamicSize = calculateNodeSize();
  
  // Common node rendering logic
  const renderCommonNode = (additionalClasses = '', contentOverride = null) => (
    <div
      className={`${baseNodeClassName} ${additionalClasses}`}
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        width:node.shape === "node-rectangle" ? "300px" : `${dynamicSize.width}px`,
        height: `${dynamicSize.height}px`,
        maxWidth: node.shape === "node-rectangle" ? "300px" :  "100%",
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
      {contentOverride || renderNodeContent(node)}
    </div>
  );

  switch (node.shape) {
    case 'rectangle':
      return renderCommonNode('node-rectangle');
    
    case 'square':
      return renderCommonNode('node-square');
    
    case 'circle':
      return renderCommonNode('node-circle');
    
    default:
      return null;
  }
};

// Updated renderConnections to use dynamic node size
const renderConnections = () => {
  return connections.map((conn, index) => {
    const sourceNode = nodes.find(node => node.id === conn.source);
    const targetNode = nodes.find(node => node.id === conn.target);
    
    if (!sourceNode || !targetNode) return null;
    
    // Calculate center of the node
    const sourceX = sourceNode.x + (sourceNode.width || 100) / 2;
    const sourceY = sourceNode.y + (sourceNode.height || 100) / 2;
    const targetX = targetNode.x + (targetNode.width || 100) / 2;
    const targetY = targetNode.y + (targetNode.height || 100) / 2;
    
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

// Modify createNode to support dynamic sizing
const createNode = (x, y, shape) => {
  const newNode = {
    id: Date.now(),
    x,
    y,
    shape: shape || selectedShape,
    text: '',
    width: shape === 'square' ? 120 : 
           shape === 'rectangle' ? 160 : 100,
    height: shape === 'square' ? 120 : 
            shape === 'rectangle' ? 160 : 100,
    maxWidth: 300,
    isParent: false
  };
  
  setNodes(prev => [...prev, newNode]);
  setSelectedNode(newNode.id);
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
         
          </h1>
        <div className="button-group">
          <button 
            onClick={exportAsImage}
            className="glassmorphic-button"
          >
            <IoCopyOutline size={16} />
            Copy To Clipboard
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
            
            {/* <div 
              className={`shape-button ${selectedShape === 'triangle' ? 'selected' : ''}`}
              onClick={() => handleShapeSelection('triangle')}
            >
              <div className="shape-triangle"></div>
            </div> */}
            
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
              <CiZoomIn size={20} />
            </button>
            
            <button 
              onClick={handleZoomOut}
              className="zoom-button"
            >
              <CiZoomOut size={20} />
            </button>
            
            <button 
              onClick={handleResetZoom}
              className="zoom-button"
            >
              <GrRevert size={20} />
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