#!/bin/sh

go mod tidy
go build -buildmode=plugin -o backend.so