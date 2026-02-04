Ter# Plano de Implementação - Melhorias Data Palpite

Este documento detalha as alterações necessárias para corrigir problemas no Dashboard, melhorar a tabela de Bancas e ajustar a UI para dispositivos móveis.

## 1. Dashboard

### Problema: Filtro de Bancas e Card de Saldo
- O filtro de bancas não é populado corretamente.
- O card de "Saldo Atual" precisa de uma interação para ver detalhes por banca.

### Mudanças Propostas
#### [MODIFY] [page.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/app/dashboard/page.tsx)
- Buscar a lista de bancas (`id`, `nome`, `saldo_inicial`, `stake_percentual`) diretamente na página.
- Passar a lista de bancas para os componentes `DashboardHeader` e `KPISection`.

#### [MODIFY] [DashboardHeader.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/components/dashboard/DashboardHeader.tsx)
- Adicionar prop `bancas`.
- Mapear as bancas no componente `Select` do filtro "Casa de apostas".

#### [MODIFY] [KPISection.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/components/dashboard/KPISection.tsx)
- Adicionar prop `bancas`.
- No card "Saldo Atual", adicionar um `Dialog` (ou `Popover`) que é acionado ao clicar no card.
- O Dialog mostrará uma lista simples das bancas cadastradas. Será necessário garantir que temos os dados de saldo por banca (inicial + lucros).

#### [MODIFY] [dashboard.ts](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/lib/actions/dashboard.ts)
- Verificar viabilidade de retornar PL por banca. Caso complexo, o modal mostrará apenas saldos iniciais ou totais estimados.

## 2. Bancas

### Problema: Alinhamento e Informação de Stake
- Tabela desalinhada no desktop.
- Falta informação de valor de stake.

### Mudanças Propostas
#### [MODIFY] [BancasTable.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/components/bancas/BancasTable.tsx)
- Ajustar classes CSS das colunas.
- Adicionar coluna "Stake" exibindo: `X% (R$ Y,YY)`.

## 3. UI/UX (Mobile First)

### Problema: Modais muito grandes no mobile
- Modais de "Nova Banca", "Nova Aposta", "Finalizar Aposta" cortados na tela.

### Mudanças Propostas
#### [MODIFY] [BancaFormDialog.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/components/bancas/BancaFormDialog.tsx)
- Adicionar `max-h-[85vh] overflow-y-auto` ao `DialogContent`.

#### [MODIFY] [ApostaFormDialog.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/components/apostas/ApostaFormDialog.tsx)
- Adicionar `max-h-[85vh] overflow-y-auto` ao `DialogContent`.

#### [MODIFY] [ResolverApostaDialog.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/components/apostas/ResolverApostaDialog.tsx)
- Adicionar `max-h-[85vh] overflow-y-auto` ao `DialogContent`.

## 4. Deploy
- Rodar `npm run build`.
- Commit e Push.
