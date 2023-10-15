# ICP CRUD Quote Management Canister

## Features
1. Register as quote collector (cannot register twice)
2. Anyone can upload new author information (name, year of birth)
3. Upload quote (quote's content, author of quote)
4. Update quote (only collector of the quote can update)
5. Delete quote (only collector of the quote can delete)
6. View methods (list authors, list collectors, list quotes, list quotes by specific collector/author, search quote by quote id, search quote by author's name, search quotes by collector's id)

## Deploy Canister
```bash
dfx start --background --clean
dfx deploy
```

## Command

### Register as new quote collector
```bash
dfx canister call quote_manage registerCollector '(record {"collectorName"="dacade"})'
```

### Update collector info (only collector can update his info)
```bash
dfx canister call quote_manage updateCollector '("e4a9e876-4795-460b-bef8-c78a47da9728", record {"collectorName"="dacade2"})'
```

### Create author info
```bash
dfx canister call quote_manage createAuthor '(record {"name"="TestAuthor"; "birthYear"=1998})'
```

### Upload quote
```bash
dfx canister call quote_manage uploadQuote '(record {"content"="Quote Content Sample"; "authorId"="73afb29b-65de-4e05-93e6-a73c96b414ad"; "collectorId"="e4a9e876-4795-460b-bef8-c78a47da9728"})'
```

### Update quote (only quote's collector can call this function)
```bash
dfx canister call quote_manage updateQuote '("69d4c890-6f45-402e-93aa-9fd0fc0ee2cf", record {"content"="Quote Content Updated"; "authorId"="73afb29b-65de-4e05-93e6-a73c96b414ad"; "collectorId"="e4a9e876-4795-460b-bef8-c78a47da9728"})'
```

### Delete quote (only quote's collector can call this function)
```bash
dfx canister call quote_manage deleteQuote '("69d4c890-6f45-402e-93aa-9fd0fc0ee2cf")'
```

### View methods
```bash
dfx canister call quote_manage getAuthors '()'
dfx canister call quote_manage getCollectors '()'
dfx canister call quote_manage getQuotes '()'
dfx canister call quote_manage getQuotesByCurrentUser '()'
dfx canister call quote_manage getQuotesByCurrentUser '()'
dfx canister call quote_manage getCollector '("e4a9e876-4795-460b-bef8-c78a47da9728")'
dfx canister call quote_manage getAuthor '("73afb29b-65de-4e05-93e6-a73c96b414ad")'
dfx canister call quote_manage getQuoteById '("69d4c890-6f45-402e-93aa-9fd0fc0ee2cf")'
dfx canister call quote_manage getQuotesByCollectorId '("e4a9e876-4795-460b-bef8-c78a47da9728")'
dfx canister call quote_manage getQuotesByAuthorId '("73afb29b-65de-4e05-93e6-a73c96b414ad")'
dfx canister call quote_manage getQuotesByAuthorName '("TestAuthor")'
```

## Stop dfx
```bash
dfx stop
```