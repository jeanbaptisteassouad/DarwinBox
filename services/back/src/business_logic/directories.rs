use super::directory_node::DirectoryNode;
use super::directory_tree_builder::DirectoryTreeBuilder;
use sqlx::PgPool;

/// Creates a new directory under the given parent directory.
pub async fn create(name: &str, parent_id: Option<i32>, pool: &PgPool) -> anyhow::Result<i32> {
    let dir = crate::db::directories::insert(pool, name, parent_id).await?;
    Ok(dir.id)
}

/// Returns the directory structure starting from the given directory ID,
/// including all its subdirectories.
pub async fn list(directory_id: i32, pool: &PgPool) -> anyhow::Result<DirectoryNode> {
    let list =
        crate::db::directories::list_directory_and_subdirectories(pool, directory_id).await?;

    DirectoryTreeBuilder::from_list(list).into_node(directory_id)
}

/// Returns the directory structure starting from the root.
pub async fn list_all(pool: &PgPool) -> anyhow::Result<DirectoryNode> {
    let list = crate::db::directories::list_directory_and_subdirectories_from_root(pool).await?;

    Ok(DirectoryTreeBuilder::from_list(list).into_root())
}

/// Renames the directory with the given ID.
/// Is idempotent.
pub async fn rename(directory_id: i32, name: &str, pool: &PgPool) -> anyhow::Result<()> {
    crate::db::directories::update_name(pool, directory_id, name).await
}

/// Deletes a directory and removes all its subdirectories recursively.
/// Is idempotent.
pub async fn delete(directory_id: i32, pool: &PgPool) -> anyhow::Result<()> {
    crate::db::directories::delete(pool, directory_id).await
}
