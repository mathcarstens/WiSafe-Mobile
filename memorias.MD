# memorias.MD

## Atualizacao implementada em 25/05/2026

Foram aplicadas melhorias depois do teste do APK:

- Ao tentar conectar em rede de risco medio ou alto, o app agora mostra um aviso em duas etapas antes de continuar.
- A opcao de telefone foi removida do cadastro, edicao, conta e armazenamento local.
- O botao Escanear agora pede uma nova varredura em vez de depender de fechar e abrir o app.
- O app salva o login quando "Lembrar de mim" esta marcado e entra direto na tela de redes ao abrir novamente.
- O logout limpa o usuario salvo e volta para a tela inicial com carrossel e criar conta.
- A tela inicial de redes mostra "Bem-vindo, nome" acima de "Redes disponiveis".
- O bug de selecionar uma rede e aparecer indisponivel foi reduzido usando cache da ultima varredura antes de fazer novo scan.
- O icone nativo do Android passou a apontar para a imagem wifi-protect.jpeg convertida para recurso drawable.
- A tela de recuperar senha passou a usar o mesmo AppHeader das demais telas.

## Ideia central do projeto

O projeto é um aplicativo mobile de segurança em redes Wi-Fi.

A ideia é ter uma seção chamada "Redes" que funcione de forma parecida com a tela de Wi-Fi do próprio celular: quando a pessoa estiver em casa, aparecem as redes disponíveis em casa; quando estiver na faculdade, aparecem as redes disponíveis naquele local.

O objetivo não é apenas mostrar uma interface fixa. O aplicativo deve fazer uma varredura real das redes Wi-Fi próximas usando recurso nativo do Android.

## Situação atual do projeto

- As telas já foram iniciadas em React/TypeScript.
- O projeto atual parece estar em Expo/React Native.
- Já existe protótipo/estrutura visual com cards de redes.
- A tela de redes mostra exemplos de redes, risco e segurança.
- O problema identificado é que o Expo Go não consegue acessar a varredura real de Wi-Fi do celular.

## Decisão técnica principal

Para o app funcionar como uma tela real de redes Wi-Fi, será necessário usar acesso nativo Android.

Caminho recomendado:

React Native + TypeScript para a interface
+
Módulo nativo Android em Kotlin ou Java para escanear redes Wi-Fi
+
Celular Android físico para teste

Não depender do Expo Go para a funcionalidade principal de Wi-Fi.

## Por que não usar apenas Expo Go

O Expo Go não dá acesso direto às APIs nativas avançadas de Wi-Fi necessárias para listar redes próximas.

Ele serve para testar telas, navegação, botões e lógica visual, mas não para a função principal do projeto: buscar redes reais disponíveis no local.

## Recurso nativo usado

O recurso nativo principal será a varredura de redes Wi-Fi do Android.

No Android, a API usada para isso é o WifiManager.

A lógica geral é:

1. O app solicita permissões necessárias.
2. O app inicia uma varredura de Wi-Fi.
3. O Android retorna uma lista de redes encontradas.
4. O app transforma esses dados em cards visuais.
5. O usuário vê o nome da rede, tipo de segurança, intensidade de sinal e nível de risco.

## Informações que uma rede deve ter no app

Cada rede pode virar um objeto com estes campos:

```ts
type WifiNetwork = {
  ssid: string;
  bssid: string;
  level: number;
  frequency: number;
  capabilities: string;
  securityType: "OPEN" | "WEP" | "WPA" | "WPA2" | "WPA3" | "UNKNOWN";
  riskLevel: "SAFE" | "MEDIUM" | "HIGH";
  signalLabel: "Fraco" | "Médio" | "Forte";
  isFavorite: boolean;
};
```

## Informações que devem aparecer na Tela 3: Lista de Redes

A tela principal de redes deve mostrar cards simples e objetivos.

Cada card deve exibir:

- Nome da rede
- Tipo de segurança
- Nível de risco
- Intensidade do sinal
- Ícone visual de Wi-Fi/cadeado
- Botão de favorito

Exemplos:

Rede segura:
Casa_Heloisa
WPA2 • Seguro
Sinal forte

Rede de médio risco:
Cafe_Clientes
WPA/WEP • Médio risco
Sinal médio

Rede perigosa:
Free_Public
Aberta • Alto risco
Sinal forte

## Regra lógica para classificar risco

A classificação pode seguir esta regra simples:

- OPEN: alto risco
- WEP: médio ou alto risco
- WPA: médio risco
- WPA2: seguro
- WPA3: seguro
- UNKNOWN: médio risco

Sugestão de função:

```ts
function classifyRisk(securityType: string) {
  if (securityType === "OPEN") return "HIGH";
  if (securityType === "WEP") return "MEDIUM";
  if (securityType === "WPA") return "MEDIUM";
  if (securityType === "WPA2") return "SAFE";
  if (securityType === "WPA3") return "SAFE";
  return "MEDIUM";
}
```

## Regra lógica para identificar tipo de segurança

O Android retorna uma string chamada capabilities.

Exemplos possíveis:

- [WPA2-PSK-CCMP][ESS]
- [WPA3-SAE-CCMP][ESS]
- [WEP][ESS]
- [ESS]

Regra sugerida:

```ts
function getSecurityType(capabilities: string) {
  if (!capabilities || capabilities === "[ESS]") return "OPEN";
  if (capabilities.includes("WEP")) return "WEP";
  if (capabilities.includes("WPA3")) return "WPA3";
  if (capabilities.includes("WPA2")) return "WPA2";
  if (capabilities.includes("WPA")) return "WPA";
  return "UNKNOWN";
}
```

## Regra lógica para intensidade do sinal

O Android retorna o sinal em RSSI, geralmente um número negativo.

Regra simples:

- Maior que -60: forte
- Entre -60 e -75: médio
- Menor que -75: fraco

Sugestão:

```ts
function getSignalLabel(level: number) {
  if (level >= -60) return "Forte";
  if (level >= -75) return "Médio";
  return "Fraco";
}
```

## Tela de detalhes da rede

Ao clicar em uma rede, abrir uma tela de detalhes.

Ela pode mostrar:

- Nome da rede
- Tipo de segurança
- Nível de risco
- Intensidade do sinal
- BSSID
- Frequência
- Aviso de segurança
- Botão "Marcar como confiável"
- Botão "Voltar"

Não colocar informações técnicas demais na lista principal. Informações como BSSID, frequência e IP devem ficar na tela de detalhes.

## Avisos de segurança

Médio risco:

"Esta rede possui segurança limitada. Evite acessar dados sensíveis."

Alto risco:

"Esta rede não é segura. Seus dados podem ser interceptados. Evite acessar contas, bancos ou informações pessoais."

Botões sugeridos:

- Cancelar
- Entendi o risco
- Marcar como confiável

## Tela de favoritos

A tela de favoritos deve listar redes marcadas pelo usuário.

No app funcional, isso não deve ser simulado por telas duplicadas. Deve ser salvo em armazenamento local.

Fluxo:

1. Usuário toca no botão de favorito em uma rede.
2. O app salva essa rede no armazenamento local.
3. A tela de favoritos lê o armazenamento local.
4. A rede aparece na tela de favoritos.
5. Se o usuário desfavoritar, o app remove do armazenamento.
6. A tela atualiza a lista.

## Armazenamento local

Para React Native, usar AsyncStorage ou outra solução local.

Dados que podem ser salvos:

- Usuário logado
- Redes favoritas
- Configurações do usuário
- Histórico de redes analisadas

Exemplo de chave:

```ts
const FAVORITES_KEY = "@wisafe:favorites";
```

## Controle de acesso

O app precisa ter alguma forma de controle de acesso.

Pode ser simples:

- Tela de login com nome/e-mail
- Campo de senha opcional
- Checkbox "lembrar de mim"
- Salvar usuário localmente

Não precisa backend obrigatório para o trabalho, se o professor aceitar controle local.

## Fluxo de telas recomendado

Tela 1: Inicial
- Nome do app
- Frase curta
- Botão começar

Tela 2: Login
- Nome ou e-mail
- Senha opcional
- Checkbox lembrar de mim
- Botão entrar

Tela 3: Redes
- Lista de redes disponíveis no local
- Botão escanear novamente
- Cards com segurança, risco e sinal

Tela 4: Detalhes da Rede
- Dados completos da rede
- Avisos de segurança
- Favoritar/desfavoritar

Tela 5 opcional: Favoritos
- Lista de redes salvas pelo usuário

Tela 6 opcional: Configurações
- Alertas
- Tema
- Sobre o app

## Passos contínuos a partir do estado atual

### Etapa 1 — Organizar o projeto atual

1. Verificar se o projeto é Expo ou React Native CLI.
2. Confirmar se existe pasta android/.
3. Confirmar se o app roda pelo menos com dados simulados.
4. Separar telas em arquivos organizados:
   - HomeScreen.tsx
   - LoginScreen.tsx
   - NetworksScreen.tsx
   - NetworkDetailsScreen.tsx
   - FavoritesScreen.tsx

### Etapa 2 — Criar um modelo de dados único

Criar um tipo WifiNetwork.

Toda tela deve usar esse mesmo tipo de dado.

Isso evita bagunça e facilita trocar mock por dados reais depois.

### Etapa 3 — Manter mock temporário

Antes de integrar Wi-Fi real, manter uma lista mockada.

Isso permite testar:

- Layout
- Navegação
- Favoritos
- Detalhes
- Classificação de risco

A lógica do app deve funcionar primeiro com mock.

### Etapa 4 — Criar serviço de redes

Criar um arquivo responsável por buscar redes.

Exemplo:

src/services/wifiService.ts

Ele deve ter uma função:

```ts
async function scanWifiNetworks(): Promise<WifiNetwork[]> {
  // por enquanto retorna mock
  // depois chama módulo nativo Android
}
```

Essa camada é importante para não misturar interface com lógica nativa.

### Etapa 5 — Criar módulo nativo Android

Depois que a UI estiver funcionando, criar o módulo nativo.

Esse módulo deve:

- Solicitar/validar permissões
- Usar WifiManager
- Executar scan
- Retornar lista de redes para o React Native

### Etapa 6 — Ligar React Native com Android nativo

O React Native chama a função nativa.

Fluxo:

NetworksScreen.tsx
→ wifiService.ts
→ NativeModules.WifiScanner
→ Kotlin/Java Android
→ WifiManager
→ lista de redes
→ volta para o React Native
→ renderiza cards

### Etapa 7 — Testar no celular real

O teste real precisa ser feito em celular Android físico.

O emulador pode testar interface, mas não é confiável para listar redes Wi-Fi reais do ambiente.

### Etapa 8 — Tratar permissões

Antes de escanear:

- Pedir permissão de localização quando necessário
- Pedir permissão de Wi-Fi próximo em Android 13+
- Verificar se localização do aparelho está ligada
- Mostrar mensagem caso falte permissão

Mensagem sugerida:

"Para listar redes próximas, o app precisa de permissão de localização e acesso a Wi-Fi. Isso é exigido pelo Android para proteger a privacidade do usuário."

### Etapa 9 — Atualização da lista

A tela de redes deve ter um botão:

"Escanear novamente"

Fluxo:

1. Usuário clica.
2. App chama scanWifiNetworks().
3. Mostra loading.
4. Atualiza lista.
5. Exibe erro se não conseguir.

### Etapa 10 — Preparar plano B

Se a integração nativa atrasar, manter mock funcional e explicar tecnicamente:

"No protótipo, a lista foi simulada. Na versão funcional Android, a lista será obtida pelo WifiManager."

Mas o objetivo final deve ser scan real no celular.

## Riscos do projeto

- Expo Go não permite a função principal.
- Emulador não lista redes reais.
- Android exige permissões específicas.
- Android pode limitar a frequência de varreduras.
- Algumas versões de Android podem retornar lista vazia se localização estiver desligada.

## Prioridade do desenvolvimento

Ordem recomendada:

1. Garantir que o app abre.
2. Garantir navegação entre telas.
3. Garantir lista de redes com mock.
4. Garantir detalhes da rede.
5. Garantir favoritos com armazenamento local.
6. Garantir login simples.
7. Integrar módulo nativo de Wi-Fi.
8. Testar em celular real.
9. Melhorar visual.
10. Preparar apresentação.

## Frases úteis para apresentação

"O app utiliza o recurso nativo de Wi-Fi do Android para listar redes disponíveis no ambiente."

"A análise de risco considera o tipo de criptografia da rede, como redes abertas, WEP, WPA, WPA2 e WPA3."

"O objetivo é alertar o usuário antes da conexão, principalmente em locais públicos."

"Redes abertas ou com criptografia fraca são classificadas como risco médio ou alto."

"No protótipo, algumas redes foram simuladas para validar a interface. Na versão funcional, a coleta será feita com a API nativa do Android."

## Nome provisório do app

WiSafe

## Frase da tela inicial

"Saiba se o Wi-Fi é seguro antes de conectar."

## Regra visual

- Verde: seguro
- Amarelo: médio risco
- Vermelho: alto risco

## Lembrete final

Não deixar a lógica espalhada em várias telas.

Separar em:

- types/
- services/
- screens/
- components/
- storage/
- native/

A tela deve apenas mostrar dados.
A lógica de Wi-Fi deve ficar no service.
A lógica nativa deve ficar no Android.
A lógica de favorito deve ficar no storage.
