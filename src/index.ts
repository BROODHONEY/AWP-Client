const DEFAULT_NODE = 'https://awp-net.up.railway.app'

export interface AWPFact {
  claim: string
  type: 'text' | 'numeric' | 'boolean' | 'date'
  value?: string | number | boolean
  unit?: string
}

export interface AWPResult {
  hit:              boolean
  source:           'cache' | 'web'
  topic:            string
  facts:            AWPFact[]
  source_url:       string
  fetched_at:       string
  confidence:       number
  confidence_label: 'high' | 'medium' | 'low' | 'stale'
  flag_count:       number
  similarity?:      number
}

export interface AWPOptions {
  node?:    string
  timeout?: number
}

export class AWP {
  private nodeUrl: string
  private timeout: number

  constructor(options?: AWPOptions) {
    this.nodeUrl = (options?.node ?? DEFAULT_NODE).replace(/\/$/, '')
    this.timeout = options?.timeout ?? 30000
  }

  async query(question: string): Promise<AWPResult> {
    const url = `${this.nodeUrl}/query?q=${encodeURIComponent(question)}`
    const response = await fetch(url, {
      signal: AbortSignal.timeout(this.timeout),
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(`AWP query failed: ${response.status} — ${(body as any).error ?? response.statusText}`)
    }
    return response.json() as Promise<AWPResult>
  }

  async getEntry(id: string): Promise<AWPResult | null> {
    const url = `${this.nodeUrl}/entry/${encodeURIComponent(id)}`
    const response = await fetch(url, {
      signal: AbortSignal.timeout(this.timeout),
    })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`AWP getEntry failed: ${response.status}`)
    return response.json() as Promise<AWPResult>
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.nodeUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}