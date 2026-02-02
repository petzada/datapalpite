# Plano de Remoção da Resend e Reversão para E-mails Supabase

Este documento detalha os passos para remover a integração com a Resend e voltar a utilizar apenas os e-mails transacionais nativos do Supabase.

## Objetivo
Desinstalar a biblioteca `resend`, remover códigos customizados de envio de e-mail e garantir que a aplicação continue funcionando com os e-mails padrão de autenticação do Supabase.

## Análise de Impacto

Os seguintes arquivos e configurações serão afetados:

1.  **`src/lib/email.ts`**: Arquivo criado exclusivamente para a integração com a Resend. **Será excluído**.
2.  **`src/app/auth/callback/route.ts`**: Atualmente importa `sendWelcomeEmail` e contém lógica para envio manual de e-mail. **Será modificado** para remover essa lógica, mantendo apenas a criação de perfil (se necessário) e o redirecionamento.
3.  **`package.json`**: Contém a dependência `resend`. **Será desinstalada**.
4.  **`docs/resend-troubleshooting.md`**: Documentação de suporte à Resend. **Será excluído**.
5.  **`.env.local`**: Contém `RESEND_API_KEY`. **Recomendado remover** (manual ou via instrução).

## Passo a Passo da Implementação

### 1. Limpeza de Código (`src/app/auth/callback/route.ts`)

Removeremos a importação e a chamada da função `sendWelcomeEmail`.

**Como ficará a lógica:**
Manteremos a verificação e criação do perfil (`profiles`) como fallback de segurança, pois isso é útil independentemente do provedor de e-mail. Porém, não tentaremos mais enviar e-mails via código.

```typescript
// Antes:
import { sendWelcomeEmail } from '@/lib/email'
// ...
if (shouldSendEmail && user.email) {
    sendWelcomeEmail(...)
}

// Depois:
// Importação removida
// Lógica de envio de e-mail removida
```

### 2. Remoção de Arquivos

*   Excluir `src/lib/email.ts`
*   Excluir `docs/resend-troubleshooting.md`

### 3. Remoção de Dependências

Executar o comando:
```bash
npm uninstall resend
```

### 4. Verificação no Supabase (Ação do Usuário)

Como você removerá o envio customizado, certifique-se de que os templates de e-mail no painel do Supabase estão ativos e configurados conforme desejado:
*   **Confirm Email**: Para novos cadastros.
*   **Reset Password**: Para recuperação de senha.
*   **Magic Link**: Se utilizado.

> **Nota**: O e-mail de "Boas-vindas" (que enviávamos manualmente após o login) **deixará de ser enviado**, pois o Supabase não possui um evento nativo de "pós-login" ou "pós-confirmação" que dispare e-mails automaticamente sem uso de Edge Functions ou Webhooks. Se isso for crítico, precisaremos usar Edge Functions no futuro.

## Plano de Verificação

1.  **Build**: Executar `npm run build` para garantir que não restaram importações quebradas.
2.  **Fluxo de Cadastro**: Testar um novo cadastro (pode ser com e-mail temporário) e confirmar que:
    *   O usuário é criado.
    *   O redirecionamento para o dashboard ocorre.
    *   O perfil é criado (via trigger ou fallback).
    *   **Nenhum erro** ocorre no console/logs relacionado à falta da Resend.
