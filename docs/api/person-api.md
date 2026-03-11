---
title: Person API
parent: API
---

The Person API provides endpoints for viewing, creating, editing and deleting
people, as well as an endpoint of syncing them.

## /person/sync

```json
{
  "platform": "mis",
  "platformId": "12345678",
  "person": {
    "firstName": "Sample",
    "lastName": "User"
  }
}
```

### Returns

| status | example                 |
| :----: | :---------------------- |
|  200   | `{result: 'no-change'}` |
