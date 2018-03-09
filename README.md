# fabric-payment-sample-api
## Description
This nodejs application using [fabric node sdk](https://github.com/hyperledger/fabric-sdk-node) provides some REST API endpoints as a gateway of [fabric-payment-sample-chaincode](https://github.com/nmatsui/fabric-payment-sample-chaincode).

## See also
[fabric-payment-sample-chaincode](https://github.com/nmatsui/fabric-payment-sample-chaincode)  
[fabric-payment-sample-docker](https://github.com/nmatsui/fabric-payment-sample-docker)

## Requirement

||version|
|:--|:--|
|nodejs|8.9|
|express|4|
|fabric-ca-client|1.0.2|
|fabric-client|1.0.2|

## How to build
### create api bearer token

```bash
$ ./generate_token.sh
```

### build docker image
```bash
$ docker build -t fabric-payment/api .
```

### run Hyperledger/fabric network
see [fabric-payment-sample-docker](https://github.com/nmatsui/fabric-payment-sample-docker)

## Contribution
1. Fork this project ( https://github.com/nmatsui/fabric-payment-sample-api )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create new Pull Request

## License
[Apache License, Version 2.0](/LICENSE)

## Copyright
Copyright (c) 2018 Nobuyuki Matsui <nobuyuki.matsui@gmail.com>
