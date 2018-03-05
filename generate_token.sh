#!/bin/bash

rm -rf api/.config
mkdir -p api/.config
echo "{\"token\": \"$(hexdump -n 16 -e '4/4 "%08X" 1 "\n"' /dev/random)\"}" > api/.config/token.json
echo "token generated. see api/.config/token.json"
