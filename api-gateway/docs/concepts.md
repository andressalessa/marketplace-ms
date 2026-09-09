# Padrão: Event Sourcing

Guarda o item e a ação realizada no item

## Tabela -> Colunas
```
EventStore -> StreamId | Version | EventType    | Payload(JSON)                                     | OccurredOn
               cart-1  |    1    | CartCreated  | {"customerId": "joao-01"}                         |   10:00
               cart-1  |    2    | ItemAdded    | {"productId": "banana", "qtd": 1, "price": 5.00}  |   10:01
               cart-1  |    3    | ItemAdded    | {"productId": "leite", "qtd": 1, "price": 4.00}   |   10:04
               cart-1  |    4    | ItemRemoved  | {"productId": "leite", "qtd": 1}                  |   10:10
```

O nome da tabela pode ser escolhido (ex.: PaymentsStore, etc)

Quando usar? 
Histórico é importante

Quando não usar?
- Sistema simples
- Só estado atual importa
- Velocidade de leitura importa

## 4 razões de importância do event sourcing em uma arquitetura de microserviços
1. A solução para o pesadelo das transações distribuídas
2. Desacoplamento Real (a "cola" assíncrona)
3. Auditoria e debugging em um sistema distribuído
4. Habilita CQRS (segregação de comando e consulta) para performance e escalabilidade 

## Bons vídeos explicando
- https://www.youtube.com/watch?v=0B20k31Gyq0&pp=ygUlZXZlbnQgc291cmNpbmcgZGUgdmVyZGFkZSBuYSBwcsOhdGljYQ%3D%3D

### CQRS
Command query responsability segregation

```
 tradicional  |     CQRS
 ___________  |  ___________
|           | | |           |
|           | | |  escrita  | - fonte de verdade -> banco de dados relacinoal
|  escrita  | | |___________|
|           | | 
|     e     | |    broker -> Eventos (rabbitMQ) | event handler
|  leitura  | |  ___________ 
|           | | |           |
|           | | |  leitura  | - foco em velocidade -> noSQL (dados desnormalizados)
|___________| | |___________|
```
