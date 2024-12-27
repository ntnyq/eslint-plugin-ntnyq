type JoinSegment = string | null | undefined

export interface JoinOptions {
  /**
   * join separator
   */
  separator?: string
}

/**
 * Joint segments to a string
 * @param segments - segments to join
 * @param options - join options
 * @returns joined string
 */
export function join(segments: JoinSegment[], options: JoinOptions = {}) {
  return segments.filter(v => Boolean(v)).join(options.separator || '')
}
