#!/bin/bash
echo "Starting FB AutoPoster..."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3001"
echo ""
cd "$(dirname "$0")"
npm run dev
