# fabric-payment-sample-api
## Description
This nodejs application using [fabric node sdk](https://github.com/hyperledger/fabric-sdk-node) provides some REST API endpoints as a gateway of [fabric-payment-sample-chaincode](https://github.com/nmatsui/fabric-payment-sample-chaincode).

## Requirement

||version|
|:--|:--|
|nodejs|8.9|
|express|4|
|fabric-ca-client|1.0.2|
|fabric-client|1.0.2|

## Usage
### create api bearer token

```bash
$ ./generate_token.sh
```

### create docker image
```bash
$ docker build -t fabric-payment/api .
```

### run Hyperledger/fabric network
see [fabric-payment-sample-docker](https://github.com/nmatsui/fabric-payment-sample-docker)

## License
[Apache License, Version 2.0](/LICENSE)

## Copyright
Copyright (c) 2018 Nobuyuki Matsui <nobuyuki.matsui@gmail.com>
