# Syncer

## Test Utils

### Creating localhost certificates

#### Windows

Add the following to a openssl.cnf file

```
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = localhost

[v3_req]
subjectAltName = DNS:localhost
keyUsage = digitalSignature
extendedKeyUsage = serverAuth
```

Run the following command

```
openssl req -x509 -out localhost.crt -keyout localhost.key -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" -config openssl.cnf -extensions v3_req
```
