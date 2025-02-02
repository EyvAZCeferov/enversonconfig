# FROM golang:1.20-alpine
# WORKDIR /src
# COPY go.mod go.sum ./
# RUN go mod download
# COPY . .
# ENV GO111MODULE=on
# RUN CGO_ENABLED=0 go build -o /bin/app ./cmd

# FROM alpine
# WORKDIR /src
# COPY --from=0 /bin/app /bin/app
# COPY --from=0 /src/views /src/views
# COPY --from=0 /src/assets /src/assets
# ENTRYPOINT ["/bin/app"]


# Stage 1: Build the Go application
FROM golang:1.20-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
ENV GO111MODULE=on
RUN CGO_ENABLED=0 go build -o /bin/app ./cmd

# Stage 2: Create a minimal runtime image
FROM alpine
WORKDIR /src
COPY --from=builder /bin/app /bin/app
COPY --from=builder /src/views /src/views
COPY --from=builder /src/assets /src/assets
ENTRYPOINT ["/bin/app"]
