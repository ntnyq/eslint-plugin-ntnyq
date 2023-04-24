export class Test {
  x: number

  constructor(x: number) {
    this.x = x
  }

  get internalValue() {
    return this.x
  }

  set internalValue(value: number) {
    this.x = value
  }

  square(): number {
    return this.x * this.x
  }

  half(): number {
    return this.x / 2
  }
}
