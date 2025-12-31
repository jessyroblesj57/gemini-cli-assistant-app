#!/bin/bash

# Define the config file name
CONFIG_FILE="gemini_cli_bridge.json"

# Check if the config file exists in the current directory
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: $CONFIG_FILE not found in the current directory."
    exit 1
fi

echo "========================================================"
echo "Gemini CLI Bridge Setup"
echo "========================================================"
echo ""
echo "To connect your local Gemini CLI to this server, you need to"
echo "place the '$CONFIG_FILE' configuration file in your user home directory."
echo ""
echo "Configuration details:"
echo "----------------------"
cat "$CONFIG_FILE"
echo ""
echo "----------------------"
echo ""
echo "Instructions:"
echo "1. Verify the 'active_service_account' and 'oauth_client_id' in the JSON above match your credentials."
echo "2. Copy this file to your home directory."
echo ""
echo "   Run the following command:"
echo "   cp $CONFIG_FILE ~/gemini_cli_bridge.json"
echo ""
echo "3. Restart your local Gemini CLI."
echo "========================================================"
