'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as go from 'gojs';

interface Member {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  posX?: number | null;
  posY?: number | null;
  title?: string | null;
  photoUrl?: string | null;
}

interface Relationship {
  fromMemberId: string;
  toMemberId: string;
  relationshipType: 'PARENT' | 'SPOUSE';
}

interface Props {
  members: Member[];
  relationships: Relationship[];
  onLinkDrawn?: (from: string, to: string) => void;
  onAddChild?: (parentId: string) => void;
  onDeleteMember?: (id: string) => void;
  onMemberUpdated?: (id: string, details: { name?: string; title?: string }) => void;
  onUploadPhoto?: (id: string, file: File) => void;
  onViewPhoto?: (url: string, name: string) => void;
  readOnly?: boolean;
}

export interface FamilyTreeRef {
  getPositions: () => { id: string; posX: number; posY: number }[];
}

const FamilyTree = forwardRef<FamilyTreeRef, Props>(({ 
  members, 
  relationships, 
  onLinkDrawn, 
  onAddChild,
  onDeleteMember,
  onMemberUpdated,
  onUploadPhoto,
  onViewPhoto,
  readOnly = false
}, ref) => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const diagramInstance = useRef<go.Diagram | null>(null);
  
  // Use refs for handlers to keep the initialization useEffect stable
  const handlersRef = useRef({ onLinkDrawn, onAddChild, onDeleteMember, onMemberUpdated, onUploadPhoto, onViewPhoto });
  useEffect(() => {
    handlersRef.current = { onLinkDrawn, onAddChild, onDeleteMember, onMemberUpdated, onUploadPhoto, onViewPhoto };
  }, [onLinkDrawn, onAddChild, onDeleteMember, onMemberUpdated, onUploadPhoto, onViewPhoto]);

  // For Photo Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeMemberIdRef = useRef<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log(`[DIAGRAM] File selected: ${file?.name} for member: ${activeMemberIdRef.current}`);
    if (file && activeMemberIdRef.current && onUploadPhoto) {
      onUploadPhoto(activeMemberIdRef.current, file);
    }
    // Reset input
    if (e.target) e.target.value = '';
  };

  // Expose getPositions to parent
  useImperativeHandle(ref, () => ({
    getPositions: () => {
      if (!diagramInstance.current) return [];
      const positions: { id: string; posX: number; posY: number }[] = [];
      diagramInstance.current.nodes.each((node) => {
        const loc = node.location;
        positions.push({
          id: node.data.key,
          posX: loc.x,
          posY: loc.y
        });
      });
      return positions;
    }
  }));

  // ONE-TIME Initialization
  useEffect(() => {
    if (!diagramRef.current) return;

    const $ = go.GraphObject.make;
    const diagram = $(go.Diagram, diagramRef.current, {
      layout: $(go.TreeLayout, { 
        angle: 90, 
        layerSpacing: 80, 
        nodeSpacing: 40,
        isInitial: true, // AKTIFKAN: Biarkan GoJS menyusun posisi awal secara otomatis
      }),
      'undoManager.isEnabled': !readOnly,
      initialContentAlignment: go.Spot.Center,
      "linkingTool.isEnabled": !readOnly,
      "draggingTool.isGridSnapEnabled": true,
      "draggingTool.isEnabled": !readOnly,
      isReadOnly: readOnly,
      "model.nodeKeyProperty": "key"
    });

    diagram.addDiagramListener("LinkDrawn", (e) => {
      const link = e.subject;
      const from = link.fromNode.data.key;
      const to = link.toNode.data.key;
      if (handlersRef.current.onLinkDrawn) handlersRef.current.onLinkDrawn(from, to);
      diagram.remove(link);
    });

    // 1. Custom Text Input Editor (For Name)
    const textEditor = new go.HTMLInfo();
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "gojs-text-editor";
    nameInput.style.border = "none";
    nameInput.style.outline = "none";
    nameInput.style.position = "absolute";
    nameInput.style.zIndex = "100";
    nameInput.style.color = "white";

    textEditor.show = (textBlock, diagram, tool) => {
      if (!(textBlock instanceof go.TextBlock)) return;
      const diagramElement = diagram.div;
      if (!diagramElement) return;

      nameInput.value = textBlock.text;
      const loc = textBlock.getDocumentPoint(go.Spot.TopLeft);
      const pos = diagram.transformDocToView(loc);

      nameInput.style.left = pos.x + "px";
      nameInput.style.top = pos.y + "px";
      nameInput.style.width = textBlock.width + "px";
      nameInput.style.height = (textBlock.height + 4) + "px";
      nameInput.style.font = textBlock.font;
      
      diagramElement.appendChild(nameInput);
      nameInput.focus();
      nameInput.select();

      // HIDE PLACEHOLDER DURING EDIT
      const placeholder = textBlock.panel?.findObject("placeholderName");
      if (placeholder) placeholder.visible = false;

      nameInput.onkeydown = (e) => {
        if (e.key === "Enter") (tool as go.TextEditingTool).acceptText(go.TextEditingTool.Enter);
        else if (e.key === "Escape") (tool as go.TextEditingTool).doCancel();
      };
    };
    textEditor.hide = (diagram) => {
      if (diagram.div && nameInput.parentNode === diagram.div) diagram.div.removeChild(nameInput);
    };
    textEditor.valueFunction = () => nameInput.value;

    // 2. Custom Dropdown Editor (For Title/Role)
    const dropdownEditor = new go.HTMLInfo();
    const titleSelect = document.createElement("select");
    titleSelect.className = "gojs-text-editor";
    titleSelect.style.border = "none";
    titleSelect.style.outline = "none";
    titleSelect.style.position = "absolute";
    titleSelect.style.zIndex = "100";
    titleSelect.style.color = "white";
    titleSelect.style.backgroundColor = "#1e293b";
    titleSelect.style.padding = "2px";
    
    // Define Options
    const roles = ["", "Anak", "Ayah", "Ibu", "Istri", "Suami", "Kakek", "Nenek", "Paman", "Bibi", "Cucu", "Saudara"];
    roles.forEach(role => {
      const opt = document.createElement("option");
      opt.value = role;
      opt.text = role === "" ? "Pilih Hubungan..." : role;
      titleSelect.add(opt);
    });

    dropdownEditor.show = (textBlock, diagram, tool) => {
      if (!(textBlock instanceof go.TextBlock)) return;
      const diagramElement = diagram.div;
      if (!diagramElement) return;

      titleSelect.value = textBlock.text;
      const loc = textBlock.getDocumentPoint(go.Spot.TopLeft);
      const pos = diagram.transformDocToView(loc);

      titleSelect.style.left = pos.x + "px";
      titleSelect.style.top = pos.y + "px";
      titleSelect.style.width = (textBlock.width + 40) + "px"; 
      titleSelect.style.height = (textBlock.height + 4) + "px";
      
      diagramElement.appendChild(titleSelect);
      titleSelect.focus();

      // HIDE PLACEHOLDER DURING EDIT
      const placeholder = textBlock.panel?.findObject("placeholderTitle");
      if (placeholder) placeholder.visible = false;

      titleSelect.onchange = () => (tool as go.TextEditingTool).acceptText(go.TextEditingTool.Tab);
      titleSelect.onkeydown = (e) => {
        if (e.key === "Enter") (tool as go.TextEditingTool).acceptText(go.TextEditingTool.Enter);
        else if (e.key === "Escape") (tool as go.TextEditingTool).doCancel();
      };
    };
    dropdownEditor.hide = (diagram) => {
      if (diagram.div && titleSelect.parentNode === diagram.div) diagram.div.removeChild(titleSelect);
    };
    dropdownEditor.valueFunction = () => titleSelect.value;

    diagram.toolManager.textEditingTool.defaultTextEditor = textEditor;
    diagram.toolManager.textEditingTool.selectsTextOnActivate = true;

    diagram.addDiagramListener("TextEdited", (e) => {
      const tb = e.subject;
      const part = tb.part;
      if (part instanceof go.Node && handlersRef.current.onMemberUpdated) {
        handlersRef.current.onMemberUpdated(part.data.key, { [tb.name]: tb.text });
      }
    });

    // Premium Node Template with improved layout to prevent overlap
    diagram.nodeTemplate = $(
      go.Node, 'Auto',
      { 
        locationSpot: go.Spot.Center,
        selectionAdorned: false, 
        isShadowed: true, 
        shadowBlur: 10,
        shadowOffset: new go.Point(0, 4),
        // Binding shadow color to selection at node level
        shadowColor: "rgba(0,0,0,0.47)",
        // DYNAMIC INTERACTION
        mouseEnter: (e, node: any) => {
          if (readOnly) return;
          node.scale = 1.02;
          node.shadowBlur = 20;
        },
        mouseLeave: (e, node: any) => {
          if (readOnly) return;
          node.scale = 1.0;
          node.shadowBlur = 10;
        }
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      new go.Binding("shadowColor", "isSelected", (s) => s ? "rgba(245, 158, 11, 0.8)" : "rgba(0,0,0,0.6)").ofObject(),
      $(go.Shape, 'RoundedRectangle', {
        parameter1: 50, 
        fill: $(go.Brush, "Linear", { 0: "#0f170f", 1: "#050a05" }),
        strokeWidth: 2, stroke: "#163a16", width: 280, height: 100
      }, 
        new go.Binding("stroke", "gender", (g) => (g === 'MALE' ? '#10b981' : '#f59e0b')),
        new go.Binding("strokeWidth", "isSelected", (s) => s ? 3 : 2).ofObject()
      ),
      $(go.Panel, "Horizontal", { padding: 12, alignment: go.Spot.Left },
        // Photo Section (Left) - interactive
        $(go.Panel, "Spot", { 
            width: 70, height: 70, margin: new go.Margin(0, 12, 0, 0),
            mouseEnter: (e, obj: any) => { if (!readOnly) obj.findObject("HOVER_CONTROLS").visible = true; },
            mouseLeave: (e, obj: any) => { if (!readOnly) obj.findObject("HOVER_CONTROLS").visible = false; }
          },
          // Profile Photo with Circular Clipping
          $(go.Panel, "Spot", { isClipping: true },
            $(go.Shape, "Circle", { width: 64, height: 64, strokeWidth: 0 }),
            $(go.Picture, {
              name: "PHOTO",
              width: 64, height: 64,
              imageStretch: go.GraphObject.Fill,
              background: "#0f172a"
            },
              new go.Binding("source", "photoUrl", (url) => {
                if (!url) return "";
                const fullUrl = url.startsWith('http') ? url : (process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '') + url;
                return fullUrl;
              }),
              new go.Binding("visible", "photoUrl", (u) => !!u)
            )
          ),
          // Fallback Avatar Icon
          $(go.Shape, {
            geometryString: "F1 M 32 30 C 37.52 30 42 25.52 42 20 C 42 14.48 37.52 10 32 10 C 26.48 10 22 14.48 22 20 C 22 25.52 26.48 30 32 30 Z M 16 54 L 16 50 C 16 43.37 21.37 38 28 38 L 36 38 C 42.63 38 48 43.37 48 50 L 48 54 L 16 54 Z",
            width: 34, height: 34, fill: "#475569", stroke: null,
          }, new go.Binding("visible", "photoUrl", (u) => !u)),

          // Hover Controls (Hidden by default)
          $(go.Panel, "Auto", {
              name: "HOVER_CONTROLS",
              visible: false,
              alignment: go.Spot.Center,
              width: 64, height: 64
            },
            $(go.Shape, "Circle", { fill: "rgba(15, 23, 42, 0.75)", stroke: null }),
            $(go.Panel, "Vertical", { padding: 2 },
              // View Button
              $(go.Panel, "Auto", {
                  margin: new go.Margin(2, 0),
                  cursor: "pointer",
                  click: (e, obj: any) => {
                    const data = obj.part.data;
                    if (data.photoUrl) {
                      const fullUrl = data.photoUrl.startsWith('http') ? data.photoUrl : (process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '') + data.photoUrl;
                      handlersRef.current.onViewPhoto?.(fullUrl, data.name);
                    }
                  }
                },
                new go.Binding("visible", "photoUrl", (u) => !!u),
                $(go.Shape, "Circle", { parameter1: 15, fill: "#10b981", stroke: null, height: 26, width: 34 }),
                $(go.Shape, {
                  geometryString: "F M 0 8 C 0 8 4 0 10 0 C 16 0 20 8 20 8 C 20 8 16 16 10 16 C 4 16 0 8 0 8 Z M 10 12 C 12.209 12 14 10.209 14 8 C 14 5.791 12.209 4 10 4 C 7.791 4 6 5.791 6 8 C 6 10.209 7.791 12 10 12 Z",
                  width: 14, height: 11, fill: "#050a05", stroke: null
                })
              ),
              // Change Button
              $(go.Panel, "Auto", {
                  margin: new go.Margin(2, 0),
                  cursor: "pointer",
                  click: (e, obj: any) => {
                    activeMemberIdRef.current = obj.part.data.key;
                    fileInputRef.current?.click();
                  }
                },
                $(go.Shape, "RoundedRectangle", { parameter1: 15, fill: "#334155", stroke: null, height: 26, width: 34 }),
                $(go.Shape, {
                  geometryString: "F M 2 5 a 2 2 0 0 1 2 -2 h 2 a 1 1 0 0 0 1 -1 h 6 a 1 1 0 0 0 1 1 h 2 a 2 2 0 0 1 2 2 v 9 a 2 2 0 0 1 -2 2 h -12 a 2 2 0 0 1 -2 -2 Z M 10 13 a 3 3 0 1 0 0 -6 a 3 3 0 1 0 0 6",
                  width: 14, height: 12, fill: "white", stroke: null
                })
              )
            )
          )
        ),
        // Info Section (Right)
        $(go.Panel, "Vertical", { alignment: go.Spot.Left, width: 180, margin: new go.Margin(0, 0, 0, 12) },
          // Name Section with Placeholder
          $(go.Panel, "Spot", { 
            alignment: go.Spot.Left,
            cursor: "text"
          },
            // Transparent foundation to prevent collapsing
            $(go.Shape, "Rectangle", { fill: "transparent", stroke: null, width: 170, height: 22 }),
            $(go.TextBlock, "John Doe", { 
              name: "placeholderName", // ADDED NAME
              stroke: '#64748b', font: 'italic 16px sans-serif',
              visible: false 
            }, new go.Binding("visible", "name", (n) => n === "New Member")),
            $(go.TextBlock, {
              name: "name", stroke: 'white', font: 'bold 16px sans-serif', 
              maxLines: 1, overflow: go.TextBlock.OverflowEllipsis,
              editable: !readOnly, isMultiline: false,
              desiredSize: new go.Size(170, 22),
              textEditor: textEditor, // Explicitly use text input editor
              textValidation: (tb, oldstr, newstr) => newstr.length > 0
            }, new go.Binding('text', 'name', (n) => n === 'New Member' ? '' : n).makeTwoWay((n) => n || 'New Member'))
          ),
          // Title Section with Placeholder
          $(go.Panel, "Spot", { 
            alignment: go.Spot.Left, 
            margin: new go.Margin(4, 0, 8, 0),
            cursor: "text"
          },
            // Transparent foundation to prevent collapsing
            $(go.Shape, "Rectangle", { fill: "transparent", stroke: null, width: 170, height: 16 }),
            $(go.TextBlock, "Pilih Hubungan...", { 
              name: "placeholderTitle",
              stroke: '#64748b', font: 'italic 11px sans-serif',
              visible: false 
            }, new go.Binding("visible", "title", (t) => !t || t === '')),
            $(go.TextBlock, {
              name: "title", stroke: '#94a3b8', font: '11px sans-serif', 
              editable: !readOnly, isMultiline: false,
              desiredSize: new go.Size(170, 16),
              background: "transparent",
              textEditor: dropdownEditor // Explicitly use dropdown editor
            }, new go.Binding('text', 'title', (t) => t || '').makeTwoWay())
          ),
          $(go.Panel, "Horizontal", { visible: !readOnly }, // HIDE BUTTONS IN READ ONLY
            $(go.Panel, "Auto", { cursor: "pointer", click: (e, obj: any) => handlersRef.current.onAddChild?.(obj.part.data.key) },
              $(go.Shape, "RoundedRectangle", { parameter1: 4, fill: "#334155", stroke: null, height: 20, width: 45 }),
              $(go.TextBlock, "+ Add", { stroke: "white", font: "bold 9px sans-serif" })
            ),
            $(go.Panel, "Auto", { margin: new go.Margin(0, 0, 0, 8), cursor: "pointer", click: (e, obj: any) => handlersRef.current.onDeleteMember?.(obj.part.data.key) },
              $(go.Shape, "RoundedRectangle", { parameter1: 4, fill: "#451a1a", stroke: null, height: 20, width: 45 }),
              $(go.TextBlock, "Del", { stroke: "#f87171", font: "bold 9px sans-serif" })
            )
          )
        )
      )
    );

    // 1. PARENT-CHILD LINK (Default)
    diagram.linkTemplateMap.add("", 
      $(go.Link, { 
        routing: go.Link.AvoidsNodes, // Lebih cerdas menghindari tabrakan kotak
        curve: go.Link.JumpOver,      // Melompati garis horizontal lain agar tidak bingung
        corner: 15, 
        reshapable: true,            // AKTIFKAN: Garis bisa ditarik/diubah posisinya
        resegmentable: true,         // AKTIFKAN: Bisa dipatahkan jadi banyak segmen
        selectionAdorned: false,
        toShortLength: 4 
      },
      $(go.Shape, { strokeWidth: 2.5, stroke: '#4d7c0f' }),
      $(go.Shape, { toArrow: 'Standard', stroke: null, fill: '#4d7c0f', scale: 1.2 })
    ));

    // 2. SPOUSE LINK (Horizontal / Different Styling)
    diagram.linkTemplateMap.add("SPOUSE", 
      $(go.Link, { 
        routing: go.Link.AvoidsNodes, 
        reshapable: true,
        resegmentable: true,
        selectionAdorned: false,
      },
      $(go.Shape, { strokeWidth: 3, stroke: '#f59e0b', strokeDashArray: [6, 3] }),
      $(go.TextBlock, "SPOUSE", { segmentOffset: new go.Point(0, -10), font: "bold 8px sans-serif", stroke: "#f59e0b", opacity: 0.6 })
    ));

    diagramInstance.current = diagram;
    diagram.model = new go.GraphLinksModel([], []);

    return () => { diagram.div = null; };
  }, []); // Run ONLY once on mount

  // DATA SYNC Effect
  useEffect(() => {
    if (!diagramInstance.current) {
      console.log("[DIAGRAM] Sync deferred: diagram not initialized");
      return;
    }

    try {
      const nodeData = members.map((m) => ({
        key: m.id,
        name: m.name,
        gender: m.gender,
        title: m.title,
        photoUrl: m.photoUrl,
        loc: (m.posX !== null && m.posY !== null && m.posX !== undefined && m.posY !== undefined && !isNaN(Number(m.posX)) && !isNaN(Number(m.posY))) 
          ? `${m.posX} ${m.posY}` 
          : undefined
      }));

      const linkData = relationships.map((r) => ({
        from: r.fromMemberId,
        to: r.toMemberId,
        category: r.relationshipType === 'SPOUSE' ? 'SPOUSE' : ''
      }));

      console.log(`[DIAGRAM] Syncing data: ${nodeData.length} nodes, ${linkData.length} links`);

      const model = diagramInstance.current.model as go.GraphLinksModel;
      
      const storeKeys = new Set(nodeData.map(d => d.key));
      const diagramKeys = new Set(model.nodeDataArray.map(d => d.key));
      
      const isStructureDifferent = 
        storeKeys.size !== diagramKeys.size || 
        [...storeKeys].some(key => !diagramKeys.has(key)) ||
        model.linkDataArray.length !== linkData.length;

      if (isStructureDifferent) {
        console.log("[DIAGRAM] Structure change detected, replacing model");
        diagramInstance.current.model = new go.GraphLinksModel(nodeData, linkData);
      } else {
        const isEditing = diagramInstance.current.currentTool instanceof go.TextEditingTool;
        if (isEditing) return;

        diagramInstance.current.skipsUndoManager = true;
        diagramInstance.current.startTransaction("sync");
        nodeData.forEach(newData => {
          const existing = model.findNodeDataForKey(newData.key);
          if (existing) {
            if (existing.name !== newData.name) model.setDataProperty(existing, "name", newData.name);
            if (existing.title !== newData.title) model.setDataProperty(existing, "title", newData.title);
            if (existing.loc !== newData.loc) model.setDataProperty(existing, "loc", newData.loc);
            if (existing.photoUrl !== newData.photoUrl) model.setDataProperty(existing, "photoUrl", newData.photoUrl);
          }
        });
        diagramInstance.current.commitTransaction("sync");
        diagramInstance.current.skipsUndoManager = false;
      }
    } catch (err) {
      console.error("[DIAGRAM] Error during data sync:", err);
    }
  }, [members, relationships]);

  return (
    <div className="w-full h-full relative">
      <div 
        ref={diagramRef} 
        className="w-full h-full bg-[#050a05] rounded-3xl overflow-hidden shadow-inner" 
      />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }} 
      />
    </div>
  );
});

FamilyTree.displayName = 'FamilyTree';

export default FamilyTree;
