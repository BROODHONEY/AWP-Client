# AWP Client SDK

**Agent Web Protocol (AWP) v1.0** — A TypeScript client library for querying structured facts from an AWP node.

## Overview

AWP Client is a lightweight SDK that enables agents and applications to retrieve structured facts from an Agent Web Protocol network. The protocol seamlessly blends cached data with real-time web lookups, returning consistent, structured information about any topic.

- 🚀 **Zero configuration** — Connect to any AWP node with a single URL
- 💾 **Smart caching** — Results are cached locally on the node; repeated queries return instantly
- 🌐 **Web fallback** — Unknown queries automatically fetch and index fresh data from the web
- 📊 **Structured facts** — All responses contain typed, queryable facts with units and metadata

## Installation

```bash
npm install awp-client
```

## Quick Start

```typescript
import { AWP } from 'awp-client'

// Connect to an AWP node
const awp = new AWP({ node: 'https://awp-net.up.railway.app/' })

// Query for facts
const result = await awp.query('what is the Python programming language')

console.log(result.facts)  // Structured facts about Python
console.log(result.source) // 'cache' or 'web'
console.log(result.topic)  // Normalized topic title
```

## API Reference

### `new AWP(options)`

Creates a new AWP client instance.

**Options:**
- `node` (string, required) — URL of the AWP node to query
- `timeout` (number, optional) — Request timeout in milliseconds. Default: `30000`

```typescript
const awp = new AWP({
  node: 'http://localhost:3000',
  timeout: 15000,
})
```

### `awp.query(question): Promise<AWPResult>`

Query the AWP index for facts about a topic.

**Parameters:**
- `question` (string) — A natural language question or topic

**Returns:** `AWPResult` object with facts, metadata, and source

```typescript
const result = await awp.query('what is machine learning')
// {
//   hit: true,
//   source: 'cache',
//   topic: 'Machine Learning',
//   facts: [...],
//   source_url: 'https://...',
//   fetched_at: '2026-05-18T...',
//   similarity: 0.95
// }
```

### `awp.getEntry(id): Promise<AWPResult | null>`

Retrieve a specific entry by ID. Useful for re-fetching previously discovered entries.

**Parameters:**
- `id` (string) — Entry ID from a prior query result

**Returns:** `AWPResult` or `null` if not found

```typescript
const entry = await awp.getEntry('entry-abc123')
if (entry) {
  console.log(entry.facts)
}
```

### `awp.isHealthy(): Promise<boolean>`

Check if the AWP node is reachable and operational.

**Returns:** `true` if healthy, `false` if unreachable

```typescript
const healthy = await awp.isHealthy()
if (!healthy) {
  console.error('AWP node is offline')
}
```

## Types

### `AWPResult`

The response from any query operation.

```typescript
interface AWPResult {
  hit: boolean              // true if facts were found
  source: 'cache' | 'web'   // where the facts came from
  topic: string             // normalized topic title
  facts: AWPFact[]          // array of structured facts
  source_url: string        // URL where data originated
  fetched_at: string        // ISO timestamp of retrieval
  similarity?: number       // relevance score (0-1)
}
```

### `AWPFact`

A single structured fact within a result.

```typescript
interface AWPFact {
  claim: string                              // the fact statement
  type: 'text' | 'numeric' | 'boolean' | 'date'  // fact type
  value?: string | number | boolean         // parsed value
  unit?: string                             // unit of measurement (if applicable)
}
```

### `AWPOptions`

Configuration for creating an AWP client.

```typescript
interface AWPOptions {
  node: string      // URL of AWP node
  timeout?: number  // request timeout in ms (default: 30000)
}
```

## Examples

### Querying a Topic

```typescript
import { AWP } from 'awp-client'

const awp = new AWP({ node: 'https://awp-net.up.railway.app/' })

const result = await awp.query('what is the climate of Japan')

console.log(`Topic: ${result.topic}`)
console.log(`Source: ${result.source}`)
console.log(`Facts retrieved: ${result.facts.length}`)

result.facts.forEach(fact => {
  console.log(`- ${fact.claim} (${fact.type})`)
  if (fact.value) {
    console.log(`  Value: ${fact.value} ${fact.unit || ''}`)
  }
})
```

### Health Check Before Query

```typescript
const awp = new AWP({ node: 'http://localhost:3000' })

const healthy = await awp.isHealthy()
if (!healthy) {
  console.error('AWP node is not running')
  process.exit(1)
}

const result = await awp.query('what is TypeScript')
```

### Building an Agent

```typescript
import { AWP } from 'awp-client'

class InformationAgent {
  private awp: AWP

  constructor(nodeUrl: string) {
    this.awp = new AWP({ node: nodeUrl })
  }

  async answer(question: string): Promise<string[]> {
    const result = await this.awp.query(question)
    
    if (!result.hit) {
      return ['No information found.']
    }

    return result.facts
      .filter(f => f.type === 'text')
      .map(f => f.claim)
  }
}

const agent = new InformationAgent('https://awp-net.up.railway.app/')
const answers = await agent.answer('who wrote the Magna Carta')
console.log(answers)
```

## Error Handling

The SDK throws errors for failed requests. Always wrap queries in try-catch:

```typescript
const awp = new AWP({ node: 'http://localhost:3000' })

try {
  const result = await awp.query('what is AI')
  console.log(result.facts)
} catch (error) {
  console.error('Query failed:', error.message)
  // Network timeout, invalid node, or server error
}
```

## Protocol Details

### Query Flow

1. **Client sends query** to `/query?q=...` endpoint
2. **Node checks cache** for similar topics
3. **If hit:** Return cached facts immediately
4. **If miss:** Fetch from web, index, cache, and return results
5. **All responses** are consistent, regardless of source

### Timeout Behavior

- Default timeout: **30 seconds** (web lookups can be slow)
- Health checks: **5 seconds**
- Customize via `AWPOptions.timeout`

## Requirements

- Node.js 16+ (for `AbortSignal.timeout`)
- Modern TypeScript (v5+)
- Network access to an AWP node

## Related

- **AWP Protocol**: [Agent Web Protocol Specification](https://github.com/your-org/awp-protocol)
- **AWP Node**: Run your own AWP node
- **Agent Examples**: See `src/test-sdk.ts` for usage examples

## License

ISC

## Versioning

- **Current Version**: 1.0.0
- **Protocol Version**: AWP v1.0
