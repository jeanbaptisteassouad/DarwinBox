FROM rust:1.82 AS build

WORKDIR /app

RUN rustup component add rustfmt clippy
RUN cargo install sqlx-cli

COPY .sqlx .sqlx
COPY migrations migrations
COPY src src
COPY Cargo.lock Cargo.lock
COPY Cargo.toml Cargo.toml

RUN cargo fmt --check
RUN cargo clippy
RUN cargo test
RUN cargo sqlx prepare --check

RUN cargo build --release

FROM debian:bookworm

RUN apt-get update && apt-get install -y libssl3 && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/release/back /app/back
COPY --from=build /usr/local/cargo/bin/sqlx /app/sqlx
COPY --from=build /app/migrations /app/migrations

ENTRYPOINT ["/app/back"]
