use sqlx::{FromRow, PgPool};

#[derive(Debug, FromRow)]
pub struct InsertDirectory {
    pub id: i32,
}

pub async fn insert(
    pool: &PgPool,
    name: &str,
    parent_id: Option<i32>,
) -> anyhow::Result<InsertDirectory> {
    let directory = sqlx::query_as!(
        InsertDirectory,
        "
        INSERT INTO directories (name, parent_id)
        VALUES ($1, $2)
        RETURNING id
        ",
        name,
        parent_id,
    )
    .fetch_one(pool)
    .await?;

    Ok(directory)
}

pub async fn update_name(pool: &PgPool, id: i32, name: &str) -> anyhow::Result<()> {
    sqlx::query!(
        "
        UPDATE directories
        SET name = $1
        WHERE id = $2;
        ",
        name,
        id,
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn delete(pool: &PgPool, id: i32) -> anyhow::Result<()> {
    sqlx::query!(
        "
        DELETE FROM directories WHERE id = $1;
        ",
        id,
    )
    .execute(pool)
    .await?;

    Ok(())
}

#[derive(Debug, FromRow)]
pub struct ListDirectory {
    pub id: Option<i32>,
    pub name: Option<String>,
    pub parent_id: Option<i32>,
}

pub async fn list_directory_and_subdirectories(
    pool: &PgPool,
    id: i32,
) -> anyhow::Result<Vec<ListDirectory>> {
    let vec: Vec<ListDirectory> = sqlx::query_as!(
        ListDirectory,
        "
        WITH RECURSIVE parents AS (
            -- Start with the specified directory
            SELECT d.id, d.name, d.parent_id
            FROM directories as d
            WHERE d.id = $1
            UNION ALL
            -- Recursively find all child directories
            SELECT d.id, d.name, d.parent_id
            FROM directories as d
            INNER JOIN parents as p ON d.parent_id = p.id
        )
        SELECT * FROM parents;
        ",
        id,
    )
    .fetch_all(pool)
    .await?;

    Ok(vec)
}

pub async fn list_directory_and_subdirectories_from_root(
    pool: &PgPool,
) -> anyhow::Result<Vec<ListDirectory>> {
    let vec: Vec<ListDirectory> = sqlx::query_as!(
        ListDirectory,
        "
        WITH RECURSIVE parents AS (
            -- Start with the specified directory
            SELECT d.id, d.name, d.parent_id
            FROM directories as d
            WHERE d.parent_id IS NULL
            UNION ALL
            -- Recursively find all child directories
            SELECT d.id, d.name, d.parent_id
            FROM directories as d
            INNER JOIN parents as p ON d.parent_id = p.id
        )
        SELECT * FROM parents;
        "
    )
    .fetch_all(pool)
    .await?;

    Ok(vec)
}
