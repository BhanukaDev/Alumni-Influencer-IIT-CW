import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alumni Influencer Platform API',
      version: '1.0.0',
      description: 'API for the Alumni Influencer platform with bidding, profiles, and developer API access',
      contact: {
        name: 'Support',
        email: 'support@alumni-platform.local',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['alumni', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            userId: { type: 'number' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            bio: { type: 'string' },
            linkedinUrl: { type: 'string' },
            imageUrl: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Campaign: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            userId: { type: 'number' },
            topic: { type: 'string' },
            budget: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Bid: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            campaignId: { type: 'number' },
            bidderId: { type: 'number' },
            amount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiKey: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            label: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
            revokedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        FeaturedAlumnus: {
          type: 'object',
          properties: {
            userId: { type: 'number' },
            name: { type: 'string' },
            bio: { type: 'string', nullable: true },
            linkedinUrl: { type: 'string', nullable: true },
            imageUrl: { type: 'string', nullable: true },
            windowDate: { type: 'string', format: 'date' },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Bearer token for API key authentication',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'sid',
          description: 'Session ID cookie for authenticated users',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Profile', description: 'User profile management' },
      { name: 'Bidding', description: 'Campaign bidding system' },
      { name: 'Developer', description: 'API key management for developers' },
      { name: 'Public', description: 'Public API endpoints' },
    ],
  },
  apis: [
    './src/routes/auth.ts',
    './src/routes/profile.ts',
    './src/routes/bidding.ts',
    './src/routes/developer.ts',
    './src/routes/public.ts',
  ],
}

export const swaggerSpec = swaggerJsdoc(options)
