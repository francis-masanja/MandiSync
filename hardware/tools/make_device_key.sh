#!/usr/bin/env bash
# Generate a random device secret for HMAC (Phase H2).
set -euo pipefail
SECRET=$(openssl rand -hex 32)
echo "DEVICE_SECRET=${SECRET}"
echo "Store this in the server device registry and in hardware/shared/config.h (local only)."
