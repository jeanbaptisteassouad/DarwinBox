//! Contains the websocket handler related to directory changes.

use crate::app_state::AppState;
use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    extract::State,
    response::Response,
};
use std::sync::Arc;
use tokio::sync::broadcast::Receiver;

pub async fn handler(ws: WebSocketUpgrade, State(app_state): State<AppState>) -> Response {
    ws.on_upgrade(move |socket| {
        handle_socket(socket, app_state.directory_changes_listener.subscribe())
    })
}

async fn handle_socket(socket: WebSocket, mut receiver: Receiver<String>) {
    let socket = Arc::new(tokio::sync::Mutex::new(socket));

    // Heartbeat to keep the connection alive.
    let heartbeat_interval = tokio::time::Duration::from_secs(5);
    tokio::spawn({
        let socket = socket.clone();
        async move {
            let mut interval = tokio::time::interval(heartbeat_interval);
            loop {
                interval.tick().await;

                if socket
                    .lock()
                    .await
                    .send(Message::Ping(Vec::new()))
                    .await
                    .is_err()
                {
                    // client disconnected
                    break;
                }
            }
        }
    });

    while let Ok(payload) = receiver.recv().await {
        if socket
            .lock()
            .await
            .send(Message::Text(payload))
            .await
            .is_err()
        {
            // client disconnected
            return;
        }
    }
}
