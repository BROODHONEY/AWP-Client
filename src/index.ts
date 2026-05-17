export interface AWPFact {
  claim: string
  type: 'text' | 'numeric' | 'boolean' | 'date'
  value?: string | number | boolean
  unit?: string
}

export interface AWPResult {
  hit: boolean
  source: 'cache' | 'web'
  topic: string
  facts: AWPFact[]
  source_url: string
  fetched_at: string
  similarity?: number
}

export interface AWPOptions {
  // URL of the AWP node to query
  node: string
  // Timeout in milliseconds (default: 30000 — web fallbacks are slow)
  timeout?: number
}

export class AWP {
  private nodeUrl: string
  private timeout: number

  constructor(options: AWPOptions) {
    // Store the node URL, strip trailing slash if present
    this.nodeUrl = options.node.replace(/\/$/, '')
    this.timeout = options.timeout ?? 30000
  }

  /**
   * Query the AWP index.
   * Returns structured facts — from cache if available, from the web if not.
   * The caller never needs to know which path was taken.
   */
  async query(question: string): Promise<AWPResult> {
    const url = `${this.nodeUrl}/query?q=${encodeURIComponent(question)}`

    const response = await fetch(url, {
      signal: AbortSignal.timeout(this.timeout),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(
        `AWP query failed: ${response.status} — ${(body as any).error ?? response.statusText}`
      )
    }

    return response.json() as Promise<AWPResult>
  }

  /**
   * Fetch a specific entry by ID.
   * Useful when you want to retrieve something you found earlier.
   */
  async getEntry(id: string): Promise<AWPResult | null> {
    const url = `${this.nodeUrl}/entry/${encodeURIComponent(id)}`

    const response = await fetch(url, {
      signal: AbortSignal.timeout(this.timeout),
    })

    if (response.status === 404) return null

    if (!response.ok) {
      throw new Error(`AWP getEntry failed: ${response.status}`)
    }

    return response.json() as Promise<AWPResult>
  }

  /**
   * Check if the AWP node is reachable.
   * Returns true if healthy, false if unreachable.
   */
  async isHealthy(): Promise<boolean> {
    try {
      const url = `${this.nodeUrl}/health`
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}