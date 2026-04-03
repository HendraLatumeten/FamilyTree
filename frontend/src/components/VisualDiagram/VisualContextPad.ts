import {
  assign
} from 'min-dash';

export default class VisualContextPadProvider {
  private _contextPad: any;
  private _modeling: any;
  private _elementFactory: any;
  private _connect: any;
  private _create: any;
  private _canvas: any;

  constructor(contextPad: any, modeling: any, elementFactory: any, connect: any, create: any, canvas: any) {
    contextPad.registerProvider(this);

    this._contextPad = contextPad;
    this._modeling = modeling;
    this._elementFactory = elementFactory;
    this._connect = connect;
    this._create = create;
    this._canvas = canvas;
  }

  getContextPadEntries(element: any) {
    const {
      _modeling: modeling,
      _elementFactory: elementFactory,
      _connect: connect,
      _create: create,
      _canvas: canvas
    } = this;

    function removeElement() {
      modeling.removeElements([element]);
    }

    function startConnect(event: any) {
      connect.start(event, element);
    }

    function appendPerson(event: any) {
      const shape = elementFactory.createShape({
        type: 'person',
        width: 140,
        height: 160,
        name: 'New Member',
        title: 'Title/Dates'
      });

      create.start(event, shape, {
        source: element
      });
    }

    return {
      'delete': {
        group: 'edit',
        className: 'context-pad-icon-delete',
        title: 'Delete',
        action: {
          click: removeElement
        }
      },
      'connect': {
        group: 'connect',
        className: 'context-pad-icon-connect',
        title: 'Connect',
        action: {
          click: startConnect,
          dragstart: startConnect
        }
      },
      'append': {
        group: 'model',
        className: 'context-pad-icon-append',
        title: 'Append Member',
        action: {
          click: appendPerson,
          dragstart: appendPerson
        }
      }
    };
  }
}

(VisualContextPadProvider as any).$inject = [
  'contextPad',
  'modeling',
  'elementFactory',
  'connect',
  'create',
  'canvas'
];
