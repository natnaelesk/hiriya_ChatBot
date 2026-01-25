# Create deploy.sh
#!/bin/bash
echo "Deploying RAG server to Railway..."

# Install Railway CLI if needed
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway up --service rag-server

echo "✅ Deployment complete!"