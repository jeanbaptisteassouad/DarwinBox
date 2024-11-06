use super::directory_node::DirectoryNode;
use crate::db::directories::ListDirectory;
use std::collections::HashMap;

/// This is a tree builder that takes a vector of ListDirectory and
/// helps us to construct a DirectoryNode.
#[derive(Debug)]
pub struct DirectoryTreeBuilder {
    map: HashMap<i32, DirectoryTreeBuilderEntry>,
    root_ids: Vec<i32>,
}

impl DirectoryTreeBuilder {
    pub fn from_list(list: Vec<ListDirectory>) -> Self {
        let mut map: HashMap<i32, DirectoryTreeBuilderEntry> = HashMap::with_capacity(list.len());
        let mut root_ids: Vec<i32> = vec![];

        for dir in list {
            let (Some(id), Some(name)) = (dir.id, dir.name) else {
                continue;
            };

            map.insert(
                id,
                DirectoryTreeBuilderEntry {
                    name,
                    children: vec![],
                },
            );

            let Some(parent_id) = dir.parent_id else {
                // Register id as root_id.
                root_ids.push(id);
                continue;
            };

            if map.contains_key(&parent_id) {
                map.get_mut(&parent_id)
                    .expect("is impossible")
                    .children
                    .push(id);
            }
        }

        Self { map, root_ids }
    }

    /// This function expects that id is a valid key of map.
    fn recursively_build_tree(
        id: i32,
        map: &mut HashMap<i32, DirectoryTreeBuilderEntry>,
    ) -> DirectoryNode {
        let entry = map.remove(&id).expect("is impossible");
        DirectoryNode {
            id,
            name: entry.name,
            subs: entry
                .children
                .into_iter()
                .map(|id| Self::recursively_build_tree(id, map))
                .collect(),
        }
    }

    pub fn into_node(mut self, directory_id: i32) -> anyhow::Result<DirectoryNode> {
        if !self.map.contains_key(&directory_id) {
            return Err(anyhow::anyhow!(
                "DirectoryTreeBuilder: map does not contain the key {directory_id}"
            ));
        }

        Ok(Self::recursively_build_tree(directory_id, &mut self.map))
    }

    pub fn into_root(mut self) -> DirectoryNode {
        let mut root = DirectoryNode {
            id: 0,
            name: String::new(),
            subs: vec![],
        };

        for root_id in self.root_ids {
            root.subs
                .push(Self::recursively_build_tree(root_id, &mut self.map));
        }

        root
    }
}

#[derive(Debug, Default)]
struct DirectoryTreeBuilderEntry {
    name: String,
    children: Vec<i32>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn with_empty_list() {
        let builder = DirectoryTreeBuilder::from_list(vec![]);

        assert_eq!(
            builder.into_root(),
            DirectoryNode {
                id: 0,
                name: String::new(),
                subs: vec![],
            }
        );
    }

    #[test]
    fn into_root_simple_test() {
        let builder = DirectoryTreeBuilder::from_list(vec![
            ListDirectory {
                id: 1.into(),
                name: "util".to_string().into(),
                parent_id: None,
            },
            ListDirectory {
                id: 2.into(),
                name: "src".to_string().into(),
                parent_id: None,
            },
            ListDirectory {
                id: 3.into(),
                name: "bin".to_string().into(),
                parent_id: 1.into(),
            },
            ListDirectory {
                id: 4.into(),
                name: "var".to_string().into(),
                parent_id: 1.into(),
            },
            ListDirectory {
                id: 5.into(),
                name: "usr".to_string().into(),
                parent_id: 3.into(),
            },
        ]);

        assert_eq!(
            builder.into_root(),
            DirectoryNode {
                id: 0,
                name: String::new(),
                subs: vec![
                    DirectoryNode {
                        id: 1,
                        name: "util".into(),
                        subs: vec![
                            DirectoryNode {
                                id: 3,
                                name: "bin".into(),
                                subs: vec![DirectoryNode {
                                    id: 5,
                                    name: "usr".into(),
                                    subs: vec![],
                                },],
                            },
                            DirectoryNode {
                                id: 4,
                                name: "var".into(),
                                subs: vec![],
                            },
                        ],
                    },
                    DirectoryNode {
                        id: 2,
                        name: "src".into(),
                        subs: vec![],
                    }
                ],
            }
        );
    }

    #[test]
    fn into_node_simple_test() {
        let builder = DirectoryTreeBuilder::from_list(vec![
            ListDirectory {
                id: 1.into(),
                name: "util".to_string().into(),
                parent_id: None,
            },
            ListDirectory {
                id: 2.into(),
                name: "src".to_string().into(),
                parent_id: None,
            },
            ListDirectory {
                id: 3.into(),
                name: "bin".to_string().into(),
                parent_id: 1.into(),
            },
            ListDirectory {
                id: 4.into(),
                name: "var".to_string().into(),
                parent_id: 1.into(),
            },
            ListDirectory {
                id: 5.into(),
                name: "usr".to_string().into(),
                parent_id: 3.into(),
            },
        ]);

        assert_eq!(
            builder.into_node(1).expect("to not failed"),
            DirectoryNode {
                id: 1,
                name: "util".into(),
                subs: vec![
                    DirectoryNode {
                        id: 3,
                        name: "bin".into(),
                        subs: vec![DirectoryNode {
                            id: 5,
                            name: "usr".into(),
                            subs: vec![],
                        },],
                    },
                    DirectoryNode {
                        id: 4,
                        name: "var".into(),
                        subs: vec![],
                    },
                ],
            }
        );
    }
}
