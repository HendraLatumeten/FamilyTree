import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';

export default class VisualRenderer extends BaseRenderer {
  constructor(eventBus: any) {
    super(eventBus, 2000);
  }

  canRender(element: any) {
    return true;
  }

  drawShape(parent: any, element: any): SVGElement {
    if (element.type !== 'person') {
       return svgCreate('rect'); 
    }

    // 0. Invisible Hit Box (For correct selection outlines)
    const hitBox = svgCreate('rect');
    svgAttr(hitBox, {
      width: element.width,
      height: element.height,
      fill: 'none',
      pointerEvents: 'all'
    });
    svgAppend(parent, hitBox);

    // 1. Avatar Circle (Top Focus)
    const avatarGroup = svgCreate('g');
    svgAttr(avatarGroup, { transform: `translate(${element.width / 2}, 45)` });
    
    const bgCircle = svgCreate('circle');
    svgAttr(bgCircle, { r: 40, fill: '#f1f5f9', stroke: '#e2e8f0', strokeWidth: 2 });
    svgAppend(avatarGroup, bgCircle);

    const iconPath = svgCreate('path');
    svgAttr(iconPath, {
      d: 'M 0 -15 C 6 -15 11 -10 11 -4 C 11 2 6 7 0 7 C -6 7 -11 2 -11 -4 C -11 -10 -6 -15 0 -15 Z M 0 10 C 15 10 24 18 24 28 L -24 28 C -24 18 -15 10 0 10 Z',
      fill: '#94a3b8'
    });
    svgAppend(avatarGroup, iconPath);
    svgAppend(parent, avatarGroup);

    // 2. Dark Label Box (Below Avatar)
    const labelBox = svgCreate('rect');
    svgAttr(labelBox, {
      x: 10,
      y: 95,
      width: element.width - 20,
      height: 35,
      rx: 4,
      ry: 4,
      fill: '#334155'
    });
    svgAppend(parent, labelBox);

    // 3. Name Label (White Text)
    const name = svgCreate('text');
    svgAttr(name, {
      x: element.width / 2,
      y: 117,
      textAnchor: 'middle',
      fontWeight: '500',
      fontSize: 12,
      fill: '#ffffff',
      fontFamily: 'Inter, system-ui, sans-serif'
    });
    name.textContent = element.name || 'Title/Name';
    svgAppend(parent, name);

    return hitBox; // Return hitBox so selection surrounds everything
  }

  drawConnection(parent: any, element: any) {
    const { waypoints } = element;
    const pathData = waypoints
      .map((w: any, index: number) => (index === 0 ? `M ${w.x} ${w.y}` : `L ${w.x} ${w.y}`))
      .join(' ');

    const connection = svgCreate('path');
    svgAttr(connection, {
      d: pathData,
      stroke: '#334155', // Slate-700
      strokeWidth: 1.5,
      fill: 'none'
    });
    svgAppend(parent, connection);
    return connection;
  }

  getShapePath(element: any) {
    const x = element.x, y = element.y, w = element.width, h = element.height;
    // Bounding box for the entire composite (Circle + Box)
    return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  }


  getConnectionPath(connection: any) {
    const { waypoints } = connection;
    let path = '';
    waypoints.forEach((w: any, i: number) => {
      path += (i === 0 ? 'M ' : 'L ') + w.x + ' ' + w.y;
    });
    return path;
  }
}

(VisualRenderer as any).$inject = ['eventBus'];
