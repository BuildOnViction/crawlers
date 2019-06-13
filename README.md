## Installation
```
npm install
```

Update config file:
```
cp ./config/default.json ./config/local.json
// edit local.json file
```

## Run

Make a lot TXs to send TOMO:
```
node cmd.js sendTomo -n 10 your_private_key
```

- `-n`: number of TXs
- `your_private_key`: the wallet, make sure you have some TOMO in the wallet to make TXs
            
