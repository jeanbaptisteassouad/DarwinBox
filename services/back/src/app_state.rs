use crate::db::directory_changes_listener::DirectoryChangesListener;
use sqlx::PgPool;

#[derive(Debug, Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub directory_changes_listener: DirectoryChangesListener,
}

impl AppState {
    pub async fn new() -> anyhow::Result<Self> {
        let pool = PgPool::connect(
            std::env::var("DATABASE_URL")
                .expect("DATABASE_URL must be defined")
                .as_str(),
        )
        .await?;

        let directory_changes_listener = DirectoryChangesListener::new();

        Ok(Self {
            pool,
            directory_changes_listener,
        })
    }
}
