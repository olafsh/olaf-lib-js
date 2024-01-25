#!/bin/bash

echo "Updating '/etc/hosts' file for the domain '$OLAF_DOMAIN' configuration..."

# Configuration to be added
config="# start $OLAF_DOMAIN
127.0.0.1 $OLAF_DOMAIN
# end $OLAF_DOMAIN"

# Path to the hosts file
hostsFile="/etc/hosts"

# Check if the configuration already exists
if ! grep -qF "$config" "$hostsFile"; then
    # If it doesn't exist, add the configuration
    echo "$config" | sudo tee -a "$hostsFile" > /dev/null
    echo "Configuration added to /etc/hosts successfully!"
else
    # If it already exists, display a message
    echo "Configuration already exists in /etc/hosts. Skipping..."
fi