FROM golang:1.20-alpine AS builder
WORKDIR /srcnew
COPY go.mod go.sum ./
RUN go mod download
COPY . .
#ENV GO111MODULE=on
RUN CGO_ENABLED=0 go build -o /bin/app ./cmd

FROM alpine
WORKDIR /srcnew
COPY --from=builder /bin/app /bin/app
COPY --from=builder /srcnew/views /srcnew/views
COPY --from=builder /srcnew/assets /srcnew/assets

ENTRYPOINT ["/bin/app"]
