# n8n-workflows

Catálogo de atendentes de IA prontos da fazer.ai. Cada pack é um agente completo para um nicho (corretora de seguros, clínica odontológica, financeira de cobrança, etc.) que o cliente instala com um comando no Claude Code e começa a atender no WhatsApp.

Os workflows aqui são a "receita" de cada agente: conversa, cotação, follow-up, integração com CRM, tudo escrito em n8n. Quem faz o download, configura credenciais e ativa é o plugin [`fazer-ai-atendimento`](https://github.com/fazer-ai/fazer-ai-atendimento); este repo é só a fonte do conteúdo.

## O que tem aqui

```text
n8n-workflows/
├── index.json                    # catálogo lido pelo plugin (gerado por CI)
├── packs/
│   └── <slug>/
│       ├── pack.json             # o que o pack precisa (credenciais, nodes, etc.)
│       ├── workflows/*.json      # os workflows em si
│       └── README.md             # o que esse pack faz, em linguagem de cliente
├── scripts/build_index.mjs       # gera o index.json a partir dos pack.json
└── .github/workflows/            # CI que mantém o index.json atualizado
```

## Convenções

- **Slug do pack**: `kebab-case`, sem acento, nomeia o vertical (ex.: `corretora-seguros`, `clinica-odonto`).
- **Versionamento**: cada pack tem sua própria tag `<slug>-v<semver>`. A tag é o que o plugin usa pra baixar uma versão específica. A CI lê as tags pra preencher `latest_version` no índice.
- **Workflows "clean"**: todo node tem `"credentials": {}` vazio e nenhum ID real. O plugin do cliente casa as credenciais por tipo de node usando o `cred_by_type_hint` do `pack.json`.
- **Sentinels**: onde o workflow precisaria de uma URL ou ID específicos do cliente, usamos placeholders que o plugin substitui na hora da instalação:
  - `<SUA URL N8N>` e `<SUA URL CHATWOOT>` para URLs.
  - `<SELECIONE SUA CONTA>` e `<SELECIONE SUA INBOX>` para IDs do Chatwoot.

Nunca commitar URL, ID ou chave real. Se um workflow tem dado específico de cliente, a gente troca por sentinel antes de subir.

## Como adicionar um pack novo

1. Criar `packs/<slug>/` com `pack.json`, `workflows/*.json` e `README.md`. Usar `packs/corretora-seguros/` como referência.
2. Abrir PR contra `main`. Ao merge, a CI regenera o `index.json` sozinha.
3. Quando o pack estiver pronto pra release, criar e pushar a tag:

   ```bash
   git tag corretora-seguros-v0.1.0
   git push origin corretora-seguros-v0.1.0
   ```

   A CI dispara de novo e atualiza o `latest_version` no índice.

A `version` dentro do `pack.json` precisa bater com a tag git.

## Como o plugin usa isso

Quando o cliente roda `/fazer-ai-atendimento` e escolhe "catálogo fazer.ai":

1. Plugin baixa `index.json` daqui.
2. Filtra packs que exigem uma versão mais nova do plugin do que a instalada.
3. Mostra um menu; cliente escolhe um.
4. Plugin baixa o tarball da tag `<slug>-v<latest_version>` e extrai `packs/<slug>/` pra `./workflows/` no projeto do cliente.
5. Daí o plugin segue o fluxo normal, consultando o `pack.json` pra saber quais credenciais pedir e quais community nodes instalar.

## Licença

Público por desenho. Os workflows não contêm segredos, e deixar tudo aberto simplifica distribuição (sem auth, sem rate limit de subscription). Curadoria é só interna fazer.ai por enquanto, contribuições externas não são aceitas.
