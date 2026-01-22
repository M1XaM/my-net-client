import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  connections: number[];
  pulsePhase: number;
}

interface GraphBackgroundProps {
  nodeCount?: number;
  className?: string;
}

const GraphBackground: React.FC<GraphBackgroundProps> = ({ 
  nodeCount = 50,
  className = "" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize nodes
    const initNodes = () => {
      const nodes: Node[] = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          connections: [],
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }

      // Create connections (each node connects to 2-4 nearby nodes)
      nodes.forEach((node, i) => {
        const distances: { index: number; dist: number }[] = [];
        nodes.forEach((other, j) => {
          if (i !== j) {
            const dist = Math.hypot(node.x - other.x, node.y - other.y);
            distances.push({ index: j, dist });
          }
        });
        distances.sort((a, b) => a.dist - b.dist);
        const connectionCount = Math.floor(Math.random() * 3) + 2;
        node.connections = distances.slice(0, connectionCount).map(d => d.index);
      });

      nodesRef.current = nodes;
    };

    initNodes();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      const time = Date.now() * 0.001;

      // Update and draw nodes
      nodes.forEach((node) => {
        // Mouse interaction - nodes are gently attracted to mouse
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 200 && dist > 0) {
          const force = (200 - dist) / 200 * 0.02;
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }

        // Apply velocity with damping
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.99;
        node.vy *= 0.99;

        // Boundary bounce
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        // Draw connections
        node.connections.forEach(j => {
          const other = nodes[j];
          const lineDist = Math.hypot(node.x - other.x, node.y - other.y);
          if (lineDist < 200) {
            const alpha = (1 - lineDist / 200) * 0.3;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            
            // Create gradient for line
            const gradient = ctx.createLinearGradient(node.x, node.y, other.x, other.y);
            gradient.addColorStop(0, `rgba(123, 97, 255, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(147, 130, 255, ${alpha * 1.5})`);
            gradient.addColorStop(1, `rgba(123, 97, 255, ${alpha})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Draw node with pulse effect
        const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.5 + 0.5;
        const glowRadius = node.radius + pulse * 3;

        // Glow effect
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, glowRadius * 3
        );
        gradient.addColorStop(0, `rgba(123, 97, 255, ${0.8 * pulse})`);
        gradient.addColorStop(0.5, `rgba(123, 97, 255, ${0.3 * pulse})`);
        gradient.addColorStop(1, 'rgba(123, 97, 255, 0)');

        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 130, 255, ${0.8 + pulse * 0.2})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodeCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default GraphBackground;
