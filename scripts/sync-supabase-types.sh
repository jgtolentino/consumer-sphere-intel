#!/bin/bash

# Supabase Schema Auto-Sync Script
# Automatically generates TypeScript types from Supabase schema

echo "🔄 Syncing Supabase Types..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check if Supabase is linked
if [ ! -f "supabase/config.toml" ]; then
    echo "⚠️ Supabase project not linked. Please run 'supabase link' first."
    exit 1
fi

# Generate TypeScript types
echo "📝 Generating TypeScript types from schema..."
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts

# Check if generation was successful
if [ $? -eq 0 ]; then
    echo "✅ Supabase types generated successfully!"
    echo "📁 Types saved to: src/integrations/supabase/types.ts"
    
    # Format the generated file
    if command -v prettier &> /dev/null; then
        echo "🎨 Formatting generated types..."
        npx prettier --write src/integrations/supabase/types.ts
    fi
    
    # Show type summary
    echo ""
    echo "📊 Type Summary:"
    grep "export interface" src/integrations/supabase/types.ts | wc -l | xargs echo "   - Interfaces:"
    grep "export type" src/integrations/supabase/types.ts | wc -l | xargs echo "   - Types:"
    
else
    echo "❌ Failed to generate Supabase types"
    echo "💡 Make sure your Supabase project is linked and accessible"
    exit 1
fi

echo ""
echo "🚀 Schema sync complete!"