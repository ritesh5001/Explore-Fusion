#!/bin/bash
EMAIL="testuser$(date +%s)@example.com"
PASS="password123"

echo "Registering $EMAIL..."
curl -s -X POST http://localhost:5050/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"$PASS\"}"

echo -e "\nLogging in..."
LOGIN_RES=$(curl -s -X POST http://localhost:5050/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")

TOKEN=$(echo $LOGIN_RES | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$TOKEN" ]; then
    echo "Login Failed: $LOGIN_RES"
    exit 1
fi

echo "Token: $TOKEN"

echo "Creating Post..."
curl -v -X POST http://localhost:5050/api/v1/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test Content","location":"Test Location","title":"Test Title"}'
