import { AWP } from './index'

async function test() {
  const awp = new AWP({ node: 'http://localhost:3000' })

  console.log('1. Checking node health...')
  const healthy = await awp.isHealthy()
  console.log('   Healthy:', healthy)
  if (!healthy) {
    console.error('   Node is not running — start it with: npm run dev')
    process.exit(1)
  }

  console.log('\n2. Querying something already in your index...')
  const result = await awp.query('what is the python programming language')
  console.log('   Source:', result.source)     // should be "cache"
  console.log('   Topic:', result.topic)
  console.log('   Facts:', result.facts.length)

  console.log('\n3. Querying something new...')
  const result2 = await awp.query('what is the TypeScript programming language')
  console.log('   Source:', result2.source)    // "web" first time, "cache" after
  console.log('   Topic:', result2.topic)
  console.log('   Facts:', result2.facts.length)

  console.log('\nSDK working ✓')
  console.log('\nThis is what any agent developer sees:')
  console.log('  import { AWP } from "awp-client"')
  console.log('  const awp = new AWP({ node: "http://localhost:3000" })')
  console.log('  const result = await awp.query("...")')
  console.log('  console.log(result.facts)')
}

test().catch(console.error)