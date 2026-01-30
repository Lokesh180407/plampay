#!/bin/bash

# Quick test script for Render deployment
# Usage: ./test-render.sh https://your-app.onrender.com

if [ -z "$1" ]; then
  echo "Usage: $0 <base-url>"
  echo "Example: $0 https://your-app.onrender.com"
  exit 1
fi

BASE_URL=$1

echo "🧪 Testing $BASE_URL"
echo ""

echo "1️⃣  GET / (root endpoint)"
curl -s "$BASE_URL/" | jq .
echo ""

echo "2️⃣  GET /api/health (health check)"
curl -s "$BASE_URL/api/health" | jq .
echo ""

echo "3️⃣  POST /api/auth/signup (no data - expect 400)"
curl -s -X POST "$BASE_URL/api/auth/signup" -H "Content-Type: application/json" | jq .
echo ""

echo "4️⃣  POST /api/auth/login (no data - expect 400)"
curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" | jq .
echo ""

echo "5️⃣  GET /api/auth/signup (wrong method - expect 404)"
curl -s "$BASE_URL/api/auth/signup" | jq .
echo ""

echo "✅ If POST requests return 400 (validation error), routes are working!"
echo "❌ If POST requests return 404, routes are broken!"
