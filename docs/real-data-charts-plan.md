# Plano de Implementação: Gráficos com Dados Reais

Este documento detalha o passo a passo para substituir os dados mockados (fictícios) dos gráficos do Dashboard por dados reais calculados a partir do histórico de apostas e bancas do usuário.

## Visão Geral

O objetivo é conectar os componentes do Recharts (`BankrollChart` e `ROIBySportChart`) ao banco de dados Supabase via Server Actions.

---

## 1. Definição das Estruturas de Dados

Precisamos definir os tipos de dados que os gráficos esperam receber.

### 1.1 Evolução da Banca (`BankrollEvolutionData`)
Representa o saldo acumulado ao longo do tempo.
- **date:** string Formato `dd/mm` (ex: "01/02").
- **saldo:** number O valor total em caixa naquele dia.

### 1.2 ROI por Esporte (`RoiBySportData`)
Representa a performance por modalidade.
- **sport:** string Nome do esporte.
- **roi:** number Percentual de retorno ((Lucro / Stake) * 100).
- **profit:** number Valor monetário do lucro/prejuízo.
- **volume:** number Total apostado (stake) nesta modalidade.
- **betsCount:** number Quantidade de apostas.

---

## 2. Passo a Passo de Implementação

### Passo 1: Atualizar Server Action (`src/lib/actions/dashboard.ts`)

Precisamos criar uma nova função `getDashboardCharts()` que busca os dados brutos e faz o processamento matemático.

**Lógica para Evolução da Banca:**
1. Buscar todas as bancas para somar o `saldo_inicial` (Ponto de Partida).
2. Buscar todas as apostas finalizadas (`ganha`, `perdida`, `anulada`) ordenadas por data crescente.
3. Criar uma linha do tempo acumulativa:
   - Começa com o saldo inicial total.
   - Para cada aposta, soma o `lucro_prejuizo` ao saldo atual.
   - Agrupa os resultados por dia (se tiver 5 apostas no dia 01/02, pega o saldo final após a 5ª aposta).

**Lógica para ROI por Esporte:**
1. Buscar apostas incluindo a relação com `aposta_eventos`.
2. Iterar sobre as apostas:
   - Se for **Simples**: O esporte é o do evento único.
   - Se for **Múltipla**:
     - Verificar se todos os eventos são do mesmo esporte (ex: tudo Futebol) -> Conta como Futebol.
     - Se houver mistura (Futebol + Basquete) -> Classificar como "Múltiplos".
3. Somar `stake` e `lucro_prejuizo` para cada categoria.
4. Calcular ROI: `(Lucro / Stake) * 100`.

### Passo 2: Atualizar a Página do Dashboard (`src/app/dashboard/page.tsx`)

1. Importar a nova função `getDashboardCharts`.
2. Chamar a função dentro do `Promise.all` existente (junto com `getDashboardStats`).
3. Passar os dados retornados para o componente `<ChartsSection />`.

### Passo 3: Atualizar a Seção de Gráficos (`src/components/dashboard/ChartsSection.tsx`)

1. Atualizar a interface do componente para aceitar as props:
   ```typescript
   interface ChartsSectionProps {
       evolutionData: any[]; // Tipar corretamente
       roiData: any[];       // Tipar corretamente
   }
   ```
2. Repassar esses dados para os componentes filhos (`BankrollChart` e `ROIBySportChart`).

### Passo 4: Atualizar Componente de Evolução (`src/components/dashboard/BankrollChart.tsx`)

1. Aceitar a prop `data`.
2. Remover a constante `mockData`.
3. Adicionar tratamento para caso não haja dados (exibir mensagem "Sem apostas suficientes").
4. Formatar o Tooltip para mostrar o saldo em R$ (Real).

### Passo 5: Atualizar Componente de ROI (`src/components/dashboard/ROIBySportChart.tsx`)

1. Aceitar a prop `data`.
2. Remover a constante `data` (mock).
3. Implementar lógica de cores dinâmica na célula do gráfico:
   - Se `roi > 0`: Barra Verde (`#22c55e`).
   - Se `roi < 0`: Barra Vermelha (`#ef4444`).
4. Customizar o Tooltip para mostrar: ROI, Lucro (R$) e Volume Apostado.

---

## 3. Checklist de Execução Técnica

- [ ] **dashboard.ts**: Implementar query SQL com join em `aposta_eventos` e lógica de agrupamento Typescript.
- [ ] **page.tsx**: Injetar dados no componente client-side.
- [ ] **ChartsSection.tsx**: Tipagem das props.
- [ ] **BankrollChart.tsx**: Limpeza de mocks e formatação BRL.
- [ ] **ROIBySportChart.tsx**: Lógica de cores (verde/vermelho) no `Bar` chart.

## 4. Observação Importante sobre "Múltiplas"

Para simplificar a primeira versão da lógica de ROI:
- Apostas do tipo "Simples" contam para o esporte específico.
- Apostas do tipo "Múltipla" que contêm **apenas um tipo de esporte** (ex: 3 jogos de Tênis) contam para "Tênis".
- Apostas do tipo "Múltipla" com **esportes mistos** devem ser agrupadas na categoria "Combinadas" para não distorcer a estatística de um esporte individual.
