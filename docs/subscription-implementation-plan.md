# Plano de Implementação: Gestão de Assinaturas (Trial, Easy & Pro)

Este documento descreve a arquitetura refinada para o sistema de planos de assinatura do Data Palpite, incluindo regras de Trial de 7 dias e limitações específicas por nível de plano.

## 1. Arquitetura do Banco de Dados

### 1.1 Tabela `profiles` (Pública)
Tabela vinculada 1:1 com `auth.users` para gerenciar estado, trial e limites.

```sql
-- Enum para os tipos de plano
CREATE TYPE plano_tier AS ENUM ('trial', 'easy', 'pro');

-- Enum para status da assinatura
CREATE TYPE assinatura_status AS ENUM ('active', 'canceled', 'past_due', 'expired');

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    plano plano_tier DEFAULT 'trial',
    status assinatura_status DEFAULT 'active',
    
    -- Controle de Vencimento (Usado para Trial e Assinatura)
    valid_until TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    
    -- Controle de Uso Diário (ex: Consultas IA)
    ai_queries_today INTEGER DEFAULT 0,
    last_ai_query_date DATE DEFAULT CURRENT_DATE,
    
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_profiles_valid_until ON profiles(valid_until);
```

### 1.2 Trigger de Novo Usuário (Trial Automático)
Ao se cadastrar, o usuário recebe automaticamente o plano 'trial' com validade de 7 dias (definido no DEFAULT do SQL acima).

---

## 2. Acesso e Feature Gating

A lógica de permissão deve ser centralizada em um hook ou função utilitária (`src/lib/access-control.ts`).

### 2.1 Lógica de Bloqueio Pós-Trial
Antes de verificar o plano específico, o sistema deve checar a validade da conta.

```typescript
export async function checkAccessStatus(userId: string) {
    // Buscar profile
    const profile = await getProfile(userId);
    
    const now = new Date();
    const validUntil = new Date(profile.valid_until);
    
    // Se o plano é Trial e já passou da data => BLOQUEIO TOTAL
    if (profile.plano === 'trial' && now > validUntil) {
        return { 
            access: 'blocked', 
            reason: 'trial_expired' 
        };
    }
    
    // Se assinatura expirou e não é trial
    if (now > validUntil) {
         return { 
            access: 'blocked', 
            reason: 'subscription_expired' 
        };
    }

    return { access: 'granted', plan: profile.plano };
}
```

### 2.2 Tabela de Limites por Plano

| Funcionalidade | Trial (7 dias) | Easy | Pro |
| :--- | :--- | :--- | :--- |
| **Acesso ao Sistema** | ✅ Total | ✅ Total | ✅ Total |
| **Bancas Ativas** | ∞ Ilimitado | 1 Banca | ∞ Ilimitado |
| **Consultas IA/dia** | ∞ Ilimitado | 1 Consulta | ∞ Ilimitado |
| **Análise Real-Time** | ✅ Sim | ❌ Bloqueado | ✅ Sim |
| **Histórico Jogos** | ✅ Tudo | ⚠️ Apenas Hoje | ✅ Tudo |
| **Calculadora Odds** | ✅ Sim | ✅ Sim | ✅ Sim |
| **Dashboard** | ✅ Sim | ✅ Sim | ✅ Sim |

---

## 3. Estratégia de UI/UX (O Bloqueio)

### 3.1 Bloqueio "Hard" (Trial Expirado)
Para usuários com trial vencido, renderizar um componente de `Overlay` sobre todo o conteúdo do Dashboard ou redirecionar para `/pricing`.

**Componente Sugerido: `<UpgradeLockScreen />`**
- Fundo com blur (`backdrop-blur-md`).
- Mensagem: "Seu período de teste acabou. Escolha um plano para continuar lucrando."
- Cards de Pricing (Easy/Pro) centralizados.
- Botão de Logout.

### 3.2 Bloqueio "Soft" (Limitações do Easy)

**Bancas:**
- No `BancaFormDialog`, se o usuário Easy tentar criar a 2ª banca:
- Mostrar mensagem de erro/upsell: "Plano Easy permite apenas 1 banca. Faça upgrade para ter bancas ilimitadas."

**IA e Análises:**
- Botão desabilitado ou com cadeado.
- Tooltip: "Disponível no plano Pro".

---

## 4. Passo a Passo de Implementação Técnica

1.  **Migração SQL:**
    - Criar tabela `profiles` com colunas de controle (`valid_until`, `ai_queries_today`).
    - Criar trigger para resetar `ai_queries_today` diariamente (pode ser via `pg_cron` ou verificação no código ao fazer a query).

2.  **Middleware de Controle (`src/middleware.ts`):**
    - Opcional: Redirecionar usuários bloqueados para uma página `/expired` se preferir não usar overlay.

3.  **Utilitário de Assinatura (`src/lib/subscription.ts`):**
    - Função `getCurrentPlan()`: Retorna o plano e se está dentro da validade.
    - Função `canPerformAction(action)`: Centraliza a lógica (ex: `canCreateBanca`, `canUseAI`).

4.  **Integração no Frontend:**
    - Envolver o Dashboard num componente `<SubscriptionGuard>`.
    - Se `trial_expired`, mostar o `UpgradeLockScreen`.
    - Se não, mostrar o `children`.

5.  **Página de Planos (`/planos` ou modal):**
    - Interface para o usuário escolher Easy ou Pro.
    - Integração futura com Gateway de Pagamento para atualizar o `plano` e `valid_until` no banco.
