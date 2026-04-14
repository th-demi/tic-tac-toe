FROM golang:1.23 AS builder

WORKDIR /backend

COPY . .

RUN go mod tidy
RUN go build -buildmode=plugin -o backend.so

FROM heroiclabs/nakama:3.22.0

COPY --from=builder /backend/backend.so /nakama/data/modules/
COPY local.yml /nakama/data/