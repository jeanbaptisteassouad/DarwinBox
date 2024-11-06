//! This is the backend of DarwinBox application.

use axum::{
    routing::{get, post},
    Router,
};
use std::time::Duration;
use tower::ServiceBuilder;
use tower_http::{
    compression::CompressionLayer, cors::CorsLayer, timeout::TimeoutLayer, trace::TraceLayer,
};

mod app_state;
mod business_logic;
mod db;
mod handlers;

/// Main entrypoint that builds the app and starts the axum server.
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let _ = dotenv::dotenv();

    tracing_subscriber::fmt::init();

    let app_state = app_state::AppState::new().await?;

    let app = Router::new()
        .route(
            "/api/directories/:directory_id",
            get(handlers::directories::list)
                .put(handlers::directories::rename)
                .delete(handlers::directories::delete),
        )
        .route(
            "/api/directories",
            post(handlers::directories::create).get(handlers::directories::list_all),
        )
        .route(
            "/api/listen_directory_changes",
            get(handlers::directory_changes::handler),
        )
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(TimeoutLayer::new(Duration::from_secs(30)))
                .layer(CorsLayer::permissive())
                .layer(
                    CompressionLayer::new()
                        .gzip(true)
                        .deflate(true)
                        .br(true)
                        .zstd(true),
                ),
        )
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind(
        std::env::var("AXUM_TOKIO_BIND_ADDRESS").expect("AXUM_TOKIO_BIND_ADDRESS must be defined"),
    )
    .await?;
    axum::serve(listener, app).await?;

    Ok(())
}
