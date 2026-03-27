
## 1 Setup AWS CLI

Install AWS CLI, then configure credentials:

```bash
aws configure
```

Check it works:

```bash
aws sts get-caller-identity
```

## 2 Setup Serverless Framework

Use Node.js 22 or newer locally.

Install Serverless globally:

```bash
npm install -g serverless
```

Install project dependencies:

```bash
npm install
```

Deploy:

```bash
sls deploy
```

Get API base URL from output (example):

`https://<api-id>.execute-api.us-east-1.amazonaws.com`

## 3 Test With 4 curl Commands

Set your API base URL first:

```bash
export API_BASE="https://<api-id>.execute-api.us-east-1.amazonaws.com"
```

### Curl 1 - Create upload URL (print response in terminal)

```bash
RESP=$(curl -sS -X POST "$API_BASE/uploads" \
  -H "Content-Type: application/json" \
  -d '{"contentType":"text/plain"}')
echo "$RESP" | jq .
```

### Curl 2 - Check status (first time)

```bash
UPLOAD_ID=$(echo "$RESP" | jq -r '.uploadId'); curl -s "$API_BASE/uploads/$UPLOAD_ID" | jq .
```

### Curl 3 - Upload file to S3

```bash
echo "hello upload test" > sample.txt; UPLOAD_URL=$(echo "$RESP" | jq -r '.uploadUrl'); CONTENT_TYPE=$(echo "$RESP" | jq -r '.contentType'); curl -i -X PUT "$UPLOAD_URL" -H "Content-Type: $CONTENT_TYPE" --data-binary @sample.txt
```


### Curl 4 - Check status again (after async processing)

```bash
sleep 5 && curl -s "$API_BASE/uploads/$UPLOAD_ID" | jq .
```

