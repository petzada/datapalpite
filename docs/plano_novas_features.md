# Plano de Implementação - Novas Features (Round 2)

Este documento detalha as implementações de Dashboard V2, Configurações de Conta, Páginas Legais e Melhorias de UI/UX.

## 1. Dashboard V2 & Filtros Globais

### Visualização de Evolução da Banca
Para mostrar múltiplas bancas sem poluir, usaremos um gráfico multi-linhas:
- 1 Linha para "Total" (Soma de todas).
- 1 Linha para cada Banca Individual.
- Tooltip unificado mostrando os valores de todas no dia.

### Filtros Globais
Implementaremos filtros via URL Search Params (`?period=30&banca=all`) para que o estado seja global e persistente.

#### [MODIFY] [dashboard.ts](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/lib/actions/dashboard.ts)
- Atualizar `getDashboardStats` e `getDashboardCharts` para aceitar parâmetros:
    - `periodo?: string` (default: 'all')
    - `bancaId?: string` (default: 'all')
- Implementar lógica de filtro nas queries SQL.
- `getDashboardCharts`: Retornar estrutura de dados que suporte múltiplas séries (`{ date, total, banca1, banca2, ... }`).

#### [MODIFY] [page.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/app/dashboard/page.tsx)
- Ler `searchParams`.
- Passar filtros para as funções de data fetching.

#### [MODIFY] [DashboardHeader.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/components/dashboard/DashboardHeader.tsx)
- Ler filtros da URL para definir valor inicial dos Selects.
- Ao mudar Select, atualizar URL usando `router.push` e `useSearchParams`.

#### [MODIFY] [BankrollChart.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/components/dashboard/BankrollChart.tsx)
- Adaptar para renderizar múltiplas linhas (`Recharts`).
- Atribuir cores automáticas para cada banca.

## 2. RoR (Risco de Ruína)

### Lógica
- Não "mockar" dados. Começar "Em branco" ou com mensagem.
- Só calcular se `totalApostas > 10`.

#### [MODIFY] [ror.ts](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/lib/ror.ts)
- Remover fallback para `rorPlanejado` quando não houver dados reais.
- Retornar status explícito `insufficientData`.

#### [MODIFY] [KPISection.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/components/dashboard/KPISection.tsx)
- Se `insufficientData`, mostrar "N/A" ou "--" no valor principal.
- Na descrição, informar: "Registre algumas apostas para calcular o RoR."

## 3. Apostas - Edição de Resultado

#### [MODIFY] [ApostasTable.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/components/apostas/ApostasTable.tsx)
- Na tabela de "finalizadas", adicionar botão de ação "Editar" (lápis) ao lado da lixeira.
- Esse botão abre o `ResolverApostaDialog` passando a aposta.

#### [MODIFY] [ResolverApostaDialog.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/components/apostas/ResolverApostaDialog.tsx)
- Se a aposta já estiver resolvida (status != 'pendente'), pré-preencher o formulário com o resultado atual.
- Permitir re-submissão.

## 4. UI/UX - Layout Full Width

#### [MODIFY] [dashboard/calculadora-ev/page.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/app/dashboard/calculadora-ev/page.tsx)
- Remover classe `max-w-4xl`. Usar `w-full`.

#### [MODIFY] [dashboard/consulta-ia/page.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/app/dashboard/consulta-ia/page.tsx)
- Remover classe `max-w-4xl`. Usar `w-full`.

## 5. Configurações da Conta (Minha Conta)

### Nova Página
- Criar página para gerenciamento básico da conta.

#### [NEW] [src/app/dashboard/minha-conta/page.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/app/dashboard/minha-conta/page.tsx)
- Exibir: Nome, Email, Avatar.
- Seção "Assinatura": Mostrar plano atual, validade. Botão "Gerenciar Plano" (link para `/planos`).
- Seção "Configurações": Botão "Excluir Conta" (com confirmação dupla).

#### [MODIFY] [Sidebar.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/components/dashboard/Sidebar.tsx)
- Alterar a área do usuário (rodapé) para ser um link/botão para `/dashboard/minha-conta`.
- Manter botão de Logout acessível (um ícone pequeno na sidebar).

## 6. Páginas Legais

#### [MODIFY] [termos/page.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/app/termos/page.tsx)
- Adicionar texto padrão SaaS brasileiro (Termos de Uso).

#### [MODIFY] [privacidade/page.tsx](file:///c:/Users/MARCIO.PETIGROSSO/datapalpite/src/app/privacidade/page.tsx)
- Adicionar texto padrão LGPD brasileira (Política de Privacidade).
