#!/bin/bash
set -e
KCADM=/opt/keycloak/bin/kcadm.sh

echo "Authenticating..."
$KCADM config credentials --server http://localhost:8080 --realm master --user admin --password admin

echo "Creating Realm ecom-realm..."
$KCADM create realms -s realm=ecom-realm -s enabled=true

echo "Creating Client ecom-client..."
$KCADM create clients -r ecom-realm -s clientId=ecom-client -s enabled=true -s publicClient=true -s 'redirectUris=["http://localhost:4200/*"]' -s 'webOrigins=["*"]'

echo "Creating User user1..."
$KCADM create users -r ecom-realm -s username=user1 -s enabled=true

echo "Setting Password for user1..."
$KCADM set-password -r ecom-realm --username user1 --new-password password

echo "Keycloak Configuration Complete!"
