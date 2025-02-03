FROM golang:1.20-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
#ENV GO111MODULE=on
RUN CGO_ENABLED=0 go build -o /bin/app ./cmd

FROM alpine
WORKDIR /src
COPY --from=builder /bin/app /bin/app
COPY --from=builder /src/views /src/views
COPY --from=builder /src/assets /src/assets

ENTRYPOINT ["/bin/app"]
