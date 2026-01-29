# Integração Google OAuth com Supabase + Vercel

Este documento explica como configurar a autenticação Google OAuth no Data Palpite usando Supabase.

---

## 1. Configurar Google Cloud Console

### 1.1 Criar Projeto
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o **Project ID**

### 1.2 Configurar OAuth Consent Screen
1. Vá em **APIs & Services → OAuth consent screen**
2. Escolha **External** (para usuários fora da organização)
3. Preencha:
   - **App name**: Data Palpite
   - **User support email**: seu e-mail
   - **Developer contact**: seu e-mail
4. Em **Scopes**, adicione:
   - `email`
   - `profile`
   - `openid`
5. Clique em **Save and Continue**

### 1.3 Criar Credenciais OAuth
1. Vá em **APIs & Services → Credentials**
2. Clique em **Create Credentials → OAuth client ID**
3. Tipo: **Web application**
4. Nome: `Data Palpite Web`
5. Em **Authorized redirect URIs**, adicione:
   ```
   https://SEU_PROJETO.supabase.co/auth/v1/callback
   ```
   (Substitua `SEU_PROJETO` pelo ID do seu projeto Supabase)
6. Clique em **Create**
7. Anote o **Client ID** e **Client Secret**

---

## 2. Configurar Supabase

### 2.1 Habilitar Provider Google
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication → Providers**
4. Encontre **Google** e clique para expandir
5. Ative o toggle **Enable Sign in with Google**
6. Cole o **Client ID** e **Client Secret** do Google
7. Clique em **Save**

### 2.2 Configurar URL de Redirect
1. Em **Authentication → URL Configuration**
2. Configure:
   - **Site URL**: `https://seu-dominio.vercel.app` (produção)
   - **Redirect URLs**: 
     ```
     https://seu-dominio.vercel.app/**
     http://localhost:3000/**
     ```

---

## 3. Implementar no Next.js

### 3.1 Instalar Supabase
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 3.2 Variáveis de Ambiente
Crie `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

### 3.3 Criar Cliente Supabase
Arquivo: `src/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 3.4 Função de Login com Google
No componente de login:
```typescript
import { createClient } from '@/lib/supabase/client'

const handleGoogleLogin = async () => {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  
  if (error) {
    console.error('Erro no login:', error.message)
  }
}
```

### 3.5 Criar Callback Route
Arquivo: `src/app/auth/callback/route.ts`
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
```

---

## 4. Deploy na Vercel

### 4.1 Configurar Variáveis de Ambiente
1. Acesse seu projeto na [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Settings → Environment Variables**
3. Adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4.2 Atualizar URLs no Google Console
Após o deploy, adicione a URL de produção nas **Authorized redirect URIs**:
```
https://seu-dominio.vercel.app/auth/callback
```

### 4.3 Atualizar Supabase
Configure o **Site URL** para a URL de produção da Vercel.

---

## Checklist Final

- [ ] Projeto criado no Google Cloud Console
- [ ] OAuth consent screen configurado
- [ ] Credenciais OAuth criadas
- [ ] Provider Google habilitado no Supabase
- [ ] URLs de redirect configuradas
- [ ] Variáveis de ambiente no Vercel
- [ ] Teste em ambiente local
- [ ] Teste em produção
