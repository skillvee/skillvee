#!/bin/bash

# Helper script to run Supabase CLI commands with token from .env
if [ -f .env ]; then
    export $(cat .env | grep SUPABASE_ACCESS_TOKEN | xargs)
fi

supabase "$@"