import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  X, Square, Circle, Diamond, User, Minus, Type, Send, Trash2, RotateCcw, 
  Database, Cloud, HardDrive, Download, Grid, ZoomIn, ZoomOut,
  Lock, Unlock, Copy, Clipboard, Hexagon, Triangle
} from 'lucide-react';

interface CanvasElement {
  id: string;
  type: 'rect' | 'ellipse' | 'diamond' | 'actor' | 'line' | 'text' | 'database' | 'cloud' | 'server' | 'cylinder' | 'hexagon' | 'triangle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  endX?: number;
  endY?: number;
  text?: string;
  color: string;
  locked?: boolean;
  strokeWidth?: number;
  dashArray?: number[];
}

interface DiagramCanvasProps {
  onClose: () => void;
  onSend: (imageData: string, imageType: 'image') => void;
  selectedUser: { username: string } | null;
}

const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ onClose, onSend, selectedUser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [currentTool, setCurrentTool] = useState<CanvasElement['type'] | 'select'>('select');
  const [currentColor, setCurrentColor] = useState('#2563EB');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [redoStack, setRedoStack] = useState<CanvasElement[][]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed'>('solid');
  const [copiedElement, setCopiedElement] = useState<CanvasElement | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const GRID_SIZE = 20;

  const snapToGridPoint = (value: number) => {
    return snapToGrid ? Math.round(value / GRID_SIZE) * GRID_SIZE : value;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    redrawCanvas();
  }, [elements, showGrid, zoom, panOffset]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'z':
            e.preventDefault();
            handleUndo();
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 'c':
            if (selectedElement) {
              e.preventDefault();
              handleCopy();
            }
            break;
          case 'v':
            if (copiedElement) {
              e.preventDefault();
              handlePaste();
            }
            break;
          case 'a':
            e.preventDefault();
            setSelectedElement(elements[elements.length - 1]?.id || null);
            break;
        }
      }
      if (e.key === 'Delete' && selectedElement) {
        handleDelete();
      }
      if (e.key === 'Escape') {
        setSelectedElement(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, copiedElement, elements]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(-panOffset.x / zoom, -panOffset.y / zoom, rect.width / zoom, rect.height / zoom);

    if (showGrid) {
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 0.5;
      
      const startX = Math.floor((-panOffset.x / zoom) / GRID_SIZE) * GRID_SIZE;
      const startY = Math.floor((-panOffset.y / zoom) / GRID_SIZE) * GRID_SIZE;
      const endX = startX + (rect.width / zoom) + GRID_SIZE;
      const endY = startY + (rect.height / zoom) + GRID_SIZE;

      for (let i = startX; i < endX; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, startY);
        ctx.lineTo(i, endY);
        ctx.stroke();
      }
      for (let i = startY; i < endY; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(startX, i);
        ctx.lineTo(endX, i);
        ctx.stroke();
      }
    }

    elements.forEach(element => {
      ctx.save();
      
      const isSelected = element.id === selectedElement;
      ctx.fillStyle = element.color;
      ctx.strokeStyle = isSelected ? '#DC2626' : '#1E293B';
      ctx.lineWidth = element.strokeWidth || strokeWidth;

      if (element.dashArray) {
        ctx.setLineDash(element.dashArray);
      }

      if (isSelected) {
        ctx.shadowColor = 'rgba(220, 38, 38, 0.3)';
        ctx.shadowBlur = 8;
      }

      drawShape(ctx, element, isSelected);
      
      ctx.restore();
    });

    ctx.restore();
  }, [elements, showGrid, zoom, panOffset, selectedElement, strokeWidth]);

  const drawShape = (ctx: CanvasRenderingContext2D, element: CanvasElement, _isSelected: boolean) => {
    switch (element.type) {
      case 'rect':
        ctx.fillRect(element.x, element.y, element.width!, element.height!);
        ctx.strokeRect(element.x, element.y, element.width!, element.height!);
        break;

      case 'ellipse':
        ctx.beginPath();
        ctx.ellipse(
          element.x + element.width! / 2,
          element.y + element.height! / 2,
          element.width! / 2,
          element.height! / 2,
          0, 0, 2 * Math.PI
        );
        ctx.fill();
        ctx.stroke();
        break;

      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(element.x + element.width! / 2, element.y);
        ctx.lineTo(element.x + element.width!, element.y + element.height! / 2);
        ctx.lineTo(element.x + element.width! / 2, element.y + element.height!);
        ctx.lineTo(element.x, element.y + element.height! / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'hexagon':
        const hexW = element.width! / 4;
        ctx.beginPath();
        ctx.moveTo(element.x + hexW, element.y);
        ctx.lineTo(element.x + element.width! - hexW, element.y);
        ctx.lineTo(element.x + element.width!, element.y + element.height! / 2);
        ctx.lineTo(element.x + element.width! - hexW, element.y + element.height!);
        ctx.lineTo(element.x + hexW, element.y + element.height!);
        ctx.lineTo(element.x, element.y + element.height! / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(element.x + element.width! / 2, element.y);
        ctx.lineTo(element.x + element.width!, element.y + element.height!);
        ctx.lineTo(element.x, element.y + element.height!);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'database':
        const dbHeight = element.height! * 0.15;
        ctx.beginPath();
        ctx.ellipse(element.x + element.width! / 2, element.y + dbHeight / 2, element.width! / 2, dbHeight / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillRect(element.x, element.y + dbHeight / 2, element.width!, element.height! - dbHeight);
        ctx.strokeRect(element.x, element.y + dbHeight / 2, element.width!, element.height! - dbHeight);
        
        ctx.beginPath();
        ctx.ellipse(element.x + element.width! / 2, element.y + element.height! - dbHeight / 2, element.width! / 2, dbHeight / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;

      case 'cloud':
        ctx.beginPath();
        const r = element.width! / 6;
        
        ctx.arc(element.x + r * 2, element.y + element.height! / 2, r * 1.2, 0, 2 * Math.PI);
        ctx.arc(element.x + element.width! / 2, element.y + r, r * 1.5, 0, 2 * Math.PI);
        ctx.arc(element.x + element.width! - r * 2, element.y + element.height! / 2, r * 1.2, 0, 2 * Math.PI);
        ctx.arc(element.x + element.width! / 2, element.y + element.height! - r, r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;

      case 'server':
      case 'cylinder':
        const cylHeight = element.height! * 0.15;
        ctx.beginPath();
        ctx.ellipse(element.x + element.width! / 2, element.y + cylHeight / 2, element.width! / 2, cylHeight / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillRect(element.x, element.y + cylHeight / 2, element.width!, element.height! - cylHeight);
        ctx.strokeRect(element.x, element.y + cylHeight / 2, element.width!, element.height! - cylHeight);
        
        ctx.beginPath();
        ctx.ellipse(element.x + element.width! / 2, element.y + element.height! - cylHeight / 2, element.width! / 2, cylHeight / 2, 0, Math.PI, 2 * Math.PI);
        ctx.stroke();
        break;

      case 'actor':
        const centerX = element.x + element.width! / 2;
        const headRadius = element.height! / 5;
        
        ctx.beginPath();
        ctx.arc(centerX, element.y + headRadius, headRadius, 0, 2 * Math.PI);
        ctx.fillStyle = element.color;
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, element.y + headRadius * 2);
        ctx.lineTo(centerX, element.y + element.height! * 0.6);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(element.x + element.width! * 0.1, element.y + element.height! * 0.4);
        ctx.lineTo(element.x + element.width! * 0.9, element.y + element.height! * 0.4);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, element.y + element.height! * 0.6);
        ctx.lineTo(element.x + element.width! * 0.2, element.y + element.height!);
        ctx.moveTo(centerX, element.y + element.height! * 0.6);
        ctx.lineTo(element.x + element.width! * 0.8, element.y + element.height!);
        ctx.stroke();
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(element.x, element.y);
        ctx.lineTo(element.endX!, element.endY!);
        ctx.strokeStyle = element.color;
        ctx.stroke();
        
        const angle = Math.atan2(element.endY! - element.y, element.endX! - element.x);
        const arrowSize = 12;
        ctx.beginPath();
        ctx.moveTo(element.endX!, element.endY!);
        ctx.lineTo(
          element.endX! - arrowSize * Math.cos(angle - Math.PI / 6),
          element.endY! - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          element.endX! - arrowSize * Math.cos(angle + Math.PI / 6),
          element.endY! - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = element.color;
        ctx.fill();
        break;

      case 'text':
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const textMetrics = ctx.measureText(element.text || '');
        const padding = 6;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(
          element.x - padding, 
          element.y - padding, 
          textMetrics.width + padding * 2, 
          20 + padding * 2
        );
        
        ctx.fillStyle = '#0F172A';
        ctx.fillText(element.text || '', element.x, element.y);
        break;
    }
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) / zoom;
    const y = (e.clientY - rect.top - panOffset.y) / zoom;
    
    return { 
      x: snapToGridPoint(x), 
      y: snapToGridPoint(y) 
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    const { x, y } = getCanvasCoords(e);

    if (currentTool === 'select') {
      const clickedElement = elements.find(el => {
        if (el.type === 'line') {
          const buffer = 10;
          const dist = pointToLineDistance(x, y, el.x, el.y, el.endX!, el.endY!);
          return dist < buffer;
        }
        return x >= el.x && x <= el.x + (el.width || 0) &&
               y >= el.y && y <= el.y + (el.height || 0);
      });
      setSelectedElement(clickedElement?.id || null);
      return;
    }

    if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newElement: CanvasElement = {
          id: Date.now().toString(),
          type: 'text',
          x, y,
          text,
          color: currentColor,
          strokeWidth
        };
        addElement(newElement);
      }
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;
      setPanOffset({ x: panOffset.x + dx, y: panOffset.y + dy });
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing) return;
    
    const { x, y } = getCanvasCoords(e);

    redrawCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    ctx.fillStyle = currentColor + '66';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = strokeWidth;

    if (lineStyle === 'dashed') {
      ctx.setLineDash([10, 5]);
    }

    const width = x - startPos.x;
    const height = y - startPos.y;

    const previewElement: CanvasElement = {
      id: 'preview',
      type: currentTool as any,
      x: startPos.x,
      y: startPos.y,
      width: Math.abs(width),
      height: Math.abs(height),
      endX: x,
      endY: y,
      color: currentColor,
      strokeWidth
    };

    drawShape(ctx, previewElement, false);
    ctx.restore();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing) return;
    
    const { x, y } = getCanvasCoords(e);

    const width = Math.abs(x - startPos.x);
    const height = Math.abs(y - startPos.y);
    const finalX = Math.min(startPos.x, x);
    const finalY = Math.min(startPos.y, y);

    if ((currentTool !== 'line' && (width < 10 || height < 10)) ||
        (currentTool === 'line' && width < 5 && height < 5)) {
      setIsDrawing(false);
      return;
    }

    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: currentTool as any,
      x: finalX,
      y: finalY,
      width: currentTool === 'line' ? undefined : width,
      height: currentTool === 'line' ? undefined : height,
      endX: currentTool === 'line' ? x : undefined,
      endY: currentTool === 'line' ? y : undefined,
      color: currentColor,
      strokeWidth,
      dashArray: lineStyle === 'dashed' ? [10, 5] : undefined
    };

    addElement(newElement);
    setIsDrawing(false);
  };

  const pointToLineDistance = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq !== 0 ? dot / lenSq : -1;
    
    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const addElement = (element: CanvasElement) => {
    setHistory([...history, elements]);
    setRedoStack([]);
    setElements([...elements, element]);
  };

  const handleDelete = () => {
    if (selectedElement) {
      setHistory([...history, elements]);
      setRedoStack([]);
      setElements(elements.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setRedoStack([elements, ...redoStack]);
      setHistory(history.slice(0, -1));
      setElements(previousState);
      setSelectedElement(null);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      setHistory([...history, elements]);
      setRedoStack(redoStack.slice(1));
      setElements(nextState);
      setSelectedElement(null);
    }
  };

  const handleCopy = () => {
    const element = elements.find(el => el.id === selectedElement);
    if (element) {
      setCopiedElement(element);
    }
  };

  const handlePaste = () => {
    if (copiedElement) {
      const newElement: CanvasElement = {
        ...copiedElement,
        id: Date.now().toString(),
        x: copiedElement.x + 20,
        y: copiedElement.y + 20
      };
      addElement(newElement);
      setSelectedElement(newElement.id);
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear entire canvas? This cannot be undone.')) {
      setHistory([...history, elements]);
      setRedoStack([]);
      setElements([]);
      setSelectedElement(null);
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.5));
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `diagram-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  const handleSend = () => {
    const canvas = canvasRef.current;
    if (!canvas || elements.length === 0) return;

    try {
      const imageData = canvas.toDataURL('image/png', 1.0);
      onSend(imageData, 'image');
      onClose();
    } catch (error) {
      console.error('Error capturing canvas:', error);
      alert('Failed to capture diagram. Please try again.');
    }
  };

  const tools = [
    { id: 'select', icon: '→', label: 'Select (V)', emoji: true },
    { id: 'rect', icon: Square, label: 'Rectangle (R)' },
    { id: 'ellipse', icon: Circle, label: 'Ellipse (E)' },
    { id: 'diamond', icon: Diamond, label: 'Diamond (D)' },
    { id: 'hexagon', icon: Hexagon, label: 'Hexagon (H)' },
    { id: 'triangle', icon: Triangle, label: 'Triangle (T)' },
    { id: 'database', icon: Database, label: 'Database (B)' },
    { id: 'cloud', icon: Cloud, label: 'Cloud (C)' },
    { id: 'server', icon: HardDrive, label: 'Server (S)' },
    { id: 'actor', icon: User, label: 'Actor (A)' },
    { id: 'line', icon: Minus, label: 'Arrow (L)' },
    { id: 'text', icon: Type, label: 'Text (T)' },
  ];

  const colors = [
    { hex: '#2563EB', name: 'Blue' },
    { hex: '#DC2626', name: 'Red' },
    { hex: '#059669', name: 'Green' },
    { hex: '#D97706', name: 'Amber' },
    { hex: '#7C3AED', name: 'Purple' },
    { hex: '#DB2777', name: 'Pink' },
    { hex: '#0891B2', name: 'Cyan' },
    { hex: '#4B5563', name: 'Gray' },
    { hex: '#0F172A', name: 'Slate' },
    { hex: '#FFFFFF', name: 'White' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-3 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">
                UML Canvas
              </h2>
              {selectedUser && (
                <p className="text-xs text-slate-300 mt-0.5">
                  Session with {selectedUser.username}
                </p>
              )}
            </div>
            <div className="h-8 w-px bg-slate-600"></div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="font-mono">{elements.length} objects</span>
              <span>•</span>
              <span className="font-mono">{Math.round(zoom * 100)}%</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white hover:bg-slate-700 p-2 rounded-lg transition-all"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Toolbar */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between gap-3">
            
            {/* Tools Section */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 mr-2">TOOLS</span>
              <div className="flex gap-1">
                {tools.slice(0, 6).map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id as any)}
                    className={`p-1.5 rounded transition-all ${
                      currentTool === tool.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                    title={tool.label}
                  >
                    {tool.emoji ? <span className="text-sm">{tool.icon}</span> : <tool.icon size={16} />}
                  </button>
                ))}
              </div>
              <div className="h-6 w-px bg-slate-300 mx-1"></div>
              <div className="flex gap-1">
                {tools.slice(6).map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id as any)}
                    className={`p-1.5 rounded transition-all ${
                      currentTool === tool.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                    title={tool.label}
                  >
                    {tool.emoji ? <span className="text-sm">{tool.icon}</span> : <tool.icon size={16} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">COLOR</span>
              <div className="flex gap-1">
                {colors.map(color => (
                  <button
                    key={color.hex}
                    onClick={() => setCurrentColor(color.hex)}
                    className={`w-7 h-7 rounded border-2 transition-all ${
                      currentColor === color.hex
                        ? 'border-slate-900 scale-110 shadow-md'
                        : 'border-slate-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Stroke & Style */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">STROKE</span>
              <select
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
              >
                <option value={1}>1px</option>
                <option value={2}>2px</option>
                <option value={3}>3px</option>
                <option value={4}>4px</option>
                <option value={6}>6px</option>
              </select>
              <button
                onClick={() => setLineStyle(lineStyle === 'solid' ? 'dashed' : 'solid')}
                className={`px-2 py-1 text-xs rounded border transition-all ${
                  lineStyle === 'dashed'
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {lineStyle === 'solid' ? '━━━' : '- - -'}
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Toolbar */}
        <div className="px-4 py-2 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            
            {/* Edit Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="px-2 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw size={14} />
                Undo
              </button>
              
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="px-2 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                title="Redo (Ctrl+Y)"
              >
                <RotateCcw size={14} className="transform rotate-180" />
                Redo
              </button>

              <div className="h-6 w-px bg-slate-300 mx-2"></div>

              <button
                onClick={handleCopy}
                disabled={!selectedElement}
                className="px-2 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                title="Copy (Ctrl+C)"
              >
                <Copy size={14} />
                Copy
              </button>
              
              <button
                onClick={handlePaste}
                disabled={!copiedElement}
                className="px-2 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                title="Paste (Ctrl+V)"
              >
                <Clipboard size={14} />
                Paste
              </button>

              <div className="h-6 w-px bg-slate-300 mx-2"></div>
              
              <button
                onClick={handleDelete}
                disabled={!selectedElement}
                className="px-2 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                title="Delete (Del)"
              >
                <Trash2 size={14} />
                Delete
              </button>

              <button
                onClick={handleClear}
                className="px-2 py-1.5 text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 transition-all"
                title="Clear All"
              >
                Clear All
              </button>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-2 py-1.5 text-xs font-medium rounded border transition-all flex items-center gap-1.5 ${
                  showGrid
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title="Toggle Grid"
              >
                <Grid size={14} />
                Grid
              </button>

              <button
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`px-2 py-1.5 text-xs font-medium rounded border transition-all flex items-center gap-1.5 ${
                  snapToGrid
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title="Snap to Grid"
              >
                {snapToGrid ? <Lock size={14} /> : <Unlock size={14} />}
                Snap
              </button>

              <div className="h-6 w-px bg-slate-300 mx-2"></div>

              <button
                onClick={handleZoomOut}
                className="p-1.5 bg-white text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition-all"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>

              <span className="text-xs font-mono text-slate-600 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>

              <button
                onClick={handleZoomIn}
                className="p-1.5 bg-white text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition-all"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>

              <button
                onClick={() => setZoom(1)}
                className="px-2 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition-all"
                title="Reset Zoom"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden bg-slate-100 relative">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              setIsDrawing(false);
              setIsPanning(false);
            }}
            className="w-full h-full cursor-crosshair"
            style={{ cursor: isPanning ? 'grabbing' : currentTool === 'select' ? 'default' : 'crosshair' }}
          />
          
          {/* Status Overlay */}
          {selectedElement && (
            <div className="absolute bottom-4 left-4 bg-white border border-slate-300 rounded-lg shadow-lg px-3 py-2">
              <div className="text-xs text-slate-600">
                <span className="font-semibold">Selected:</span> {
                  elements.find(el => el.id === selectedElement)?.type.toUpperCase()
                }
              </div>
            </div>
          )}

          {/* Help Overlay */}
          <div className="absolute top-4 right-4 bg-slate-900 bg-opacity-90 text-white rounded-lg shadow-lg px-3 py-2 text-xs space-y-1">
            <div className="font-semibold mb-1">Shortcuts</div>
            <div className="opacity-80">Alt + Drag: Pan</div>
            <div className="opacity-80">Ctrl+Z/Y: Undo/Redo</div>
            <div className="opacity-80">Ctrl+C/V: Copy/Paste</div>
            <div className="opacity-80">Del: Delete</div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${elements.length > 0 ? 'bg-green-500' : 'bg-slate-400'}`}></div>
              <span className="font-mono">{elements.length} elements</span>
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <div>
              <span className="font-medium">Tool:</span> <span className="font-mono capitalize">{currentTool}</span>
            </div>
            {selectedElement && (
              <>
                <div className="h-4 w-px bg-slate-300"></div>
                <span className="text-orange-600 font-medium">Selected</span>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleExportPNG}
              disabled={elements.length === 0}
              className="px-4 py-2 text-sm font-medium bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Download size={16} />
              Export PNG
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSend}
              disabled={elements.length === 0}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md"
            >
              <Send size={16} />
              Send Diagram
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramCanvas;