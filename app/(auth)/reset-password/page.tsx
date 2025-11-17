'use client'

import { Suspense } from 'react'
import ResetPasswordPageContent from './reset-password-content'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  )
}
