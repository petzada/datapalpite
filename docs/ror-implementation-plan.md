# Risco de Ruína - Plano de Implementação (Futuro)

> **Status:** Aguardando implementação da seção de apostas
> **Dependência:** Tabela de apostas precisa existir para calcular RoR real

---

## Alterações no Banco de Dados

### Tabela `bancas`

Substituir `meta_roi TEXT` por:

```sql
ALTER TABLE bancas DROP COLUMN IF EXISTS meta_roi;
ALTER TABLE bancas ADD COLUMN stake_percentual DECIMAL(5,2) DEFAULT 2.00;
```

---

## Lógica do Cálculo

### Fórmula do RoR

```typescript
function calcularRoR(winRate: number, oddMedia: number, stakePercent: number): number {
  const edge = (winRate * oddMedia) - 1;
  if (edge <= 0) return 100;
  
  const unidades = 100 / stakePercent;
  const q = (1 - edge) / (1 + edge);
  return Math.pow(q, unidades) * 100;
}
```

### Estados do KPI

| Estado | Condição | Exibição |
|--------|----------|----------|
| Sem apostas | 0 apostas | RoR planejado |
| Com apostas | ≥10 apostas | RoR real |
| Desvio | real > planejado × 2 | Ícone ⚠️ |

---

## Design do KPI (Minimalista)

- Valor principal: RoR real (ou planejado se sem dados)
- Texto secundário: "planejado: X%" (só com dados reais)
- Ícone ⚠️: só se desvio significativo
- Barra: verde (<5%), amarelo (5-15%), vermelho (>15%)

---

## Arquivos a Modificar

1. `docs/bancas-schema.sql` - Adicionar stake_percentual
2. `BancaFormDialog.tsx` - Campo numérico com slider
3. `KPICard.tsx` - Suporte a valor secundário
4. `KPISection.tsx` - Lógica de cálculo
5. `bancas.ts` - Atualizar tipos
