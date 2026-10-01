import urllib.request
import json

url = "https://itcinrndiksntttkivlh.supabase.co/storage/v1/bucket"
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0Y2lucm5kaWtzbnR0dGtpdmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MTc1MTIsImV4cCI6MjEwMzI5MzUxMn0.h4IIl6USb4YMAIFzxxJnfRnzghHMiwRvw3F-c921OSY"

print("=== CREATING SUPABASE STORAGE BUCKET 'product-photos' ===")

data = {
    "id": "product-photos",
    "name": "product-photos",
    "public": True
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={
    "apikey": anon_key,
    "Authorization": f"Bearer {anon_key}",
    "Content-Type": "application/json"
}, method="POST")

try:
    with urllib.request.urlopen(req) as response:
        print("✓ Storage Bucket 'product-photos' created successfully on Supabase Cloud!")
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    err_body = e.read().decode('utf-8')
    print(f"Bucket Creation Response ({e.code}): {err_body}")
except Exception as e:
    print("Error creating bucket:", e)
