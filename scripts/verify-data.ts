// FILE: scripts/verify-data.ts (FIXED)
// LOCATION: /scripts/verify-data.ts
// ============================================
import { DefiDataService, PoolData } from '../lib/services/defi-data'

async function verifyData() {
  console.log('🔍 Starting data verification...\n')

  try {
    console.log('📊 Fetching Polkadot pools...')
    const pools = await DefiDataService.fetchPolkadotPools()
    
    console.log(`✅ Fetched ${pools.length} pools`)
    
    // Chain distribution
    const chainCounts = pools.reduce((acc: Record<string, number>, p: PoolData) => {
      acc[p.chain] = (acc[p.chain] || 0) + 1
      return acc
    }, {})
    console.log(`\n📍 Chains:`)
    Object.entries(chainCounts).forEach(([chain, count]) => {
      console.log(`   - ${chain}: ${count} pools`)
    })
    
    // APY statistics
    const apys = pools.map((p: PoolData) => p.apy).sort((a: number, b: number) => a - b)
    const avgAPY = apys.reduce((s: number, a: number) => s + a, 0) / apys.length
    console.log(`\n💰 APY Statistics:`)
    console.log(`   - Average: ${avgAPY.toFixed(2)}%`)
    console.log(`   - Min: ${apys[0].toFixed(2)}%`)
    console.log(`   - Max: ${apys[apys.length - 1].toFixed(2)}%`)
    console.log(`   - Median: ${apys[Math.floor(apys.length / 2)].toFixed(2)}%`)
    
    // TVL statistics
    const totalTVL = pools.reduce((s: number, p: PoolData) => s + p.tvlUsd, 0)
    console.log(`\n💎 TVL Statistics:`)
    console.log(`   - Total: $${(totalTVL / 1e9).toFixed(2)}B`)
    console.log(`   - Average per pool: $${(totalTVL / pools.length / 1e6).toFixed(2)}M`)
    
    // Risk scoring
    const riskScores = pools.map((p: PoolData) => p.riskScore)
    const avgRisk = riskScores.reduce((s: number, r: number) => s + r, 0) / riskScores.length
    console.log(`\n⚠️  Risk Scores:`)
    console.log(`   - Average: ${avgRisk.toFixed(2)}/10`)
    console.log(`   - Range: ${Math.min(...riskScores).toFixed(1)} - ${Math.max(...riskScores).toFixed(1)}`)
    
    // Projects
    const projects = [...new Set(pools.map((p: PoolData) => p.project))]
    console.log(`\n🏗️  Projects: ${projects.length} unique`)
    console.log(`   ${projects.slice(0, 10).join(', ')}${projects.length > 10 ? '...' : ''}`)
    
    // Sample pools
    console.log(`\n📋 Sample High APY Pools:`)
    const topPools = [...pools].sort((a: PoolData, b: PoolData) => b.apy - a.apy).slice(0, 5)
    topPools.forEach((p: PoolData) => {
      console.log(`   - ${p.symbol} on ${p.chain}: ${p.apy.toFixed(2)}% APY (TVL: $${(p.tvlUsd / 1e6).toFixed(2)}M)`)
    })
    
    console.log('\n✅ Data verification complete!')
    
  } catch (error) {
    console.error('❌ Verification failed:', error)
    throw error
  }
}

// Run verification
verifyData().catch(console.error)