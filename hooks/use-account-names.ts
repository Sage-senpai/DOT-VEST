// FILE: hooks/use-account-names.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useAccountNames(userId: string) {
  const [names, setNames] = useState<{[address: string]: string}>({})

  useEffect(() => {
    loadNames()
  }, [userId])

  const loadNames = async () => {
    const { data } = await supabase
      .from('wallet_names')
      .select('*')
      .eq('user_id', userId)
    
    if (data) {
      const nameMap = {}
      data.forEach(item => {
        nameMap[item.wallet_address] = item.custom_name
      })
      setNames(nameMap)
    }
  }

  const setName = async (address: string, name: string) => {
    await supabase
      .from('wallet_names')
      .upsert({
        user_id: userId,
        wallet_address: address,
        custom_name: name
      })
    
    setNames(prev => ({ ...prev, [address]: name }))
  }

  return { names, setName }
}