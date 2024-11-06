//! Contains the websocket handler related to directory changes.

use crate::app_state::AppState;
use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    extract::State,
    response::Response,
};
use tokio::sync::broadcast::Receiver;

pub async fn handler(ws: WebSocketUpgrade, State(app_state): State<AppState>) -> Response {
    ws.on_upgrade(move |socket| {
        handle_socket(socket, app_state.directory_changes_listener.subscribe())
    })
}

async fn handle_socket(mut socket: WebSocket, mut receiver: Receiver<String>) {
    while let Ok(payload) = receiver.recv().await {
        if socket.send(Message::Text(payload)).await.is_err() {
            // client disconnected
            return;
        }
    }
}
