import requests
import json
import time

url = "http://localhost:8000/api/webhooks/whatsapp"

payload = {
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "1234567890",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "1234567890",
              "phone_number_id": "tenant-a-luxury-furniture"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Test Customer"
                },
                "wa_id": "19876543210"
              }
            ],
            "messages": [
              {
                "from": "19876543210",
                "id": f"wamid.{int(time.time())}",
                "timestamp": str(int(time.time())),
                "text": {
                  "body": "Hello! Do you have any leather sofas in stock?"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}

headers = {
  'Content-Type': 'application/json'
}

print("Sending simulated WhatsApp message to backend...")
response = requests.post(url, headers=headers, data=json.dumps(payload))

print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    print("Success! Check your dashboard for the new message.")
else:
    print(response.text)
