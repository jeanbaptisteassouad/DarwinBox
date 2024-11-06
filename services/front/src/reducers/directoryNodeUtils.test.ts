import { describe, it } from "vitest";

import {
  insertDirectoryNodeById,
  updateDirectoryNodeById,
  deleteDirectoryNodeById,
} from "./directoryNodeUtils.ts";
import { StateDirectoryNodeStatus } from "./types.ts";

describe("directoryNodeUtils", () => {
  it("simple test for insertDirectoryNodeById", ({ expect }) => {
    const status: StateDirectoryNodeStatus = { type: "regular" };
    const node = {
      id: NaN,
      name: "",
      status,
      subs: [
        { id: 1, name: "src", status, subs: [] },
        {
          id: 2,
          name: "etc",
          status,
          subs: [
            { id: 4, name: "docker", status, subs: [] },
            { id: 5, name: "caddy", status, subs: [] },
            { id: 6, name: "systemd", status, subs: [] },
          ],
        },
        { id: 3, name: "var", status, subs: [] },
      ],
    };

    const newNode = { id: 7, name: "state.conf", status, subs: [] };

    const ans = insertDirectoryNodeById(node, 4, newNode);

    expect(ans).toEqual({
      id: NaN,
      name: "",
      status,
      subs: [
        { id: 1, name: "src", status, subs: [] },
        {
          id: 2,
          name: "etc",
          status,
          subs: [
            {
              id: 4,
              name: "docker",
              status,
              subs: [{ id: 7, name: "state.conf", status, subs: [] }],
            },
            { id: 5, name: "caddy", status, subs: [] },
            { id: 6, name: "systemd", status, subs: [] },
          ],
        },
        { id: 3, name: "var", status, subs: [] },
      ],
    });
  });
});

describe("directoryNodeUtils", () => {
  it("simple test for updateDirectoryNodeById", ({ expect }) => {
    const status: StateDirectoryNodeStatus = { type: "regular" };
    const node = {
      id: NaN,
      name: "",
      status,
      subs: [
        { id: 1, name: "src", status, subs: [] },
        {
          id: 2,
          name: "etc",
          status,
          subs: [
            { id: 4, name: "docker", status, subs: [] },
            { id: 5, name: "caddy", status, subs: [] },
            { id: 6, name: "systemd", status, subs: [] },
          ],
        },
        { id: 3, name: "var", status, subs: [] },
      ],
    };

    const ans = updateDirectoryNodeById(node, 4, (node) => ({
      ...node,
      name: "podman",
    }));

    expect(ans).toEqual({
      id: NaN,
      name: "",
      status,
      subs: [
        { id: 1, name: "src", status, subs: [] },
        {
          id: 2,
          name: "etc",
          status,
          subs: [
            { id: 5, name: "caddy", status, subs: [] },
            { id: 4, name: "podman", status, subs: [] },
            { id: 6, name: "systemd", status, subs: [] },
          ],
        },
        { id: 3, name: "var", status, subs: [] },
      ],
    });
  });
});

describe("directoryNodeUtils", () => {
  it("simple test for deleteDirectoryNodeById", ({ expect }) => {
    const status: StateDirectoryNodeStatus = { type: "regular" };
    const node = {
      id: NaN,
      name: "",
      status,
      subs: [
        { id: 1, name: "src", status, subs: [] },
        {
          id: 2,
          name: "etc",
          status,
          subs: [
            { id: 4, name: "docker", status, subs: [] },
            { id: 5, name: "caddy", status, subs: [] },
            { id: 6, name: "systemd", status, subs: [] },
          ],
        },
        { id: 3, name: "var", status, subs: [] },
      ],
    };

    const ans = deleteDirectoryNodeById(node, 2);

    expect(ans).toEqual({
      id: NaN,
      name: "",
      status,
      subs: [
        { id: 1, name: "src", status, subs: [] },
        { id: 3, name: "var", status, subs: [] },
      ],
    });
  });
});
