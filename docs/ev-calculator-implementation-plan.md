# Plano de Implementação: Calculadora de Valor Esperado (EV+)

Este documento detalha o roteiro para criar a ferramenta de cálculo de EV+ (Expected Value) no Data Palpite. O objetivo é permitir que o usuário verifique matematicamente se uma aposta tem valor a longo prazo.

---

## 1. Conceito e Lógica Matemática

### Entradas (Inputs)
O usuário deve fornecer:
1.  **Odd Final da Casa** (Decimal, ex: 2.10): Quanto a casa está pagando.
2.  **Probabilidade Real** (%, ex: 52%): A chance real que o usuário estima para o evento.
3.  **Stake/Valor da Aposta** (Opcional, R$): Para calcular o retorno monetário esperado.

### Saídas (Outputs) e Fórmulas
1.  **Fair Odd (Odd Justa)**: `1 / (Probabilidade Real / 100)`
    *   *Exemplo:* Para 50% de chance, a Fair Odd é 2.00.
2.  **Probabilidade Implícita da Casa**: `(1 / Odd Casa) * 100`
    *   *Exemplo:* Odd 2.00 implica 50% de chance.
3.  **EV% (Valor Esperado Percentual)**:
    *   Fórmula: `((Probabilidade Real / 100) * Odd Casa) - 1`
    *   Resultado multiplicado por 100 para %.
    *   *Exemplo:* 52% chance * 2.10 odd = 1.092 - 1 = 0.092 = **+9.2% EV**.
4.  **EV$ (Valor Esperado Monetário)**: `EV% * Stake`

---

## 2. Interface do Usuário (UI/UX)

### Nova Estrutura de Navegação
- **Rota:** `/dashboard/calculadora-ev`
- **Sidebar (Desktop):**
    - Criar nova Label (título de seção): "Ferramentas" (posicionada **abaixo** do menu "Apostas").
    - Adicionar item: "Calculadora EV" com ícone `Calculator` (Lucide React).
- **Mobile Nav (Bottombar):**
    - Adicionar ícone de Calculadora na barra inferior.

### Design da Calculadora
- **Card Principal:** Design limpo usando componentes do shadcn/ui.
- **Inputs:** Grandes e claros, com máscaras para moeda e porcentagem.
- **Feedback Visual:**
    - **EV Positivo (+):** Cor Verde (`text-emerald-500`), ícone `CheckCheck`. Mensagem de incentivo ("Aposta de Valor!").
    - **EV Negativo (-):** Cor Vermelha (`text-red-500`), ícone `X`. Mensagem de alerta ("Valor esperado negativo.").
- **Comparativo Visual:** Barra de progresso comparando "Probabilidade da Casa" vs "Sua Probabilidade".

---

## 3. Passo a Passo de Execução

### Passo 1: Estrutura de Pastas e Rota
1.  Criar diretório: `src/app/dashboard/calculadora-ev/`.
2.  Criar página: `src/app/dashboard/calculadora-ev/page.tsx`.
3.  Definir metadados da página (Título: "Calculadora EV+ | Data Palpite").

### Passo 2: Componente da Calculadora (`EvCalculator.tsx`)
Criar `src/components/ferramentas/EvCalculator.tsx`:
- Estado local para os inputs (`oddCasa`, `probReal`, `stake`).
- `useEffect` ou `useMemo` para recalcular os resultados sempre que os inputs mudarem.
- Renderizar os inputs e o card de resultados.
- Usar `Card`, `Input`, `Label`, `Slider` (opcional para probabilidade) e badges.

### Passo 3: Atualizar Navegação
1.  **`Sidebar.tsx`**:
    - Adicionar seção "Ferramentas" logo após o bloco de links de navegação principal (onde está Apostas).
    - Inserir link para `/dashboard/calculadora-ev`.
2.  **`MobileNav.tsx`**:
    - Adicionar item de menu para a calculadora.

---

## 4. Exemplo de Código para a Lógica (Referência)

```typescript
// Exemplo de função de cálculo para usar no componente
function calculateEV(odd: number, prob: number, stake: number = 0) {
    const probDecimal = prob / 100;
    const fairOdd = 1 / probDecimal;
    const impliedProb = (1 / odd) * 100;
    
    // EV% = (ChanceReal * Odd) - 1
    const evPercent = (probDecimal * odd) - 1;
    
    // EV$ = EV% * Stake
    const evValue = evPercent * stake;

    return {
        evPercent: evPercent * 100, // ex: 5.5 (%)
        evValue,                    // ex: 5.50 (R$)
        fairOdd,                    // ex: 1.90
        impliedProb,                // ex: 47.6 (%)
        isPositive: evPercent > 0
    };
}
```

## 5. Checklist para o Desenvolvedor

- [ ] Criar rota e página base.
- [ ] Implementar componente `EvCalculator` com lógica de EV+.
- [ ] Estilizar resultados (Verde/Vermelho) para feedback imediato.
- [ ] Atualizar `Sidebar.tsx` com nova seção "Ferramentas".
- [ ] Atualizar `MobileNav.tsx`.
- [ ] Testar com casos reais (ex: Odd 2.00 vs Prob 55%).
