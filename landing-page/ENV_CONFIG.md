# Environment Configuration

## API Configuration

The landing page uses environment variables to configure the API endpoint.

### Setup

1. Create a `.env.local` file in the `landing-page` directory (this file is gitignored)
2. Add the following variable:

```env
VITE_API_BASE_URL=https://staging.global-resolver.namespace.ninja
```

### Default Configuration

If no environment variable is set, the application defaults to:
- **API Base URL**: `https://staging.global-resolver.namespace.ninja`

### Usage

The API configuration is managed in `src/config/api.ts` and used throughout the application via the `useResolvio` hook.

### Custom Hook

The `useResolvio` hook (`src/hooks/useResolvio.ts`) provides a clean interface for resolving ENS names:

```typescript
import { useResolvio } from '@/hooks/useResolvio';

const { data, error, loading, resolve } = useResolvio();

// Resolve an ENS name
await resolve('vitalik.eth', {
  includeAddresses: true,
  includeTexts: true,
  includeContenthash: false,
});
```

### Development

For local development with a local API server, create `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

