'use client'

import { useState } from 'react'
import { Check, Copy, Printer } from 'lucide-react'
import { showToast } from '@/lib/showToast'

/**
 * Client-side action buttons for the Order Details page.
 * Kept isolated so the page itself can remain a server component.
 */
const OrderDetailActions = ({ orderId }) => {
    const [copied, setCopied] = useState(false)

    const copyOrderId = async () => {
        try {
            await navigator.clipboard.writeText(orderId)
            setCopied(true)
            showToast('success', 'Order ID copied to clipboard')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            showToast('error', 'Unable to copy. Please copy it manually.')
        }
    }

    return (
        <div className='grid grid-cols-2 gap-2.5'>
            <button
                type='button'
                onClick={copyOrderId}
                className='inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-border/70 bg-background text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:border-[var(--dark-red)] hover:text-[var(--dark-red)]'
            >
                {copied ? <Check className='size-3.5' /> : <Copy className='size-3.5' />}
                {copied ? 'Copied' : 'Copy ID'}
            </button>
            <button
                type='button'
                onClick={() => window.print()}
                className='inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-border/70 bg-background text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:border-[var(--dark-red)] hover:text-[var(--dark-red)]'
            >
                <Printer className='size-3.5' />
                Print
            </button>
        </div>
    )
}

export default OrderDetailActions
