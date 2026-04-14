FROM heroiclabs/nakama-pluginbuilder:3.22.0 AS builder

WORKDIR /backend

COPY . .

RUN go build --trimpath --buildmode=plugin -o tic-tac-toe-nakama.so

FROM alpine:latest

COPY --from=builder /backend/tic-tac-toe-nakama.so /tic-tac-toe-nakama.so