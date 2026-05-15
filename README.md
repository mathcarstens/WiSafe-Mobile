# WiSafe

WiSafe é um aplicativo mobile pensado para ajudar o usuário a avaliar redes Wi-Fi antes de se conectar. A ideia é simples: mostrar as redes próximas, indicar o tipo de segurança de cada uma e avisar quando uma rede pode oferecer risco.

O projeto foi desenvolvido com React Native, TypeScript e Expo, mas a parte principal de leitura das redes Wi-Fi depende de código nativo Android. Isso acontece porque o Expo Go não permite acessar diretamente algumas APIs avançadas do Android, como a varredura real de redes próximas.

## Objetivo

O objetivo do app é funcionar de forma parecida com a tela de Wi-Fi do celular. Quando o usuário estiver em casa, o app deve listar redes daquele ambiente. Quando estiver na faculdade, deve listar as redes disponíveis naquele local.

Além de mostrar o nome da rede, o app também classifica o risco com base no tipo de proteção usado:

- Redes abertas são consideradas de alto risco.
- Redes WEP ou WPA são tratadas como risco médio.
- Redes WPA2 e WPA3 são consideradas mais seguras.
- Redes desconhecidas ficam como risco médio.

Essa análise não substitui uma auditoria de segurança completa, mas serve como um alerta rápido para o usuário evitar conexões perigosas, principalmente em locais públicos.

## Tecnologias usadas

- React Native para a interface mobile.
- TypeScript para deixar os dados e funções mais organizados.
- Expo Router para navegação entre telas.
- React Native Paper para componentes visuais.
- AsyncStorage para salvar dados locais, como favoritos e usuário lembrado.
- Kotlin no Android para acessar o `WifiManager`.
- Android Studio para compilar e testar o app nativo.

## Por que existe código nativo Android?

No Android, a lista de redes Wi-Fi próximas vem de uma API chamada `WifiManager`. Ela é uma API nativa do sistema, ou seja, não está disponível livremente dentro do Expo Go.

Por isso, o projeto usa dois caminhos:

1. No Expo Go ou em ambiente sem módulo nativo, o app usa redes simuladas.
2. No Android nativo, o app chama um módulo Kotlin chamado `WifiScanner`, que usa o `WifiManager` para buscar redes reais.

Esse formato ajuda no desenvolvimento, porque a interface pode ser testada com dados simulados enquanto a integração nativa é preparada para o celular físico.

## Funcionalidades

O app possui as seguintes partes principais:

- Tela inicial com nome e chamada do aplicativo.
- Login simples com nome ou e-mail.
- Opção de lembrar usuário localmente.
- Tela de redes disponíveis.
- Botão para escanear novamente.
- Cards com nome da rede, segurança, risco e intensidade do sinal.
- Tela de detalhes da rede.
- Avisos de segurança para redes de médio ou alto risco.
- Favoritos salvos no armazenamento local.

## Como a análise funciona

O Android retorna uma informação chamada `capabilities`. Ela descreve a proteção da rede, por exemplo:

```text
[WPA2-PSK-CCMP][ESS]
[WPA3-SAE-CCMP][ESS]
[WEP][ESS]
[ESS]
```

O app lê esse texto e transforma em um tipo mais simples:

```ts
OPEN | WEP | WPA | WPA2 | WPA3 | UNKNOWN
```

Depois disso, o risco é definido:

```text
OPEN    -> Alto risco
WEP     -> Médio risco
WPA     -> Médio risco
WPA2    -> Seguro
WPA3    -> Seguro
UNKNOWN -> Médio risco
```

A intensidade do sinal usa o valor RSSI, que normalmente é um número negativo:

```text
Maior ou igual a -60 -> Forte
Entre -60 e -75     -> Médio
Menor que -75       -> Fraco
```

## Estrutura do projeto

A lógica foi separada para evitar que tudo fique misturado dentro das telas:

```text
app/
  Rotas usadas pelo Expo Router

src/components/
  Componentes reutilizáveis, como header e card de rede

src/screens/
  Telas principais do aplicativo

src/services/
  Regras de segurança e serviço de busca de redes Wi-Fi

src/storage/
  Salvamento local de favoritos e usuário

src/types/
  Tipos TypeScript compartilhados

android/
  Projeto nativo Android e módulo Kotlin de Wi-Fi
```

O ponto mais importante é que a tela apenas mostra os dados. A busca das redes fica no serviço, os favoritos ficam no storage e o acesso real ao Wi-Fi fica no Android.

## Modelo de dados

Cada rede é tratada pelo app como um objeto `WifiNetwork`:

```ts
type WifiNetwork = {
  ssid: string;
  bssid: string;
  level: number;
  frequency: number;
  capabilities: string;
  securityType: "OPEN" | "WEP" | "WPA" | "WPA2" | "WPA3" | "UNKNOWN";
  riskLevel: "SAFE" | "MEDIUM" | "HIGH";
  signalLabel: "Fraco" | "Medio" | "Forte";
  isFavorite: boolean;
};
```

Usar um tipo único evita bagunça no código e facilita trocar dados simulados por dados reais.

## Como rodar o projeto

Instale as dependências:

```bash
npm install
```

Para abrir o Metro/Expo:

```bash
npm start
```

Para rodar como app Android nativo:

```bash
npm run android
```

Também é possível abrir a pasta `android` no Android Studio:

```text
C:\Users\quele\Documents\Mobile\Projeto-Final-Mobile\android
```

No Android Studio, selecione um celular físico ou emulador e clique em Run.

## Teste em celular físico

Para testar a varredura real de redes Wi-Fi, o ideal é usar um celular Android físico. O emulador pode abrir a interface, mas não é confiável para listar redes reais do ambiente.

Também é importante manter estas permissões ativas:

- Localização.
- Acesso ao Wi-Fi.
- Permissão de dispositivos Wi-Fi próximos em Android 13 ou superior.

O Android exige essas permissões porque a lista de redes próximas pode revelar informações sobre a localização do usuário.

## Expo Go e plano B

O Expo Go é útil para testar telas, navegação e comportamento visual. Porém, ele não consegue executar o módulo nativo Kotlin criado para acessar o `WifiManager`.

Por isso, quando o módulo nativo não está disponível, o app mantém uma lista simulada. Isso permite apresentar e testar:

- Layout dos cards.
- Navegação entre telas.
- Tela de detalhes.
- Favoritos.
- Classificação de risco.

Na versão nativa Android, a lista deve vir do `WifiManager`.

## Cores de risco

O app usa cores simples para facilitar a leitura:

- Verde: rede segura.
- Amarelo: risco médio.
- Vermelho: alto risco.

Essa escolha ajuda o usuário a entender rapidamente quais redes merecem mais atenção.

## Frase de apresentação

O WiSafe utiliza recursos nativos do Android para listar redes Wi-Fi disponíveis no ambiente e classificar o risco de cada rede com base no tipo de criptografia. O objetivo é alertar o usuário antes da conexão, principalmente em redes públicas ou com proteção fraca.
