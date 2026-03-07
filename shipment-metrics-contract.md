# Endpoint Contract: Shipment Financial Metrics

## Endpoint Signature
- Method: `GET`
- URL: `/api/shipment/metrics?year=<number>&month=<number>`
- Auth: `Bearer JWT` (only `administrator`)
- Headers:
  - `Accept: application/json`
  - `Authorization: Bearer <JWT_ADMIN>`

## Request Query Params
```ts
type GetShipmentMetricsRequest = {
  year: number;  // 2000..2100
  month: number; // 1..12
};
```

## Business Rules
- `year` must be an integer between `2000` and `2100`.
- `month` must be an integer between `1` and `12`.
- Default currency is `COP`.
- Counted statuses for billing: `[1,2,4,5]`.
  - `1 = ACTIVE`
  - `2 = DELIVERED`
  - `4 = DELAYED`
  - `5 = PENDING`
- `3 = CANCELLED` is not counted.

## Response Contract
```ts
type ShipmentMetricsResponse = {
  period: {
    year: number;
    month: number;
    label: string; // Example: "Enero 2026"
  };
  currency: string; // "COP"
  totalShipments: number;
  totalAmount: number;
  averageTicket: number;
  countedStatuses: number[]; // Example: [1,2,4,5]
  byStatus: Array<{
    statusId: number;
    totalShipments: number;
    totalAmount: number;
  }>;
};
```

## Example Request
```http
GET /api/shipment/metrics?year=2026&month=1
Authorization: Bearer <JWT_ADMIN>
Accept: application/json
```

## Example cURL
```bash
curl --request GET "http://localhost:3000/api/shipment/metrics?year=2026&month=1" \
  --header "Authorization: Bearer TU_JWT_DE_ADMIN" \
  --header "Accept: application/json"
```

## Example 200 Response
```json
{
  "period": { "year": 2026, "month": 1, "label": "Enero 2026" },
  "currency": "COP",
  "totalShipments": 128,
  "totalAmount": 25480000,
  "averageTicket": 199062.5,
  "countedStatuses": [1, 2, 4, 5],
  "byStatus": [
    { "statusId": 1, "totalShipments": 30, "totalAmount": 5200000 },
    { "statusId": 2, "totalShipments": 70, "totalAmount": 16000000 },
    { "statusId": 4, "totalShipments": 18, "totalAmount": 3200000 },
    { "statusId": 5, "totalShipments": 10, "totalAmount": 1080000 }
  ]
}
```

## Error Examples

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Query param \"month\" must be between 1 and 12",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```
