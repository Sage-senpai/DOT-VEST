'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function OptimalPoolForm() {
  const [amount, setAmount] = useState(1000)
  const [duration, setDuration] = useState(6)
  const [riskTolerance, setRiskTolerance] = useState('medium')
  const { toast } = useToast()

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/pools/live/optimal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, duration, riskTolerance }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Optimal pool found!',
          description: `Best pool: ${data.data[0]?.name || 'N/A'}`,
          variant: 'success',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to find optimal pool',
          variant: 'error',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Request failed',
        description: err.message,
        variant: 'error',
      })
    }
  }

  return (
    <div>
      <button onClick={handleSubmit}>Find Optimal Pool</button>
    </div>
  )
}
