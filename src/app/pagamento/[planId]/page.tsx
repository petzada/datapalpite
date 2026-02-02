import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PaymentClient } from './PaymentClient'

interface PageProps {
    params: Promise<{ planId: string }>
}

const VALID_PLANS = ['easy', 'pro'] as const
type ValidPlan = typeof VALID_PLANS[number]

const PLAN_INFO: Record<ValidPlan, { name: string; price: string; priceValue: number }> = {
    easy: { name: 'Easy', price: 'R$ 14,90', priceValue: 14.90 },
    pro: { name: 'Pro', price: 'R$ 39,90', priceValue: 39.90 },
}

export default async function PagamentoPage({ params }: PageProps) {
    const { planId } = await params

    // Validate planId
    if (!VALID_PLANS.includes(planId as ValidPlan)) {
        redirect('/planos')
    }

    const validPlanId = planId as ValidPlan
    const planInfo = PLAN_INFO[validPlanId]

    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, plano')
        .eq('id', user.id)
        .single()

    // Don't allow payment for current plan
    if (profile?.plano === validPlanId) {
        redirect('/dashboard')
    }

    return (
        <PaymentClient
            planId={validPlanId}
            planName={planInfo.name}
            planPrice={planInfo.price}
            planPriceValue={planInfo.priceValue}
            userName={profile?.full_name || 'Usuário'}
            userEmail={profile?.email || user.email || ''}
        />
    )
}
