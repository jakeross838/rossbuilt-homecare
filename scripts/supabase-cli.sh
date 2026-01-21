#!/bin/bash
# Supabase CLI wrapper that loads credentials from .env.supabase
# Usage: ./scripts/supabase-cli.sh <command>
# Example: ./scripts/supabase-cli.sh db push

# Load environment variables from .env.supabase
if [ -f ".env.supabase" ]; then
    export $(grep -v '^#' .env.supabase | xargs)
elif [ -f "../.env.supabase" ]; then
    export $(grep -v '^#' ../.env.supabase | xargs)
fi

# Run supabase command with all arguments
npx supabase "$@"
