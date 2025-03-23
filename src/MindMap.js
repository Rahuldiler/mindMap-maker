import React, { useState, useRef } from "react";
import { Stage, Layer, Rect, Circle, Line, Text, Group } from "react-konva";
import html2canvas from "html2canvas";

const MindMap = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const stageRef = useRef(null);

  // Add a new node with shape
  const addNode = (shape) => {
    const newNode = {
      id: nodes.length + 1,
      x: 200,
      y: 200,
      shape,
      text: "New Node",
    };
    setNodes([...nodes, newNode]);
  };

  // Handle drag move
  const handleDragMove = (e, id) => {
    const newNodes = nodes.map((node) =>
      node.id === id ? { ...node, x: e.target.x(), y: e.target.y() } : node
    );
    setNodes(newNodes);
  };

  // Handle text change
  const handleTextChange = (id) => {
    const newText = prompt(
      "Enter new text",
      nodes.find((n) => n.id === id)?.text || ""
    );
    if (newText) {
      setNodes(
        nodes.map((node) =>
          node.id === id ? { ...node, text: newText } : node
        )
      );
    }
  };

  // Connect nodes
  const handleNodeClick = (id) => {
    if (!isConnecting) return;
    if (selectedNode === null) {
      setSelectedNode(id);
    } else {
      if (selectedNode !== id) {
        setConnections([...connections, { from: selectedNode, to: id }]);
      }
      setSelectedNode(null);
    }
  };

  // Capture node and copy to clipboard
  const copyToClipboard = async (id) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return;

    const canvas = await html2canvas(document.body);
    canvas.toBlob((blob) => {
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]);
      alert("Copied to clipboard!");
    });
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: "150px", padding: "10px", background: "#eee" }}>
        <h3>Shapes</h3>
        <button onClick={() => addNode("rect")}>Rectangle</button>
        <button onClick={() => addNode("circle")}>Circle</button>
        <button onClick={() => addNode("triangle")}>Triangle</button>
        <button onClick={() => addNode("square")}>Square</button>
        <button onClick={() => setIsConnecting(!isConnecting)}>
          {isConnecting ? "Stop Connecting" : "Start Connecting"}
        </button>
      </div>

      <div>
        <button onClick={copyToClipboard}>Copy Mind Map 📋</button>

        <Stage
          width={window.innerWidth - 150}
          height={window.innerHeight}
          ref={stageRef}
        >
          <Layer>
            {connections.map((conn, index) => {
              const fromNode = nodes.find((n) => n.id === conn.from);
              const toNode = nodes.find((n) => n.id === conn.to);
              return fromNode && toNode ? (
                <Line
                  key={index}
                  points={[fromNode.x, fromNode.y, toNode.x, toNode.y]}
                  stroke="black"
                  strokeWidth={2}
                />
              ) : null;
            })}

            {nodes.map((node) => (
              <Group
                key={node.id}
                x={node.x}
                y={node.y}
                draggable
                onDragMove={(e) => handleDragMove(e, node.id)}
              >
                {node.shape === "rect" && (
                  <Rect
                    width={100}
                    height={50}
                    fill="lightblue"
                    shadowBlur={5}
                  />
                )}
                {node.shape === "circle" && (
                  <Circle radius={40} fill="lightblue" shadowBlur={5} />
                )}
                {node.shape === "triangle" && (
                  <Line
                    points={[0, 50, 50, 0, 100, 50]}
                    fill="lightblue"
                    closed
                    shadowBlur={5}
                  />
                )}
                {node.shape === "square" && (
                  <Rect
                    width={80}
                    height={80}
                    fill="lightblue"
                    shadowBlur={5}
                  />
                )}

                <Text
                  text={node.text}
                  fontSize={16}
                  fill="black"
                  onDblClick={() => handleTextChange(node.id)}
                />
                <Text
                  text="+"
                  fontSize={20}
                  fill="red"
                  x={node.shape === "circle" ? -8 : 40}
                  y={node.shape === "circle" ? -10 : 15}
                  width={20}
                  height={20}
                  align="center"
                  verticalAlign="middle"
                  onClick={() => handleTextChange(node.id)}
                />
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Canvas Section */}
    </div>
  );
};

export default MindMap;
