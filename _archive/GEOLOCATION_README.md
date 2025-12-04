# 🌍 Geolocalização em Tempo Real - Logística de Frigoríficos

## ✨ Nova Funcionalidade Implementada

A página de **Logística de Frigoríficos** agora utiliza **geolocalização em tempo real** para detectar automaticamente a localização do usuário e calcular distâncias precisas até os frigoríficos cadastrados.

## 🎯 Como Funciona

### 1. **Detecção Automática de Localização**
Quando o usuário acessa a aba de Logística:
- O sistema solicita permissão para acessar a localização do dispositivo
- Utiliza a API de Geolocalização do navegador (`navigator.geolocation`)
- Obtém coordenadas GPS precisas (latitude e longitude)
- Atualiza o mapa automaticamente para centralizar na localização atual

### 2. **Cálculo Dinâmico de Distâncias**
- Todas as distâncias são recalculadas baseadas na localização real do usuário
- Utiliza a **Fórmula de Haversine** para cálculo preciso de distância entre coordenadas
- Atualiza automaticamente:
  - Distância em km
  - Tempo estimado de viagem
  - Ordenação dos frigoríficos (do mais próximo ao mais distante)

### 3. **Estados de Loading e Erro**
- **Loading**: Exibe ícone de carregamento enquanto obtém a localização
- **Sucesso**: Mostra "Sua Localização" com coordenadas exatas
- **Erro/Negado**: Usa localização padrão (Goiânia) e informa o usuário

## 🔧 Configurações Técnicas

### Parâmetros de Geolocalização
```typescript
{
    enableHighAccuracy: true,  // Máxima precisão GPS
    timeout: 10000,            // Timeout de 10 segundos
    maximumAge: 0              // Não usar cache
}
```

### Localização Padrão (Fallback)
- **Latitude**: -16.6869
- **Longitude**: -49.2648
- **Cidade**: Goiânia, GO

## 📱 Permissões do Navegador

### Como Permitir Geolocalização

**Chrome/Edge:**
1. Clique no ícone de cadeado/informações na barra de endereços
2. Encontre "Localização"
3. Selecione "Permitir"

**Firefox:**
1. Clique no ícone de informações (i) na barra de endereços
2. Vá em "Permissões"
3. Marque "Permitir" para Localização

**Safari:**
1. Safari > Preferências > Sites > Localização
2. Encontre o site e selecione "Permitir"

## 🎨 Indicadores Visuais

### Ícone de Loading
- Aparece ao lado do título "Logística de Frigoríficos"
- Ícone de `Loader` animado girando
- Cor azul (`text-blue-600`)

### Mensagens de Status
1. **Carregando**: "Obtendo sua localização..."
2. **Sucesso**: "Encontre frigoríficos próximos e planeje suas rotas de transporte"
3. **Erro**: "Não foi possível obter sua localização. Usando localização padrão."

### Marcador no Mapa
- **Verde**: Sua localização atual
- **Popup mostra**:
  - "Sua Localização" ou "Localizando..."
  - "Localização atual" ou "Localização padrão"
  - Coordenadas exatas (4 casas decimais)

## 📊 Recálculo Automático

Quando a localização é obtida, o sistema automaticamente:
1. ✅ Atualiza a posição do marcador verde no mapa
2. ✅ Centraliza o mapa na nova localização
3. ✅ Recalcula distâncias para todos os frigoríficos
4. ✅ Recalcula tempos estimados de viagem
5. ✅ Reordena a lista (mais próximo primeiro)
6. ✅ Atualiza as estatísticas (frigorífico mais próximo, tempo médio)

## 🔐 Segurança e Privacidade

- ✅ A localização é obtida apenas no navegador
- ✅ Nenhum dado é enviado para servidores externos
- ✅ O usuário tem controle total (pode negar permissão)
- ✅ Funciona offline após primeira carga
- ✅ Não armazena histórico de localização

## 🌐 Compatibilidade

### Navegadores Suportados
- ✅ Chrome 50+
- ✅ Firefox 45+
- ✅ Safari 10+
- ✅ Edge 12+
- ✅ Opera 37+

### Dispositivos
- ✅ Desktop (via Wi-Fi/IP)
- ✅ Smartphones (GPS)
- ✅ Tablets (GPS/Wi-Fi)

### Precisão
- **GPS (Mobile)**: 5-10 metros
- **Wi-Fi**: 20-50 metros
- **IP**: 1-5 km

## 🚀 Benefícios da Geolocalização

1. **Precisão**: Distâncias exatas baseadas na localização real
2. **Conveniência**: Não precisa inserir endereço manualmente
3. **Atualização Dinâmica**: Funciona em qualquer lugar
4. **Mobilidade**: Ideal para uso em campo
5. **Otimização**: Encontra o frigorífico mais próximo automaticamente

## 🔄 Fluxo de Funcionamento

```
1. Usuário acessa aba "Logística"
   ↓
2. Sistema solicita permissão de localização
   ↓
3. Usuário permite/nega
   ↓
4a. PERMITIU → Obtém coordenadas GPS
   ↓
   Atualiza mapa e recalcula distâncias
   
4b. NEGOU → Usa localização padrão
   ↓
   Mostra mensagem de erro
   ↓
   Calcula com base em Goiânia
```

## 💡 Dicas de Uso

### Para Melhor Precisão:
1. Use em dispositivos móveis com GPS
2. Ative o GPS do dispositivo
3. Permita acesso à localização
4. Use em áreas abertas (melhor sinal GPS)

### Em Caso de Problemas:
1. Verifique se o GPS está ativado
2. Recarregue a página
3. Limpe o cache do navegador
4. Verifique as permissões do site

## 📈 Estatísticas Atualizadas

Todas as estatísticas são recalculadas em tempo real:
- **Total de Frigoríficos**: Contagem total
- **Mais Próximo**: Menor distância calculada
- **Melhor Preço**: Maior preço por kg
- **Tempo Médio**: Média de todos os tempos estimados

## 🎓 Código de Exemplo

### Função de Cálculo de Distância (Haversine)
```typescript
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
```

## 🔮 Melhorias Futuras

1. **Rastreamento Contínuo**: Atualizar localização em tempo real
2. **Histórico de Localizações**: Salvar locais visitados
3. **Notificações de Proximidade**: Alertar quando próximo a frigorífico
4. **Modo Offline**: Cache de mapas para uso sem internet
5. **Compartilhamento de Localização**: Enviar rota para motorista

---

**Desenvolvido para Agro Inteligente** 🌱
**Versão com Geolocalização em Tempo Real** 📍
