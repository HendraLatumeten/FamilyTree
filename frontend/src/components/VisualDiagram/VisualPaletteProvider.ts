import {
  assign
} from 'min-dash';

export default class VisualPaletteProvider {
  private _palette: any;
  private _create: any;
  private _elementFactory: any;

  constructor(palette: any, create: any, elementFactory: any) {
    palette.registerProvider(this);

    this._palette = palette;
    this._create = create;
    this._elementFactory = elementFactory;
  }

  getPaletteEntries(element: any) {
    const {
      _create: create,
      _elementFactory: elementFactory
    } = this;

    function createAction(type: string, group: string, className: string, title: string, options?: any) {
      function createListener(event: any) {
        const shape = elementFactory.createShape(assign({
          type,
          width: 140,
          height: 160,
          name: 'New Member',
          title: 'Title/Dates'
        }, options));

        create.start(event, shape);
      }

      return {
        group,
        className,
        title,
        action: {
          dragstart: createListener,
          click: createListener
        }
      };
    }

    return {
      'create-person': createAction(
        'person',
        'create',
        'visual-icon-person',
        'Add Member'
      ),
      'create-spacer': {
        group: 'tools',
        separator: true
      }
    };
  }
}

(VisualPaletteProvider as any).$inject = [
  'palette',
  'create',
  'elementFactory'
];
