use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::broadcast::{self, Receiver, Sender};

#[derive(Debug, Clone)]
pub struct DirectoryChangesListener {
    rx: Arc<Receiver<String>>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct Payload {
    action: ActionPayload,
    id: i32,
    name: String,
    parent_id: Option<i32>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "UPPERCASE")]
enum ActionPayload {
    Update,
    Delete,
    Insert,
}

impl DirectoryChangesListener {
    pub fn new() -> Self {
        let (tx, rx) = broadcast::channel(100);

        async fn task(tx: Sender<String>) -> anyhow::Result<()> {
            let mut listener = sqlx::postgres::PgListener::connect(
                std::env::var("DATABASE_URL")
                    .expect("DATABASE_URL must be defined")
                    .as_str(),
            )
            .await?;

            listener.listen("directory_changes").await?;

            loop {
                let notification = listener.recv().await?;
                let payload = notification.payload();

                // Validate payload schema.
                if serde_json::from_str::<Payload>(payload).is_err() {
                    tracing::error!("directory_changes: invalid payload {payload}");
                    continue;
                };

                tx.send(payload.to_string())?;
            }
        }

        tokio::spawn(task(tx));

        DirectoryChangesListener { rx: rx.into() }
    }

    pub fn subscribe(&self) -> Receiver<String> {
        self.rx.resubscribe()
    }
}
