# Universal Resolutioon Service

A simple-to-use resolution service built to unify all web3 naming services under one API for simple data fetching and resolution (built with [NestJS](https://nestjs.com/)).

## Description

This API is designed to be a universal resolution service that will support multiple naming systems and protocols. Initially, it supports **Ethereum Name Service (ENS)** resolution, with plans to extend support to other naming systems in the future that have proven their resilience in the real world, thoughtful protocol design, and demand and adoption by their ecosystem of apps and end users.

The service provides a unified interface for resolving names across different protocols, making it easier for applications to handle various naming systems without implementing multiple integrations.

## Features

- **ENS Resolution**: Initial support for Ethereum Name Service
- **Extensible Architecture**: Designed to easily add support for other naming systems
- **RESTful API**: Clean, consistent API endpoints
- **TypeScript**: Built with TypeScript for a better developer experience
- **Testing**: Comprehensive test coverage with Jest

## Future Plans

- DNS resolution support
- Custom naming system plugins
- Caching and performance optimizations
- Rate limiting and security features
- Handshake (HNS) resolution
- Solana Name Service
- Sui Name Service

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
``` 

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Endpoints

*Coming soon - API documentation will be added as features are implemented*

## Contributing

This project is in early development. Contributions and suggestions are welcome!

## License

This project is licensed under the MIT License.
