# Relatório de Auditoria de Segurança - Data Palpite

> **Data:** 01/02/2026
> **Status:** ✅ Seguro (Nenhuma credencial crítica exposta encontrada)

## 1. Verificação de Credenciais Expostas
Realizamos uma varredura completa no código fonte (`src/`) e arquivos de configuração buscando por padrões de chaves de API, segredos e tokens.

### Resultados:
- **Nenhuma chave privada encontrada** no código fonte.
- **`.gitignore` configurado corretamente**:
  - `node_modules` ignorado.
  - `.env*` ignorado (evita commit acidental de variáveis de ambiente).
  - `.next` e builds ignorados.

### Recomendações:
1.  **Variáveis de Ambiente**: Continue usando `.env.local` para desenvolvimento e configure as variáveis de ambiente diretamente no painel da Vercel para produção. Nunca faça commit de arquivos `.env`.
2.  **Supabase**:
    - Garanta que a `NEXT_PUBLIC_SUPABASE_ANON_KEY` seja a única chave exposta no frontend.
    - A `SUPABASE_SERVICE_ROLE_KEY` deve ser usada **apenas** em ambientes seguros (Edge Functions ou Server Actions) e nunca exposta ao cliente.
3.  **RLS (Row Level Security)**:
    - Suas tabelas (`bancas`, `apostas`) já possuem RLS habilitado e políticas configuradas corretamente para restringir acesso apenas ao dono dos dados (`auth.uid() = user_id`). Mantenha essa prática para todas as novas tabelas.

---

## 2. Estrutura de Pastas e Arquivos
A estrutura do projeto segue as boas práticas do Next.js App Router.

- **`src/lib/supabase`**: Isolamento correto da lógica de conexão com o banco.
- **`src/actions`**: Server Actions garantem que a lógica de negócio execute no servidor, protegendo regras sensíveis.

## Conclusão
O projeto encontra-se seguro em relação a vazamento de chaves no repositório. O foco de segurança deve se manter na correta configuração das políticas RLS no banco de dados e no gerenciamento das variáveis de ambiente na plataforma de deploy.
