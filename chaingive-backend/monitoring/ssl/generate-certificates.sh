#!/bin/bash

# Generate SSL certificates for monitoring stack
# Run this script to create self-signed certificates for development/testing

set -e

CERT_DIR="./ssl"
DAYS=365
COUNTRY="NG"
STATE="Lagos"
CITY="Lagos"
ORG="ChainGive"
OU="DevOps"
EMAIL="admin@chaingive.com"

# Create certificate directory
mkdir -p "$CERT_DIR/certs" "$CERT_DIR/private"

echo "Generating SSL certificates for ChainGive monitoring..."

# Generate CA private key
openssl genrsa -out "$CERT_DIR/private/ca.key" 4096

# Generate CA certificate
openssl req -x509 -new -nodes -key "$CERT_DIR/private/ca.key" \
    -sha256 -days 1024 -out "$CERT_DIR/certs/ca.crt" \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$OU/CN=ChainGive Monitoring CA/emailAddress=$EMAIL"

# Generate server private key
openssl genrsa -out "$CERT_DIR/private/monitoring.chaingive.com.key" 2048

# Generate certificate signing request
openssl req -new -key "$CERT_DIR/private/monitoring.chaingive.com.key" \
    -out "$CERT_DIR/monitoring.chaingive.com.csr" \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$OU/CN=monitoring.chaingive.com/emailAddress=$EMAIL"

# Create extensions file for SAN
cat > "$CERT_DIR/monitoring.chaingive.com.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = monitoring.chaingive.com
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF

# Generate server certificate
openssl x509 -req -in "$CERT_DIR/monitoring.chaingive.com.csr" \
    -CA "$CERT_DIR/certs/ca.crt" -CAkey "$CERT_DIR/private/ca.key" \
    -CAcreateserial -out "$CERT_DIR/certs/monitoring.chaingive.com.crt" \
    -days $DAYS -sha256 -extfile "$CERT_DIR/monitoring.chaingive.com.ext"

# Generate Prometheus certificate
openssl genrsa -out "$CERT_DIR/private/prometheus.key" 2048
openssl req -new -key "$CERT_DIR/private/prometheus.key" \
    -out "$CERT_DIR/prometheus.csr" \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=Prometheus/CN=prometheus.chaingive.com/emailAddress=$EMAIL"

cat > "$CERT_DIR/prometheus.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = prometheus.chaingive.com
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF

openssl x509 -req -in "$CERT_DIR/prometheus.csr" \
    -CA "$CERT_DIR/certs/ca.crt" -CAkey "$CERT_DIR/private/ca.key" \
    -CAcreateserial -out "$CERT_DIR/certs/prometheus.crt" \
    -days $DAYS -sha256 -extfile "$CERT_DIR/prometheus.ext"

# Generate AlertManager certificate
openssl genrsa -out "$CERT_DIR/private/alertmanager.key" 2048
openssl req -new -key "$CERT_DIR/private/alertmanager.key" \
    -out "$CERT_DIR/alertmanager.csr" \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=AlertManager/CN=alertmanager.chaingive.com/emailAddress=$EMAIL"

cat > "$CERT_DIR/alertmanager.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = alertmanager.chaingive.com
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF

openssl x509 -req -in "$CERT_DIR/alertmanager.csr" \
    -CA "$CERT_DIR/certs/ca.crt" -CAkey "$CERT_DIR/private/ca.key" \
    -CAcreateserial -out "$CERT_DIR/certs/alertmanager.crt" \
    -days $DAYS -sha256 -extfile "$CERT_DIR/alertmanager.ext"

# Generate Grafana certificate
openssl genrsa -out "$CERT_DIR/private/grafana.key" 2048
openssl req -new -key "$CERT_DIR/private/grafana.key" \
    -out "$CERT_DIR/grafana.csr" \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=Grafana/CN=grafana.chaingive.com/emailAddress=$EMAIL"

cat > "$CERT_DIR/grafana.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = grafana.chaingive.com
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF

openssl x509 -req -in "$CERT_DIR/grafana.csr" \
    -CA "$CERT_DIR/certs/ca.crt" -CAkey "$CERT_DIR/private/ca.key" \
    -CAcreateserial -out "$CERT_DIR/certs/grafana.crt" \
    -days $DAYS -sha256 -extfile "$CERT_DIR/grafana.ext"

# Generate htpasswd for nginx basic auth
docker run --rm -v "$PWD/monitoring:/work" alpine:latest sh -c "
    apk add --no-cache apache2-utils
    htpasswd -bc /work/.htpasswd admin changeme123
    htpasswd -b /work/.htpasswd readonly readonly123
"

# Generate Grafana admin password secret
echo -n "changeme123" > monitoring/secrets/grafana_admin_password

# Clean up temporary files
rm -f "$CERT_DIR"/*.csr "$CERT_DIR"/*.ext "$CERT_DIR"/ca.srl

# Set proper permissions
chmod 600 "$CERT_DIR/private"/*
chmod 644 "$CERT_DIR/certs"/*

echo "SSL certificates generated successfully!"
echo ""
echo "Certificate files created:"
echo "- CA Certificate: $CERT_DIR/certs/ca.crt"
echo "- Monitoring Certificate: $CERT_DIR/certs/monitoring.chaingive.com.crt"
echo "- Prometheus Certificate: $CERT_DIR/certs/prometheus.crt"
echo "- AlertManager Certificate: $CERT_DIR/certs/alertmanager.crt"
echo "- Grafana Certificate: $CERT_DIR/certs/grafana.crt"
echo ""
echo "Private keys:"
echo "- Monitoring Key: $CERT_DIR/private/monitoring.chaingive.com.key"
echo "- Prometheus Key: $CERT_DIR/private/prometheus.key"
echo "- AlertManager Key: $CERT_DIR/private/alertmanager.key"
echo "- Grafana Key: $CERT_DIR/private/grafana.key"
echo ""
echo "Basic auth credentials:"
echo "- Admin: admin/changeme123"
echo "- Read-only: readonly/readonly123"
echo ""
echo "⚠️  IMPORTANT: Change default passwords in production!"
echo "📝 Update monitoring/alertmanager.yml with your SMTP settings"
echo "🔒 Add the CA certificate to your system's trust store for proper SSL validation"