declare const test: {
  only: (name: string, fn: () => void) => void
}

export class Test {
  private x: number

  public constructor(x: number) {
    this.x = x
  }

  protected get internalValue() {
    return this.x
  }

  protected set internalValue(value: number) {
    this.x = value
  }

  public square(): number {
    return this.x * this.x
  }

  private half(): number {
    return this.x / 2
  }
}

test.only('focused test should fail', () => {})
