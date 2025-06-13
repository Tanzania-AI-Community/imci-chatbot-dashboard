/**
 * System configuration and API endpoint types
 */

export interface ApiEndpoints {
  baseUrl: string;
  paths: {
    flows: string;
    variables: string;
    testing: string;
  };
}
