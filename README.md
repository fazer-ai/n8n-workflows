# n8n-workflows

Catálogo de packs de workflows n8n da fazer.ai. Cada pack é um conjunto de workflows prontos pra resolver uma necessidade concreta: atendente de IA num vertical (corretora de seguros, clínica odontológica, financeira de cobrança, etc.), automação de processo interno, integração entre ferramentas, o que couber.

Os workflows são a "receita" do pack: nodes, conexões, prompts, integrações, tudo escrito em n8n. Quem faz o download, configura credenciais e ativa é o consumidor do catálogo. Hoje o consumidor principal é o plugin [`fazer-ai-atendimento`](https://github.com/fazer-ai/fazer-ai-atendimento) pra packs de atendimento no WhatsApp, mas qualquer ferramenta pode ler o `index.json` e baixar os tarballs.

## O que tem aqui

```text
n8n-workflows/
├── index.json                    # catálogo lido pelos consumidores (gerado por CI)
├── packs/
│   └── <slug>/
│       ├── pack.json             # o que o pack precisa (credenciais, nodes, etc.)
│       ├── workflows/*.json      # os workflows em si
│       └── README.md             # o que esse pack faz, em linguagem de cliente
├── scripts/build_index.mjs       # gera o index.json a partir dos pack.json
└── .github/workflows/            # CI que mantém o index.json atualizado
```

## Convenções

- **Slug do pack**: `kebab-case`, sem acento, nomeia o pack (ex.: `corretora-seguros`, `clinica-odonto`).
- **Versionamento**: cada pack tem sua própria tag `<slug>-v<semver>`. A tag é o que o consumidor usa pra baixar uma versão específica. A CI lê as tags pra preencher `latest_version` no índice.
- **Workflows "clean"**: todo node tem `"credentials": {}` vazio e nenhum ID real. O consumidor casa credenciais por tipo de node usando o `cred_by_type_hint` do `pack.json`.
- **Sentinels**: onde o workflow precisaria de uma URL ou ID específicos do cliente, usamos placeholders que o consumidor substitui na hora da instalação. Cada pack declara os sentinels que usa. Exemplos vindos dos packs de atendimento:
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

## Como os consumidores usam isso

Fluxo geral, usando o plugin `fazer-ai-atendimento` como exemplo concreto:

1. Consumidor baixa `index.json` daqui.
2. Filtra packs pela compatibilidade (campo `min_plugin_version` do índice contra a versão instalada do consumidor).
3. Mostra um menu; usuário escolhe um pack.
4. Consumidor baixa o tarball da tag `<slug>-v<latest_version>` e extrai `packs/<slug>/` pra onde fizer sentido no projeto.
5. Daí cada consumidor segue seu próprio fluxo, consultando o `pack.json` pra saber quais credenciais pedir, quais community nodes instalar etc.

## Licença

Público intencionalmente. Os workflows não contêm segredos, e deixar tudo aberto simplifica distribuição (sem auth, sem rate limit de subscription). Curadoria é só interna fazer.ai por enquanto, contribuições externas não são aceitas.
