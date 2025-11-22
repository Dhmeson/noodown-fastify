# Guia de Publicação no NPM

Este documento contém os passos detalhados para publicar o pacote `noodown-express` no NPM.

## Pré-requisitos

1. **Conta no NPM**: Você precisa ter uma conta no [npmjs.com](https://www.npmjs.com/)
2. **NPM CLI instalado**: Certifique-se de ter o npm instalado globalmente
3. **Login no NPM**: Você precisa estar logado no npm via CLI

## Passo 1: Verificar se está logado no NPM

```bash
npm whoami
```

Se não estiver logado, você verá um erro. Nesse caso, faça login:

```bash
npm login
```

Você será solicitado a inserir:
- Username
- Password
- Email
- OTP (se tiver autenticação de dois fatores habilitada)

## Passo 2: Verificar informações do package.json

Antes de publicar, verifique e atualize as seguintes informações no `package.json`:

- **name**: Verifique se o nome `noodown-express` está disponível no npm
- **version**: A versão inicial é `1.0.0`
- **author**: Adicione seu nome e email (opcional)
- **repository**: Adicione a URL do repositório Git (se aplicável)
- **homepage**: Adicione a URL da homepage (se aplicável)
- **bugs**: Adicione a URL para reportar bugs (se aplicável)

Para verificar se o nome está disponível:

```bash
npm search noodown-express
```

Ou visite: https://www.npmjs.com/package/noodown-express

## Passo 3: Verificar se o nome do pacote está disponível

Se o nome já estiver em uso, você precisará escolher outro nome. Você pode:

1. Verificar disponibilidade no site do npm
2. Ou tentar publicar e ver se recebe um erro

## Passo 4: Compilar o projeto

Certifique-se de que o código TypeScript está compilado:

```bash
npm run build
```

Isso irá:
- Compilar o TypeScript para JavaScript na pasta `dist/`
- Gerar os arquivos de declaração de tipos (`.d.ts`)

Verifique se os arquivos foram gerados corretamente:

```bash
ls dist/
```

Você deve ver pelo menos:
- `index.js`
- `index.d.ts`
- `index.d.ts.map` (opcional, se sourceMap estiver habilitado)

## Passo 5: Testar localmente (Opcional mas recomendado)

Antes de publicar, você pode testar o pacote localmente usando `npm link`:

### Em outro projeto de teste:

```bash
# No diretório do projeto de teste
npm link ../caminho/para/@noodown_express
```

Ou use `npm pack` para criar um tarball e instalá-lo:

```bash
# No diretório do noodown-express
npm pack

# Isso cria um arquivo como: noodown-express-1.0.0.tgz
# No projeto de teste:
npm install ../caminho/para/noodown-express-1.0.0.tgz
```

## Passo 6: Verificar arquivos que serão publicados

O npm publica apenas os arquivos listados no campo `files` do `package.json` ou que não estão no `.npmignore`.

Para ver o que será publicado:

```bash
npm pack --dry-run
```

Isso mostrará uma lista de arquivos que serão incluídos no pacote.

## Passo 7: Publicar no NPM

### Publicação pública (padrão)

```bash
npm publish
```

### Publicação com escopo (se necessário)

Se você quiser publicar com um escopo (ex: `@seu-usuario/noodown-express`):

1. Atualize o `name` no `package.json` para `@seu-usuario/noodown-express`
2. Publique com acesso público:

```bash
npm publish --access public
```

## Passo 8: Verificar publicação

Após a publicação, verifique se o pacote está disponível:

1. Visite: https://www.npmjs.com/package/noodown-express
2. Ou use o comando:

```bash
npm view noodown-express
```

## Atualizando o Pacote

Para publicar uma nova versão:

1. **Atualize a versão** no `package.json` seguindo [Semantic Versioning](https://semver.org/):
   - **PATCH** (1.0.0 → 1.0.1): Correções de bugs
   - **MINOR** (1.0.0 → 1.1.0): Novas funcionalidades (backward compatible)
   - **MAJOR** (1.0.0 → 2.0.0): Mudanças que quebram compatibilidade

2. **Ou use npm version**:

```bash
# Para patch
npm version patch

# Para minor
npm version minor

# Para major
npm version major
```

Isso automaticamente:
- Atualiza a versão no `package.json`
- Cria uma tag Git (se você tiver um repositório Git)
- Cria um commit (se você tiver um repositório Git)

3. **Compile novamente**:

```bash
npm run build
```

4. **Publique**:

```bash
npm publish
```

## Troubleshooting

### Erro: "You do not have permission to publish"

- Verifique se você está logado: `npm whoami`
- Verifique se o nome do pacote não está em uso por outra pessoa
- Se for um pacote com escopo, certifique-se de usar `--access public`

### Erro: "Package name already exists"

- O nome do pacote já está em uso
- Escolha outro nome ou verifique se você é o dono do pacote

### Erro: "Invalid package name"

- O nome do pacote não segue as regras do npm
- Nomes devem ser lowercase, sem espaços, podem ter hífens e underscores

### Erro de compilação TypeScript

- Verifique se todas as dependências estão instaladas: `npm install`
- Verifique se o `tsconfig.json` está correto
- Tente limpar e recompilar: `npm run clean && npm run build`

## Comandos Úteis

```bash
# Ver informações do pacote publicado
npm view noodown-express

# Ver versões publicadas
npm view noodown-express versions

# Ver informações de uma versão específica
npm view noodown-express@1.0.0

# Despublicar uma versão (apenas nas primeiras 72 horas)
npm unpublish noodown-express@1.0.0

# Ver o que será publicado
npm pack --dry-run

# Criar um tarball sem publicar
npm pack
```

## Checklist Final Antes de Publicar

- [ ] Código compilado sem erros (`npm run build`)
- [ ] Testes passando (se houver)
- [ ] README.md completo e atualizado
- [ ] LICENSE presente
- [ ] Versão correta no package.json
- [ ] Nome do pacote verificado e disponível
- [ ] Login no npm realizado (`npm whoami`)
- [ ] Arquivos corretos no `.npmignore`
- [ ] Campo `files` no `package.json` configurado corretamente

## Notas Importantes

1. **Não desfaça publicações** após 72 horas (npm policy)
2. **Use Semantic Versioning** para versionamento
3. **Mantenha o CHANGELOG** atualizado (opcional mas recomendado)
4. **Teste antes de publicar** em um projeto de teste
5. **Verifique o tamanho do pacote** - mantenha-o pequeno incluindo apenas arquivos necessários

