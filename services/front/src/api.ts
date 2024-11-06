// In the future, we should validate the data at runtime
// and generate types from the backend.

type ApiListAllOutputPayload = {
  root: ApiDirectoryNode;
};

export type ApiDirectoryNode = {
  id: number;
  name: string;
  subs: Array<ApiDirectoryNode>;
};

const api_origin: string =
  (import.meta.env.VITE_API_ORIGIN as unknown as string | undefined) ?? "";
const ws_origin: string =
  (import.meta.env.VITE_WS_ORIGIN as unknown as string | undefined) ?? "";

export const fetchAllDirectories = async (): Promise<ApiDirectoryNode> => {
  const response = await fetch(`${api_origin}/api/directories`);
  if (!response.ok) {
    throw new Error("Failed to fetch all directories");
  }
  const data = (await response.json()) as unknown as ApiListAllOutputPayload;
  return data.root;
};

export const renameDirectory = async (
  directory_id: number,
  name: string,
): Promise<void> => {
  const response = await fetch(
    `${api_origin}/api/directories/${directory_id.toString()}`,
    {
      method: "PUT",
      body: JSON.stringify({ name }),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to rename directory");
  }
};

export const deleteDirectory = async (directory_id: number): Promise<void> => {
  const response = await fetch(
    `${api_origin}/api/directories/${directory_id.toString()}`,
    {
      method: "DELETE",
    },
  );
  if (!response.ok) {
    throw new Error("Failed to delete directory");
  }
};

type ApiCreateOutputPayload = {
  id: number;
};

export const createDirectory = async (
  name: string,
  parentId: null | number,
): Promise<number> => {
  const response = await fetch(`${api_origin}/api/directories`, {
    method: "POST",
    body: JSON.stringify({ name, parent_id: parentId }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete directory");
  }
  const data = (await response.json()) as unknown as ApiCreateOutputPayload;
  return data.id;
};

export type ApiDirectoryChanges = {
  action: "UPDATE" | "DELETE" | "INSERT";
  id: number;
  name: string;
  parent_id: null | number;
};

export const listenDirectoryChanges = (
  callback: (change: ApiDirectoryChanges) => void,
) => {
  const socket = new WebSocket(`${ws_origin}/api/listen_directory_changes`);

  socket.addEventListener("message", (event) => {
    try {
      const change = JSON.parse(
        event.data as string,
      ) as unknown as ApiDirectoryChanges;
      callback(change);
    } catch {
      console.error("Failed to parse websocket message.");
    }
  });
};
