# Corretora de Seguros

Atendente de IA para corretoras de seguros que querem dar vazão no WhatsApp sem contratar mais gente. O cliente manda mensagem, o agente cumprimenta, entende se é seguro de vida ou auto, faz a cotação, envia a proposta, acompanha o follow-up e só chama o corretor quando o lead está quente ou o caso exige decisão humana. Também lida com clientes já ativos: consulta de apólice, emissão, cancelamento, abertura de sinistro e pagamento.

## O que o pack entrega

- **Recepção e qualificação**: o agente conversa com o cliente, identifica o tipo de seguro (vida ou auto) e coleta os dados necessários pra cotar.
- **Cotação**: fluxos separados para vida e auto, cada um com suas regras e formatando a proposta.
- **Proposta e emissão**: envia a proposta pronta pelo WhatsApp; se o cliente aceita, emite a apólice.
- **Pós-venda**: consulta de apólices existentes, cancelamento, abertura de sinistro.
- **Pagamento**: coleta dados de pagamento e conclui a compra.
- **Follow-up automático**: se o cliente some no meio da conversa, o agente volta nele em momentos apropriados.
- **Escalação humana**: quando o caso exige um corretor de verdade, o agente passa o bastão já com o contexto da conversa.

## O que você precisa fornecer

**Obrigatório:**

- Chave da OpenAI (a IA que conversa com o cliente).
- Um número de WhatsApp que o sistema vai operar.

**Opcional:**

- Chave da ElevenLabs, se quiser que o agente responda em áudio quando o cliente mandar áudio.
- Chave da PDFShift, se quiser que as propostas saiam em PDF.

O instalador pergunta sobre cada opcional; recusar desliga só aquela funcionalidade.

## Depois da instalação

Abra o workflow `00. Configurações IA Corretora` no painel do n8n e personalize:

- Nome e contato do corretor humano que vai receber os leads quentes.
- Horário de atendimento da corretora.
- Mensagens de boas-vindas, fora do horário, despedida.
- Regras específicas (faixa etária mínima, tipos de seguro atendidos, regiões).

O canal onde o agente avisa sobre pendências (lead quente, erro, caso que precisa de humano) é configurado de forma interativa durante a instalação: o instalador pede pra você mandar uma mensagem de teste e usa essa conversa como canal de alerta.

## Como instalar

Esse pack é distribuído pelo plugin [`fazer-ai-atendimento`](https://github.com/fazer-ai/fazer-ai-atendimento). Rode `/fazer-ai-atendimento` no Claude Code, escolha "catálogo fazer.ai" na primeira pergunta e selecione **Corretora de Seguros** no menu. O plugin cuida do resto: baixa os workflows, configura as credenciais e deixa tudo rodando na sua VPS.
