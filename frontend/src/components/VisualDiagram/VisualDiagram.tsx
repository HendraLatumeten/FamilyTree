'use client';

import React, { useEffect, useRef } from 'react';
import Diagram from 'diagram-js';
import SelectionModule from 'diagram-js/lib/features/selection';
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';
import MoveModule from 'diagram-js/lib/features/move';
import ModelingModule from 'diagram-js/lib/features/modeling';
import TooltipsModule from 'diagram-js/lib/features/tooltips';
import PaletteModule from 'diagram-js/lib/features/palette';
import ContextPadModule from 'diagram-js/lib/features/context-pad';
import ConnectModule from 'diagram-js/lib/features/connect';
import CreateModule from 'diagram-js/lib/features/create';
import BendpointsModule from 'diagram-js/lib/features/bendpoints';
import DirectEditingModule from 'diagram-js-direct-editing';
import SnappingModule from 'diagram-js/lib/features/snapping';
import CroppingConnectionDocking from 'diagram-js/lib/layout/CroppingConnectionDocking';

import VisualRenderer from './VisualRenderer';
import VisualPaletteProvider from './VisualPaletteProvider';
import VisualContextPadProvider from './VisualContextPad';
import VisualDirectEditingProvider from './VisualDirectEditingProvider';

import 'diagram-js/assets/diagram-js.css';
import './VisualDiagram.css';

export default function VisualDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Create a FRESH dynamic sub-container for this specific instance
    const subContainer = document.createElement('div');
    subContainer.style.width = '100%';
    subContainer.style.height = '100%';
    containerRef.current.appendChild(subContainer);

    const diagram = new Diagram({
      canvas: {
        container: subContainer
      },
      modules: [
        SelectionModule,
        ZoomScrollModule,
        MoveModule,
        ModelingModule,
        TooltipsModule,
        PaletteModule,
        ContextPadModule,
        ConnectModule,
        CreateModule,
        BendpointsModule,
        DirectEditingModule,
        SnappingModule,
        {
          __init__: [
            'visualRenderer',
            'visualPaletteProvider',
            'visualContextPadProvider',
            'visualDirectEditingProvider',
            'connectionDocking'
          ],
          visualRenderer: ['type', VisualRenderer],
          visualPaletteProvider: ['type', VisualPaletteProvider],
          visualContextPadProvider: ['type', VisualContextPadProvider],
          visualDirectEditingProvider: ['type', VisualDirectEditingProvider],
          connectionDocking: ['type', CroppingConnectionDocking]
        }
      ]
    });

    diagramRef.current = diagram;

    const canvas = diagram.get('canvas') as any;
    const elementFactory = diagram.get('elementFactory') as any;
    const modeling = diagram.get('modeling') as any;

    // Helper to create members
    const createMember = (id: string, name: string) => {
      return elementFactory.createShape({
        id, type: 'person', width: 120, height: 140, name 
      });
    };

    const root = canvas.getRootElement();

    // 4 GENERATIONS PEDIGREE LAYOUT
    // Level 3: Great Grandparents (8 nodes)
    const ggp = [
      createMember('ggp1', 'GGP 1'), createMember('ggp2', 'GGP 2'),
      createMember('ggp3', 'GGP 3'), createMember('ggp4', 'GGP 4'),
      createMember('ggp5', 'GGP 5'), createMember('ggp6', 'GGP 6'),
      createMember('ggp7', 'GGP 7'), createMember('ggp8', 'GGP 8')
    ];

    // Level 2: Grandparents (4 nodes)
    const gp = [
      createMember('gp1', 'GP 1'), createMember('gp2', 'GP 2'),
      createMember('gp3', 'GP 3'), createMember('gp4', 'GP 4')
    ];

    // Level 1: Parents (2 nodes)
    const p = [
      createMember('p1', 'Parent 1'), createMember('p2', 'Parent 2')
    ];

    // Level 0: Individual
    const individual = createMember('ind', 'Individual');

    // Create Shapes with Positioning - SIGNIFICANTLY INCREASED SPACING
    const Y_LEVELS = [700, 500, 300, 100];
    const X_GAP = 220;
    const X_OFFSET = 50;

    // Place GGP
    ggp.forEach((node, i) => modeling.createShape(node, { x: X_OFFSET + i * X_GAP, y: Y_LEVELS[3] }, root));
    // Place GP
    gp.forEach((node, i) => modeling.createShape(node, { x: X_OFFSET + 110 + i * X_GAP * 2, y: Y_LEVELS[2] }, root));
    // Place Parents
    p.forEach((node, i) => modeling.createShape(node, { x: X_OFFSET + 330 + i * X_GAP * 4, y: Y_LEVELS[1] }, root));
    // Place Individual
    modeling.createShape(individual, { x: X_OFFSET + 770, y: Y_LEVELS[0] }, root);

    // Orthogonal Connections
    const connect = (source: any, target: any) => {
       modeling.connect(source, target, {
         waypoints: [
           { x: source.x + source.width / 2, y: source.y + 110 },
           { x: source.x + source.width / 2, y: (source.y + target.y) / 1.8 },
           { x: target.x + target.width / 2, y: (source.y + target.y) / 1.8 },
           { x: target.x + target.width / 2, y: target.y }
         ]
       });
    };

    // Connect Parents to Individual
    connect(p[0], individual); connect(p[1], individual);
    // Connect GP to Parents
    connect(gp[0], p[0]); connect(gp[1], p[0]);
    connect(gp[2], p[1]); connect(gp[3], p[1]);
    // Connect GGP to GP
    connect(ggp[0], gp[0]); connect(ggp[1], gp[0]);
    connect(ggp[2], gp[1]); connect(ggp[3], gp[1]);
    connect(ggp[4], gp[2]); connect(ggp[5], gp[2]);
    connect(ggp[6], gp[3]); connect(ggp[7], gp[3]);

    // ADD HIERARCHY LABELS (As seen in screenshot)
    const createLabel = (text: string, y: number) => {
      const label = elementFactory.createShape({
        type: 'label', width: 200, height: 30, name: text
      });
      modeling.createShape(label, { x: 660, y: y - 50 }, root);
    };

    createLabel('Great Grandparents', Y_LEVELS[3]);
    createLabel('Grandparents', Y_LEVELS[2]);
    createLabel('Parents', Y_LEVELS[1]);

    return () => {
      // 2. Destroy diagram AND remove the specific dynamic container
      diagram.destroy();
      if (containerRef.current && containerRef.current.contains(subContainer)) {
        containerRef.current.removeChild(subContainer);
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
      <div className="flex-1" ref={containerRef}></div>
      
      {/* Visual Paradigm Mock Interface Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button 
          onClick={() => diagramRef.current.get('zoomScroll').stepZoom(1)}
          className="w-10 h-10 bg-white border border-slate-200 rounded-lg shadow-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          +
        </button>
        <button 
          onClick={() => diagramRef.current.get('zoomScroll').stepZoom(-1)}
          className="w-10 h-10 bg-white border border-slate-200 rounded-lg shadow-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          -
        </button>
      </div>

      {/* Legend / Status Overlay */}
      <div className="absolute bottom-4 left-4 p-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm text-xs text-slate-500 font-medium">
        Powered by <span className="text-indigo-600 font-bold">diagram-js</span> • Visual Paradigm Style Mockup
      </div>
    </div>
  );
}
