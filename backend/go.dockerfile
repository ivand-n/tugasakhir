FROM golang:1.25-alpine

# Install necessary build tools
RUN apk add --no-cache gcc musl-dev
WORKDIR /app

COPY . .

# Download and install dependencies
RUN go get -d -v ./...

# Build the Go app
RUN go build -o api .

EXPOSE 8000

CMD ["./api"]