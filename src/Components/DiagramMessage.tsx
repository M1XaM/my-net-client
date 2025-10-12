import React, { useEffect, useRef } from 'react';

interface DiagramMessageProps {
  content: string;
}

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rect' | 'ellipse' | 'diamond';
  color?: string;
}

interface Connection {
  from: string;
  to: string;
  label?: string;
  type: 'solid' | 'dashed';
}

interface DiagramData {
  nodes: Node[];
  connections: Connection[];
}

const DiagramMessage: React.FC<DiagramMessageProps> = ({ content }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const data: DiagramData = JSON.parse(content);
      
      // Set canvas size based on content
      const maxX = Math.max(...data.nodes.map(n => n.x + n.width)) + 50;
      const maxY = Math.max(...data.nodes.map(n => n.y + n.height)) + 50;
      canvas.width = Math.max(maxX, 400);
      canvas.height = Math.max(maxY, 300);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections first (so they appear behind nodes)
      data.connections.forEach(conn => {
        const fromNode = data.nodes.find(n => n.id === conn.from);
        const toNode = data.nodes.find(n => n.id === conn.to);
        if (!fromNode || !toNode) return;

        const fromX = fromNode.x + fromNode.width / 2;
        const fromY = fromNode.y + fromNode.height / 2;
        const toX = toNode.x + toNode.width / 2;
        const toY = toNode.y + toNode.height / 2;

        ctx.beginPath();
        ctx.strokeStyle = '#4B5563';
        ctx.lineWidth = 2;
        
        if (conn.type === 'dashed') {
          ctx.setLineDash([5, 5]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        // Draw arrow head
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const arrowSize = 10;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
          toX - arrowSize * Math.cos(angle - Math.PI / 6),
          toY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          toX - arrowSize * Math.cos(angle + Math.PI / 6),
          toY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = '#4B5563';
        ctx.fill();

        // Draw connection label
        if (conn.label) {
          const midX = (fromX + toX) / 2;
          const midY = (fromY + toY) / 2;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(midX - 20, midY - 10, 40, 20);
          ctx.fillStyle = '#1F2937';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(conn.label, midX, midY);
        }
      });

      // Draw nodes
      data.nodes.forEach(node => {
        ctx.fillStyle = node.color || '#3B82F6';
        ctx.strokeStyle = '#1E40AF';
        ctx.lineWidth = 2;

        // Draw shape based on type
        if (node.type === 'rect') {
          ctx.fillRect(node.x, node.y, node.width, node.height);
          ctx.strokeRect(node.x, node.y, node.width, node.height);
        } else if (node.type === 'ellipse') {
          ctx.beginPath();
          ctx.ellipse(
            node.x + node.width / 2,
            node.y + node.height / 2,
            node.width / 2,
            node.height / 2,
            0,
            0,
            2 * Math.PI
          );
          ctx.fill();
          ctx.stroke();
        } else if (node.type === 'diamond') {
          ctx.beginPath();
          ctx.moveTo(node.x + node.width / 2, node.y);
          ctx.lineTo(node.x + node.width, node.y + node.height / 2);
          ctx.lineTo(node.x + node.width / 2, node.y + node.height);
          ctx.lineTo(node.x, node.y + node.height / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Draw label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Word wrap for long labels
        const words = node.label.split(' ');
        let line = '';
        let y = node.y + node.height / 2 - 7;
        
        words.forEach(word => {
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > node.width - 10 && line !== '') {
            ctx.fillText(line, node.x + node.width / 2, y);
            line = word + ' ';
            y += 16;
          } else {
            line = testLine;
          }
        });
        ctx.fillText(line, node.x + node.width / 2, y);
      });

    } catch (error) {
      // error message
      ctx.fillStyle = '#FEE2E2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#DC2626';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Invalid diagram format', canvas.width / 2, canvas.height / 2);
    }
  }, [content]);

  return (
    <div className="diagram-container bg-white p-4 rounded-lg border border-gray-200">
      <canvas 
        ref={canvasRef} 
        className="max-w-full h-auto"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default DiagramMessage;