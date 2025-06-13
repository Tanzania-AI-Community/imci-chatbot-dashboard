# IMCI Flow API Documentation

## Overview

The IMCI Flow API provides access to published flow versions with complete data including nodes, variables, conditions, diagnoses, medications, and advice. The API requires authentication via API key.

## Endpoint

```
GET /api/flows
```

## Authentication

The API uses Bearer token authentication. Include your API key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY
```

### Setting up API Key

1. Navigate to `/dashboard/settings` in your application
2. Enter your desired API key in the "API Settings" section
3. Save the configuration
4. The API key will be encrypted and stored securely

### Environment Variables

Add the following environment variable to your `.env` file:

```bash
API_ENCRYPTION_KEY=your-32-character-minimum-encryption-key-here
```

**Important**: The encryption key must be at least 32 characters long and should be kept secure.

## Request Example

```bash
curl -X GET "http://localhost:3000/api/flows" \
  -H "Authorization: Bearer your-api-key-here" \
  -H "Content-Type: application/json"
```

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "meta": {
        "id": "flow-uuid",
        "name": "Flow Name",
        "description": null,
        "status": "published",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": null
      },
      "version": {
        "id": "version-uuid",
        "number": 1,
        "status": "published",
        "created_at": "2024-01-01T00:00:00.000Z",
        "published_at": "2024-01-01T00:00:00.000Z"
      },
      "entry_conditions": [],
      "variables": [
        {
          "id": "variable-uuid",
          "name": "age",
          "type": "number",
          "description": "Patient age",
          "default_value": null,
          "is_global": false
        }
      ],
      "diagnoses": [
        {
          "id": "diagnosis-uuid",
          "name": "Pneumonia",
          "description": "Respiratory infection",
          "conditions": [
            {
              "id": "condition-uuid",
              "operator": "greater_than",
              "value": 38,
              "logical_operator": "AND",
              "variable_id": "temperature-variable-uuid"
            }
          ],
          "medications": [
            {
              "id": "medication-uuid",
              "name": "Amoxicillin",
              "dosage": "250mg twice daily",
              "duration": "7 days",
              "instructions": "Take with food"
            }
          ],
          "advice": [
            {
              "id": "advice-uuid",
              "content": "Monitor temperature closely",
              "category": "warning",
              "priority": 0
            }
          ]
        }
      ],
      "nodes": [
        {
          "id": "node-uuid",
          "type": "question",
          "content": {
            "text": "What is the patient's temperature?",
            "options": [
              {
                "text": "Less than 38°C",
                "variables": [
                  {
                    "id": "temperature",
                    "value": 37
                  }
                ]
              }
            ]
          },
          "next": "next-node-uuid",
          "conditions": [],
          "variables": []
        }
      ],
      "conditions": [
        {
          "id": "condition-uuid",
          "operator": "equals",
          "value": "yes",
          "logical_operator": null,
          "variable_id": "fever-variable-uuid",
          "type": "entry",
          "reference_id": null
        }
      ]
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "total_flows": 1
}
```

### Error Responses

#### 401 Unauthorized - Missing/Invalid API Key

```json
{
  "error": "Missing or invalid authorization header"
}
```

```json
{
  "error": "Invalid API key"
}
```

#### 500 Internal Server Error - Configuration Issues

```json
{
  "error": "API key not configured"
}
```

```json
{
  "error": "Failed to fetch flow data"
}
```

## Data Structure

The API returns an array of flow objects, each containing:

### Meta Information

- `id`: Flow UUID
- `name`: Flow name
- `description`: Flow description (may be null)
- `status`: Flow status ("published" for API results)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp (may be null)

### Version Information

- `id`: Version UUID
- `number`: Version number (integer)
- `status`: Version status ("published" for API results)
- `created_at`: Version creation timestamp
- `published_at`: Publication timestamp

### Flow Components

#### Variables

Array of variables used in the flow:

- `id`: Variable UUID
- `name`: Variable name
- `type`: Data type ("string", "number", "boolean")
- `description`: Variable description
- `default_value`: Default value
- `is_global`: Whether the variable is global

#### Diagnoses

Array of possible diagnoses:

- `id`: Diagnosis UUID
- `name`: Diagnosis name
- `description`: Diagnosis description
- `conditions`: Array of diagnostic conditions
- `medications`: Array of prescribed medications
- `advice`: Array of advice items

#### Nodes

Array of flow nodes (questions, decisions):

- `id`: Node UUID
- `type`: Node type ("question", etc.)
- `content`: Node content (questions, options)
- `next`: Next node ID
- `conditions`: Node-specific conditions
- `variables`: Node-specific variables

#### Conditions

Array of flow conditions:

- `id`: Condition UUID
- `operator`: Comparison operator ("equals", "greater_than", etc.)
- `value`: Comparison value
- `logical_operator`: Logical operator ("AND", "OR")
- `variable_id`: Related variable UUID
- `type`: Condition type ("entry", "diagnosis")
- `reference_id`: Reference to related entity

## Usage Examples

### Node.js with fetch

```javascript
const API_KEY = "your-api-key";
const BASE_URL = "https://your-app.com";

async function getFlows() {
  try {
    const response = await fetch(`${BASE_URL}/api/flows`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data; // Array of flows
  } catch (error) {
    console.error("Error fetching flows:", error);
    throw error;
  }
}
```

### Python with requests

```python
import requests

API_KEY = "your-api-key"
BASE_URL = "https://your-app.com"

def get_flows():
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(f"{BASE_URL}/api/flows", headers=headers)
        response.raise_for_status()
        return response.json()["data"]
    except requests.exceptions.RequestException as e:
        print(f"Error fetching flows: {e}")
        raise
```

## Security Considerations

1. **API Key Storage**: API keys are encrypted before storage using AES-256-GCM encryption
2. **Environment Variables**: The encryption key must be stored securely as an environment variable
3. **HTTPS**: Always use HTTPS in production to protect API keys in transit
4. **Key Rotation**: Regularly rotate API keys for enhanced security
5. **Access Control**: Only published flow versions are accessible via the API

## Testing

Use the provided test script to verify your API setup:

```bash
node scripts/test-api.js
```

Make sure to update the API key and base URL in the script before running.

## Troubleshooting

### Common Issues

1. **"API key not configured"**: Set up an API key in the dashboard settings
2. **"Invalid API key"**: Verify the API key is correct and properly formatted
3. **"Missing authorization header"**: Include the `Authorization: Bearer <key>` header
4. **Empty data array**: No flows are currently published - publish a flow version first

### Debug Steps

1. Check that the `API_ENCRYPTION_KEY` environment variable is set
2. Verify the API key is configured in `/dashboard/settings`
3. Ensure at least one flow version is published
4. Test with the provided test script
5. Check server logs for detailed error information
