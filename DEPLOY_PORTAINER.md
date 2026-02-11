# Deploy no Portainer - MeAjudeALer

## Pré-requisitos
- Portainer instalado e funcionando
- Git instalado no servidor (ou acesso aos arquivos do projeto)

## Método 1: Usando Docker Compose no Portainer (Recomendado)

### Passo 1: Preparar o Repositório
1. Faça commit e push do código para um repositório Git (GitHub, GitLab, etc.)
   ```bash
   git add .
   git commit -m "Add Docker configuration"
   git push origin main
   ```

### Passo 2: No Portainer
1. Acesse o Portainer
2. Vá em **Stacks** → **Add stack**
3. Escolha **Git Repository**
4. Configure:
   - **Name**: `meajudealear`
   - **Repository URL**: URL do seu repositório
   - **Repository reference**: `refs/heads/main` (ou sua branch)
   - **Compose path**: `docker-compose.yml`
5. Clique em **Deploy the stack**

## Método 2: Upload Manual no Portainer

### Passo 1: No Portainer
1. Acesse o Portainer
2. Vá em **Stacks** → **Add stack**
3. Escolha **Upload**
4. Faça upload do arquivo `docker-compose.yml`
5. Configure o nome: `meajudealear`
6. Clique em **Deploy the stack**

## Método 3: Build Local e Push para Registry

### Passo 1: Build da Imagem
```bash
cd c:\APP\MeAjudeALer
docker build -t meajudealear:latest .
```

### Passo 2: Tag e Push (se usar registry privado)
```bash
docker tag meajudealear:latest seu-registry.com/meajudealear:latest
docker push seu-registry.com/meajudealear:latest
```

### Passo 3: No Portainer
1. Vá em **Containers** → **Add container**
2. Configure:
   - **Name**: `meajudealear`
   - **Image**: `meajudealear:latest` (ou URL do registry)
   - **Port mapping**: `3000:3000`
   - **Volumes**: 
     - Container: `/app/data/texts`
     - Host: `/opt/meajudealear/data/texts` (ou caminho desejado)
   - **Restart policy**: `Unless stopped`
3. Clique em **Deploy the container**

## Configurações Importantes

### Volumes Persistentes
O volume `/app/data/texts` é essencial para manter os textos salvos pelos usuários. Certifique-se de que:
- O diretório no host existe
- Tem permissões adequadas (uid 1001 no container)

### Portas
- Porta padrão: **3000**
- Você pode alterar no `docker-compose.yml` para `"8080:3000"` se preferir

### Variáveis de Ambiente (Opcional)
Adicione no `docker-compose.yml` se necessário:
```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
```

## Verificação

Após o deploy:
1. Acesse `http://seu-servidor:3000`
2. Teste o upload de PDF
3. Teste salvar e carregar textos
4. Verifique os logs no Portainer em **Containers** → `meajudealear` → **Logs**

## Troubleshooting

### Container não inicia
- Verifique os logs no Portainer
- Certifique-se que a porta 3000 não está em uso

### Textos não são salvos (Erro de Permissão)
Se você receber a mensagem "Não foi possível salvar o texto", geralmente é um problema de permissão no volume montado. O container roda com o usuário `nextjs` (UID `1001`).

No servidor onde o Docker está rodando, execute:
```bash
# Vá até a pasta do projeto
sudo chown -R 1001:1001 ./data/texts
sudo chmod -R 755 ./data/texts
```
Isso garante que o usuário de dentro do container tenha permissão de escrita na pasta do host.

### Build falha
- Execute `npm run build` localmente primeiro para verificar erros
- Certifique-se que o `package-lock.json` existe

## Atualização da Aplicação

Para atualizar:
1. No Portainer, vá em **Stacks** → `meajudealear`
2. Clique em **Pull and redeploy**
3. Ou recrie o stack com as novas alterações
