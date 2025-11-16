// LOCATION: /README.md
// NOTE: Add this section to your README
// ============================================

## Testing Real Data Integration

### 1. Verify Data Fetching
```bash
# Run data verification script
pnpm verify-data

# Expected output:
# ✅ Fetched X pools
# 📍 Chains: Polkadot, Acala, Hydration...
# 💰 APY Statistics: Average XX%
```

### 2. Test API Endpoints
```bash
# Start development server
pnpm dev

# In another terminal, test endpoints:
pnpm test:api
pnpm test:optimal
```

### 3. Check Cache Performance
```bash
# Clear cache and restart
pnpm cache:clear
pnpm dev

# Monitor console for cache hits/misses
# Look for: [Cache] Hit: GET:...
```

### 4. Monitor Errors
- Check Sentry dashboard for any reported errors
- Review browser console for warnings
- Check network tab for failed requests

### 5. Performance Testing
- Use Lighthouse in Chrome DevTools
- Check for slow API responses (>5s)
- Monitor bundle size with `pnpm analyze`

## Troubleshooting

### Data Not Loading
1. Check API endpoint: `curl http://localhost:3000/api/pools/live`
2. Verify DefiLlama API status
3. Clear cache: `pnpm cache:clear`

### Wallet Connection Issues
1. Ensure Polkadot.js extension is installed
2. Check browser console for errors
3. Try disconnecting and reconnecting wallet

### Slow Performance
1. Check network tab for slow requests
2. Verify caching is working (check cache hits in console)
3. Consider reducing data fetch frequency