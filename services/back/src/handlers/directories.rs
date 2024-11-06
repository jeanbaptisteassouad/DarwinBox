//! Contains all the request handlers related to directories.

use crate::app_state::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct CreateInputPayload {
    name: String,
    parent_id: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct CreateOutputPayload {
    id: i32,
}

pub async fn create(
    State(app_state): State<AppState>,
    Json(payload): Json<CreateInputPayload>,
) -> Response {
    let Ok(id) = crate::business_logic::directories::create(
        payload.name.as_str(),
        payload.parent_id,
        &app_state.pool,
    )
    .await
    else {
        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    };

    Json(CreateOutputPayload { id }).into_response()
}

#[derive(Debug, Serialize)]
struct ListOutputPayload {
    dir: crate::business_logic::directory_node::DirectoryNode,
}

pub async fn list(State(app_state): State<AppState>, Path(directory_id): Path<i32>) -> Response {
    let Ok(dir) = crate::business_logic::directories::list(directory_id, &app_state.pool).await
    else {
        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    };

    Json(ListOutputPayload { dir }).into_response()
}

#[derive(Debug, Serialize)]
struct ListAllOutputPayload {
    root: crate::business_logic::directory_node::DirectoryNode,
}

pub async fn list_all(State(app_state): State<AppState>) -> Response {
    let Ok(root) = crate::business_logic::directories::list_all(&app_state.pool).await else {
        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    };

    Json(ListAllOutputPayload { root }).into_response()
}

#[derive(Debug, Deserialize)]
pub struct RenamePayload {
    name: String,
}

pub async fn rename(
    State(app_state): State<AppState>,
    Path(directory_id): Path<i32>,
    Json(payload): Json<RenamePayload>,
) -> impl IntoResponse {
    if crate::business_logic::directories::rename(
        directory_id,
        payload.name.as_str(),
        &app_state.pool,
    )
    .await
    .is_err()
    {
        StatusCode::INTERNAL_SERVER_ERROR
    } else {
        StatusCode::OK
    }
}

pub async fn delete(
    State(app_state): State<AppState>,
    Path(directory_id): Path<i32>,
) -> impl IntoResponse {
    if crate::business_logic::directories::delete(directory_id, &app_state.pool)
        .await
        .is_err()
    {
        StatusCode::INTERNAL_SERVER_ERROR
    } else {
        StatusCode::OK
    }
}
