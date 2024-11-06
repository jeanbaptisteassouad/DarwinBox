use serde::Serialize;

#[derive(Debug, Serialize, Clone, PartialEq, Eq)]
pub struct DirectoryNode {
    pub id: i32,
    pub name: String,
    pub subs: Vec<DirectoryNode>,
}
