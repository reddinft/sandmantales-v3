#!/bin/bash
# Usage: bash scripts/test-generate.sh
# Requires: server running on localhost:3000
curl -s -X POST http://localhost:3000/api/story/generate \
  -H "Content-Type: application/json" \
  -d '{"childName":"Emma","childAge":5,"prompt":"Today Emma found a tiny dragon in the garden"}' \
  | python3 -m json.tool
