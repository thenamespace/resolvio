# API Documentation

This folder contains the API documentation configuration and endpoints for the Universal Resolution Service.

## Available Endpoints

### Swagger UI
- **URL**: `/api/docs`
- **Description**: Interactive Swagger UI for exploring and testing the API
- **Format**: HTML/JavaScript interface

### OpenAPI JSON Specification
- **URL**: `/api/docs-json`
- **Description**: Complete OpenAPI specification in JSON format
- **Format**: JSON
- **Use Cases**: 
  - Programmatic access to API schema
  - Integration with other tools
  - Code generation
  - API client generation

### Standard OpenAPI JSON
- **URL**: `/api/openapi.json`
- **Description**: Standard OpenAPI specification endpoint (alternative to docs-json)
- **Format**: JSON
- **Use Cases**: Same as above, follows OpenAPI standard naming

### API Information
- **URL**: `/api/docs/info`
- **Description**: Basic information about the API and available documentation endpoints
- **Format**: JSON
- **Use Cases**: Discovery of available documentation formats

## Configuration Files

### `swagger.config.ts`
Contains the Swagger configuration including:
- API title and description
- Version information
- Contact details
- License information
- Server configurations
- Authentication schemes
- API tags

### `ens.endpoints.ts`
Contains comprehensive endpoint definitions for the ENS API including:
- Operation summaries and descriptions
- Parameter documentation
- Query parameter documentation
- Response schemas
- Error response documentation

## Usage Examples

### Get OpenAPI Specification as JSON
```bash
curl -X GET "http://localhost:3000/api/docs-json" \
  -H "Accept: application/json"
```

### Get API Information
```bash
curl -X GET "http://localhost:3000/api/docs/info" \
  -H "Accept: application/json"
```

### Generate Client Code
You can use the JSON specification to generate client code:

```bash
# Using OpenAPI Generator
openapi-generator-cli generate \
  -i http://localhost:3000/api/docs-json \
  -g typescript-fetch \
  -o ./generated-client

# Using Swagger Codegen
swagger-codegen generate \
  -i http://localhost:3000/api/docs-json \
  -l typescript-fetch \
  -o ./generated-client
```

## Integration

The API documentation is automatically generated from:
- Controller decorators (`@ApiOperation`, `@ApiResponse`, etc.)
- DTO decorators (`@ApiProperty`)
- Endpoint definitions in `ens.endpoints.ts`
- Swagger configuration in `swagger.config.ts`

## Customization

To add new endpoints or modify existing ones:
1. Update the endpoint definitions in `ens.endpoints.ts`
2. Apply the decorators in your controller
3. Update the Swagger configuration if needed
4. Rebuild the project

## Notes

- All documentation endpoints include proper cache control headers
- The JSON specification is always up-to-date with the current API
- The documentation automatically reflects changes in your controllers and DTOs 