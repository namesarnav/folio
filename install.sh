#!/bin/bash

git clone git@github.com:namesarnav/folio.git
cp .env.example .env
sed -i '' "s/^JWT_SECRET=.*/JWT_SECRET=$(openssl rand -hex 32)/" .env    
