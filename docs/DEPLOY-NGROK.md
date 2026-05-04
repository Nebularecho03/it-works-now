# Ngrok Deployment Script

A Go-based deployment script that automatically configures ngrok tunnels and updates the `.env` file with the dynamic ngrok URL. Uses goroutines for concurrent operations.

## Features

- **Concurrent ngrok tunnel management**: Starts ngrok and monitors its status in parallel
- **Dynamic .env configuration**: Automatically updates domain configuration with ngrok URL
- **Parallel website deployment**: Starts the website development server concurrently with ngrok
- **Graceful shutdown**: Handles interrupt signals for clean termination

## Prerequisites

- Go 1.16 or higher
- ngrok installed and authenticated
- Node.js and npm installed

## Installation

1. Ensure ngrok is installed and authenticated:
```bash
ngrok authtoken YOUR_AUTH_TOKEN
```

2. The Go module is already initialized in the repository.

## Usage

Run the deployment script:

```bash
go run deploy-ngrok.go
```

Or build and run:

```bash
go build -o deploy-ngrok deploy-ngrok.go
./deploy-ngrok
```

## How It Works

1. **Concurrent Startup**: The script starts both ngrok (port 3000) and the website development server in parallel using goroutines
2. **URL Polling**: Continuously polls the ngrok API (`http://127.0.0.1:4040/api/tunnels`) to detect when the tunnel is ready
3. **Environment Configuration**: Once the ngrok URL is available, it updates the `.env` file with:
   - `DOMAIN_NAME`: The ngrok HTTPS URL
   - `WEBSITE_URL`: The ngrok HTTPS URL
   - `SCHOLARS_URL`: Scholars subdomain URL
   - `CORS_ORIGIN`: The ngrok URL
   - `ADMIN_ALLOWED_ORIGIN`: The ngrok URL
   - `NEXTAUTH_URL`: The ngrok URL
4. **Monitoring**: Continues running until interrupted (Ctrl+C)

## Stopping the Deployment

Press `Ctrl+C` to gracefully stop both ngrok and the website server.

## Configuration

The script uses the following paths (can be modified in the constants):

- `websiteDir`: `/home/codecrafter/Documents/combined/website`
- `envFile`: `/home/codecrafter/Documents/combined/.env`
- `ngrokAPI`: `http://127.0.0.1:4040/api/tunnels`

## Troubleshooting

- **ngrok not starting**: Ensure ngrok is installed and authenticated
- **Website not starting**: Ensure Node.js dependencies are installed in the website directory
- **.env not updating**: Check file permissions for the `.env` file
