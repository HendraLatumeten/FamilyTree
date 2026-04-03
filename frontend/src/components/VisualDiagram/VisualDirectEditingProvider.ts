export default class VisualDirectEditingProvider {
  private _directEditing: any;
  private _modeling: any;

  constructor(directEditing: any, modeling: any) {
    directEditing.registerProvider(this);

    this._directEditing = directEditing;
    this._modeling = modeling;
  }

  activate(element: any) {
    if (element.type !== 'person') {
      return;
    }

    return {
      bounds: {
        x: element.x,
        y: element.y + 80,
        width: element.width,
        height: 40
      },
      text: element.name || '',
      options: {
        center: true
      }
    };
  }

  update(element: any, newText: string) {
    this._modeling.updateProperties(element, {
      name: newText
    });
  }
}

(VisualDirectEditingProvider as any).$inject = [
  'directEditing',
  'modeling'
];
